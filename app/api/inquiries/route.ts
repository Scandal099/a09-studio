import crypto from "node:crypto";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { z } from "zod";
import {
  classifyContact,
  codePointLength,
  escapeHtml,
  sanitizeText,
  sliceCodePoints,
} from "@/lib/contact";
import {
  CONSENT_VERSION,
  POLICY_VERSION,
  SERVICE_OPTIONS,
  siteContent,
} from "@/studio/content";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8192;
const MAX_TOTAL_LOG_BYTES = 100 * 1024 * 1024; // 100 MB disk-fill ceiling
const MAX_TELEGRAM_UTF16 = 3800; // Safe margin below Telegram's 4096 UTF-16 limit
const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Only allow attaching slots that are currently open
const OPEN_SLOT_BY_ID = new Map(
  siteContent.work.slots
    .filter((slot) => slot.status === "open")
    .map((slot) => [slot.id, slot])
);

const utmSchema = z
  .object({
    source: z.string().max(120).optional(),
    medium: z.string().max(120).optional(),
    campaign: z.string().max(120).optional(),
    content: z.string().max(120).optional(),
    term: z.string().max(120).optional(),
    yclid: z.string().max(120).optional(),
    gclid: z.string().max(120).optional(),
    referrer: z.string().max(240).optional(),
    landingUrl: z.string().max(240).optional(),
  })
  .strict()
  .optional();

const inquirySchema = z
  .object({
    idempotencyKey: z.string().regex(UUID_V4_RE).optional(),
    name: z.string().min(1).max(160),
    contact: z.string().min(4).max(200),
    service: z.enum(SERVICE_OPTIONS),
    slotId: z.enum(["", "01", "02", "03"]).optional().default(""),
    brief: z.string().max(3000).optional().default(""),
    consent: z.literal(true),
    consentVersion: z.literal(CONSENT_VERSION).optional(),
    policyVersion: z.literal(POLICY_VERSION).optional(),
    utm: utmSchema,
    website: z.string().max(200).optional().default(""),
    formRenderedAt: z.number().finite().optional(),
  })
  .strict();

interface RateBucket {
  shortWindow: number[];
  dayWindow: number[];
}

type IdempotencyEntry =
  | { state: "pending"; promise: Promise<string | null>; expiresAt: number }
  | { state: "done"; reference: string; expiresAt: number };

const rateBuckets = new Map<string, RateBucket>();
const idempotencyCache = new Map<string, IdempotencyEntry>();

const SHORT_WINDOW_MS = 10 * 60 * 1000;
const SHORT_LIMIT = 5;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const DAY_LIMIT = 20;
const IDEMPOTENCY_TTL_MS = 30 * 60 * 1000;

const MAX_RATE_BUCKETS = 10_000;
const MAX_IDEMPOTENCY_ENTRIES = 5_000;
const PRUNE_INTERVAL_MS = 60_000;

let lastRatePruneAt = 0;
let lastIdempotencyPruneAt = 0;
let fileWriteQueue: Promise<void> = Promise.resolve();

function normalizeIp(raw: string): string {
  const cleaned = raw.trim().replace(/^\[|\]$/g, "");
  const version = net.isIP(cleaned);
  if (version === 4) return cleaned;
  if (version === 6) {
    // Normalize IPv6 to /64 subnet prefix to deter per-address rotation bypass
    const lower = cleaned.toLowerCase();
    const parts = lower.split("::");
    let groups: string[];
    if (parts.length === 2) {
      const left = parts[0] ? parts[0].split(":") : [];
      const right = parts[1] ? parts[1].split(":") : [];
      const fill = Math.max(0, 8 - left.length - right.length);
      groups = [...left, ...Array<string>(fill).fill("0"), ...right];
    } else {
      groups = lower.split(":");
    }
    if (groups.length >= 4) {
      return `${groups
        .slice(0, 4)
        .map((g) => g.padStart(4, "0"))
        .join(":")}::/64`;
    }
    return lower;
  }
  return "";
}

function getClientIp(request: Request): string {
  const trustProxy = process.env.TRUST_PROXY === "true";
  if (trustProxy) {
    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
      const normalized = normalizeIp(realIp);
      if (normalized) return normalized;
    }
    // Standard Nginx proxy_add_x_forwarded_for appends the real peer IP on the right
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      const hops = forwarded
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);
      for (let i = hops.length - 1; i >= 0; i -= 1) {
        const normalized = normalizeIp(hops[i]);
        if (normalized) return normalized;
      }
    }
  }
  return "direct";
}

function pruneRateBuckets(now: number): void {
  if (now - lastRatePruneAt >= PRUNE_INTERVAL_MS && rateBuckets.size > 1000) {
    lastRatePruneAt = now;
    for (const [key, bucket] of rateBuckets.entries()) {
      if (bucket.dayWindow.every((ts) => now - ts >= DAY_WINDOW_MS)) {
        rateBuckets.delete(key);
      }
    }
  }
  // O(1) FIFO cap prevents OOM and O(N^2) degradation under IP floods
  while (rateBuckets.size >= MAX_RATE_BUCKETS) {
    const oldestKey = rateBuckets.keys().next().value;
    if (oldestKey === undefined) break;
    rateBuckets.delete(oldestKey);
  }
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  pruneRateBuckets(now);

  const existing = rateBuckets.get(ip);
  const bucket = existing ?? { shortWindow: [], dayWindow: [] };
  bucket.shortWindow = bucket.shortWindow.filter(
    (ts) => now - ts < SHORT_WINDOW_MS
  );
  bucket.dayWindow = bucket.dayWindow.filter((ts) => now - ts < DAY_WINDOW_MS);

  // Refresh insertion order for FIFO/LRU behavior
  if (existing) rateBuckets.delete(ip);

  if (bucket.shortWindow.length >= SHORT_LIMIT) {
    const oldest = bucket.shortWindow[0];
    const retryAfterSec = Math.max(
      1,
      Math.ceil((SHORT_WINDOW_MS - (now - oldest)) / 1000)
    );
    rateBuckets.set(ip, bucket);
    return { allowed: false, retryAfterSec };
  }

  if (bucket.dayWindow.length >= DAY_LIMIT) {
    const oldest = bucket.dayWindow[0];
    const retryAfterSec = Math.max(
      60,
      Math.ceil((DAY_WINDOW_MS - (now - oldest)) / 1000)
    );
    rateBuckets.set(ip, bucket);
    return { allowed: false, retryAfterSec };
  }

  bucket.shortWindow.push(now);
  bucket.dayWindow.push(now);
  rateBuckets.set(ip, bucket);
  return { allowed: true };
}

function pruneIdempotencyCache(now: number): void {
  if (
    now - lastIdempotencyPruneAt >= PRUNE_INTERVAL_MS &&
    idempotencyCache.size > 500
  ) {
    lastIdempotencyPruneAt = now;
    for (const [k, v] of idempotencyCache.entries()) {
      if (v.expiresAt < now) idempotencyCache.delete(k);
    }
  }
  while (idempotencyCache.size >= MAX_IDEMPOTENCY_ENTRIES) {
    const oldestKey = idempotencyCache.keys().next().value;
    if (oldestKey === undefined) break;
    idempotencyCache.delete(oldestKey);
  }
}

function buildAllowedOrigins(requestUrl: string): Set<string> {
  const allowed = new Set<string>();
  const envList = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  for (const item of envList) {
    try {
      allowed.add(new URL(item).origin);
    } catch {
      // Ignore malformed entry
    }
  }

  const publicSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (publicSite) {
    try {
      allowed.add(new URL(publicSite).origin);
    } catch {
      // Ignore malformed entry
    }
  }

  // Only fall back to request.url origin if no explicit origins were configured (prevents Host header spoofing in prod)
  if (allowed.size === 0 || process.env.NODE_ENV !== "production") {
    try {
      allowed.add(new URL(requestUrl).origin);
    } catch {
      // Ignore
    }
  }

  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  return allowed;
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  extraHeaders?: Record<string, string>
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      ...extraHeaders,
    },
  });
}

function truncateUtf16(value: string, maxUnits: number): string {
  if (value.length <= maxUnits) return value;
  let end = maxUnits;
  // Avoid splitting a UTF-16 surrogate pair
  const code = value.charCodeAt(end - 1);
  if (code >= 0xd800 && code <= 0xdbff) {
    end -= 1;
  }
  return `${value.slice(0, Math.max(0, end - 1))}…`;
}

function sanitizeTelegramError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "unknown_error";
  return msg.replace(/bot[^/\s]+/gi, "bot[REDACTED]");
}

async function persistInquiryLocally(
  record: Record<string, unknown>
): Promise<boolean> {
  let ok = false;
  const runWrite = async () => {
    try {
      const dataDir = path.resolve(
        /*turbopackIgnore: true*/ process.cwd(),
        process.env.INQUIRIES_DATA_DIR?.trim() || "data"
      );
      await fs.mkdir(dataDir, { recursive: true, mode: 0o700 });

      // Enforce total log directory quota (protects against disk-fill DoS)
      const entries = await fs.readdir(dataDir);
      let totalSize = 0;
      for (const name of entries) {
        if (!name.startsWith("inquiries") || !name.endsWith(".jsonl")) continue;
        const st = await fs.stat(path.join(dataDir, name)).catch(() => null);
        if (st?.isFile()) totalSize += st.size;
      }

      const line = `${JSON.stringify(record)}\n`;
      if (totalSize + Buffer.byteLength(line, "utf8") > MAX_TOTAL_LOG_BYTES) {
        console.error("[inquiries] Local JSONL storage quota reached");
        ok = false;
        return;
      }

      const monthStamp = new Date().toISOString().slice(0, 7); // YYYY-MM monthly rotation
      const filePath = path.join(dataDir, `inquiries-${monthStamp}.jsonl`);
      await fs.appendFile(filePath, line, {
        encoding: "utf8",
        mode: 0o600,
      });
      ok = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown_fs_error";
      console.error("[inquiries] Failed to persist local JSONL:", msg);
      ok = false;
    }
  };

  fileWriteQueue = fileWriteQueue.then(runWrite, runWrite);
  await fileWriteQueue;
  return ok;
}

async function sendTelegramNotification(payload: {
  reference: string;
  createdAtIso: string;
  name: string;
  contact: string;
  contactKind: string;
  service: string;
  slotText: string;
  brief: string;
  utmSummary: string;
}): Promise<{ configured: boolean; delivered: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    return { configured: false, delivered: false };
  }

  const includePii = process.env.TELEGRAM_INCLUDE_PII !== "false";

  let text: string;
  if (!includePii) {
    // Depersonalized signal (zero cross-border PII transfer under Art. 12 152-FZ)
    text = [
      `<b>Новая заявка А/09 · #${escapeHtml(payload.reference)}</b>`,
      `<b>Формат:</b> ${escapeHtml(payload.service)}`,
      payload.slotText ? `<b>Слот:</b> ${escapeHtml(payload.slotText)}` : "",
      `<code>Подробности и контакт сохранены в локальном журнале РФ · ${escapeHtml(payload.createdAtIso)}</code>`,
    ]
      .filter(Boolean)
      .join("\n");
  } else {
    const safeUtm = truncateUtf16(payload.utmSummary, 400);
    const headerLines = [
      `<b>Новая заявка А/09 · #${escapeHtml(payload.reference)}</b>`,
      "",
      `<b>Имя:</b> ${escapeHtml(truncateUtf16(payload.name, 120))}`,
      `<b>Контакт (${escapeHtml(payload.contactKind)}):</b> ${escapeHtml(truncateUtf16(payload.contact, 180))}`,
      `<b>Формат:</b> ${escapeHtml(payload.service)}`,
      payload.slotText ? `<b>Слот:</b> ${escapeHtml(payload.slotText)}` : "",
    ].filter((line) => line !== "");

    const footerLines = [
      safeUtm ? `\n<i>Источник: ${escapeHtml(safeUtm)}</i>` : "",
      `\n<code>Согласие 152-ФЗ зафиксировано · ${escapeHtml(payload.createdAtIso)}</code>`,
    ].filter(Boolean);

    const staticLen =
      headerLines.join("\n").length + footerLines.join("\n").length + 32;
    const briefBudget = Math.max(200, MAX_TELEGRAM_UTF16 - staticLen);
    const safeBrief = payload.brief
      ? truncateUtf16(payload.brief, briefBudget)
      : "";

    const rawText = [
      ...headerLines,
      safeBrief ? `\n<b>О задаче:</b>\n${escapeHtml(safeBrief)}` : "",
      ...footerLines,
    ]
      .filter(Boolean)
      .join("\n");

    text = truncateUtf16(rawText, MAX_TELEGRAM_UTF16);
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(
        "[inquiries] Telegram API error:",
        res.status,
        errText.slice(0, 200)
      );
      return { configured: true, delivered: false };
    }
    return { configured: true, delivered: true };
  } catch (err) {
    console.error(
      "[inquiries] Telegram fetch error:",
      sanitizeTelegramError(err)
    );
    return { configured: true, delivered: false };
  }
}

export async function POST(request: Request) {
  // 1. Strict Origin & Fetch Metadata verification
  const allowedOrigins = buildAllowedOrigins(request.url);
  const origin = request.headers.get("origin");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (!origin || !allowedOrigins.has(origin)) {
    return jsonResponse(
      {
        errorCode: "FORBIDDEN_ORIGIN",
        error: "Отправляйте заявку только со страницы сайта.",
      },
      403
    );
  }

  if (
    secFetchSite &&
    secFetchSite !== "same-origin" &&
    secFetchSite !== "same-site" &&
    secFetchSite !== "none"
  ) {
    return jsonResponse(
      {
        errorCode: "FORBIDDEN_ORIGIN",
        error: "Отправляйте заявку только со страницы сайта.",
      },
      403
    );
  }

  // 2. Strict Content-Type verification
  const rawContentType = request.headers.get("content-type") ?? "";
  const mediaType = rawContentType.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    return jsonResponse(
      { errorCode: "EXPECTED_JSON", error: "Ожидается JSON-запрос." },
      415
    );
  }

  // 3. Bounded Per-IP sliding-window Rate Limit
  const clientIp = getClientIp(request);
  const rate = checkRateLimit(clientIp);
  if (!rate.allowed) {
    return jsonResponse(
      {
        errorCode: "RATE_LIMITED",
        error:
          "Слишком много отправок подряд. Подождите несколько минут или напишите в Telegram.",
      },
      429,
      rate.retryAfterSec
        ? { "Retry-After": String(rate.retryAfterSec) }
        : undefined
    );
  }

  // 4. Early Content-Length check + streaming 8 KB cap + strict UTF-8 decoding
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const parsedLength = Number(contentLengthHeader);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_BODY_BYTES) {
      return jsonResponse(
        { errorCode: "TOO_LARGE", error: "Текст заявки слишком длинный." },
        413
      );
    }
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return jsonResponse(
      { errorCode: "INVALID_PAYLOAD", error: "Заполните данные заявки." },
      400
    );
  }

  const decoder = new TextDecoder("utf-8", { fatal: true });
  let rawBody = "";
  let totalBytes = 0;

  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      totalBytes += chunk.value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return jsonResponse(
          { errorCode: "TOO_LARGE", error: "Текст заявки слишком длинный." },
          413
        );
      }
      rawBody += decoder.decode(chunk.value, { stream: true });
    }
    rawBody += decoder.decode();
  } catch {
    return jsonResponse(
      { errorCode: "INVALID_PAYLOAD", error: "Некорректная кодировка запроса." },
      400
    );
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return jsonResponse(
      {
        errorCode: "INVALID_PAYLOAD",
        error: "Некорректный формат данных заявки.",
      },
      400
    );
  }

  // 5. Strict Zod validation (server enforces current consent/policy versions)
  const validated = inquirySchema.safeParse(parsedJson);
  if (!validated.success) {
    return jsonResponse(
      {
        errorCode: "VALIDATION_FAILED",
        error:
          "Проверьте заполнение имени, контакта, формата и согласия на обработку данных.",
      },
      400
    );
  }

  const input = validated.data;
  const now = Date.now();

  // 6. Silent anti-bot honeypot & fill-speed guard (including future timestamp guard)
  if (input.website.trim().length > 0) {
    const decoyRef = crypto.randomUUID().slice(0, 8).toUpperCase();
    return jsonResponse({ reference: decoyRef }, 201);
  }
  if (typeof input.formRenderedAt === "number") {
    const elapsedMs = now - input.formRenderedAt;
    if ((elapsedMs >= 0 && elapsedMs < 1000) || elapsedMs < -60_000) {
      return jsonResponse(
        {
          errorCode: "VALIDATION_FAILED",
          error: "Пожалуйста, проверьте данные формы и отправьте ещё раз.",
        },
        400
      );
    }
  }

  // 7. Sanitize Unicode & validate semantic content
  const cleanName = sliceCodePoints(sanitizeText(input.name, false), 100);
  const cleanContact = sliceCodePoints(sanitizeText(input.contact, false), 160);
  const cleanBrief = sliceCodePoints(sanitizeText(input.brief, true), 2500);

  if (codePointLength(cleanName) < 1) {
    return jsonResponse(
      { errorCode: "INVALID_NAME", error: "Укажите ваше имя." },
      400
    );
  }

  const contactKind = classifyContact(cleanContact);
  if (!contactKind) {
    return jsonResponse(
      {
        errorCode: "INVALID_CONTACT",
        error: "Укажите корректный @логин Telegram, номер телефона или почту.",
      },
      400
    );
  }

  // 8. TOCTOU-safe Idempotency Deduplication
  pruneIdempotencyCache(now);
  const idemKey = input.idempotencyKey;
  if (idemKey) {
    const existing = idempotencyCache.get(idemKey);
    if (existing && existing.expiresAt > now) {
      if (existing.state === "done") {
        return jsonResponse(
          { reference: existing.reference, deduplicated: true },
          200
        );
      }
      const inFlightRef = await existing.promise;
      if (inFlightRef) {
        return jsonResponse(
          { reference: inFlightRef, deduplicated: true },
          200
        );
      }
    }
  }

  // 9. Server-side lookup of open slot details
  const verifiedSlot = input.slotId
    ? OPEN_SLOT_BY_ID.get(input.slotId)
    : undefined;
  const slotText = verifiedSlot
    ? `${verifiedSlot.id} · ${verifiedSlot.category} (${verifiedSlot.terms})`
    : "";

  const id = crypto.randomUUID();
  const reference = id.slice(0, 8).toUpperCase();
  const createdAtIso = new Date(now).toISOString();

  const cleanUtm = input.utm
    ? Object.fromEntries(
        Object.entries(input.utm)
          .filter(([, val]) => typeof val === "string" && val.trim().length > 0)
          .map(([k, val]) => [
            k,
            sanitizeText(val as string, false).slice(0, 160),
          ])
      )
    : {};

  const utmSummary = Object.entries(cleanUtm)
    .filter(([k]) => k !== "landingUrl")
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  const ipHash = crypto
    .createHash("sha256")
    .update(clientIp)
    .digest("hex")
    .slice(0, 16);

  // Register in-flight promise synchronously BEFORE awaiting I/O
  let resolveInFlight: (ref: string | null) => void = () => {};
  if (idemKey) {
    const pendingPromise = new Promise<string | null>((resolve) => {
      resolveInFlight = resolve;
    });
    idempotencyCache.set(idemKey, {
      state: "pending",
      promise: pendingPromise,
      expiresAt: now + IDEMPOTENCY_TTL_MS,
    });
  }

  try {
    // 10. STRICT ORDER (Art. 18(5) 152-FZ / 23-FZ):
    // First record PII & consent proof on the Russian server; never transmit abroad if local write fails.
    const persisted = await persistInquiryLocally({
      id,
      reference,
      createdAt: createdAtIso,
      name: cleanName,
      contact: cleanContact,
      contactKind,
      service: input.service,
      slotId: verifiedSlot?.id ?? "",
      slotText,
      brief: cleanBrief,
      consentGiven: true,
      consentAt: createdAtIso,
      consentVersion: CONSENT_VERSION,
      policyVersion: POLICY_VERSION,
      utm: cleanUtm,
      ipHash,
    });

    if (!persisted) {
      if (idemKey) idempotencyCache.delete(idemKey);
      resolveInFlight(null);
      return jsonResponse(
        {
          errorCode: "INBOX_UNAVAILABLE",
          error:
            "Сервис заявок временно недоступен. Попробуйте ещё раз или напишите в Telegram.",
        },
        503
      );
    }

    // 11. After confirmed RF persistence, notify Telegram Bot
    await sendTelegramNotification({
      reference,
      createdAtIso,
      name: cleanName,
      contact: cleanContact,
      contactKind,
      service: input.service,
      slotText,
      brief: cleanBrief,
      utmSummary,
    });

    if (idemKey) {
      idempotencyCache.set(idemKey, {
        state: "done",
        reference,
        expiresAt: now + IDEMPOTENCY_TTL_MS,
      });
    }
    resolveInFlight(reference);

    return jsonResponse({ reference }, 201);
  } catch (err) {
    if (idemKey) idempotencyCache.delete(idemKey);
    resolveInFlight(null);
    console.error(
      "[inquiries] Unexpected error:",
      err instanceof Error ? err.message : "unknown"
    );
    return jsonResponse(
      {
        errorCode: "INBOX_UNAVAILABLE",
        error:
          "Сервис заявок временно недоступен. Попробуйте ещё раз или напишите в Telegram.",
      },
      503
    );
  }
}
