import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import type { Lang } from "@/studio/content";

const UUID_RE = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_HANDLE_RE = /^@[a-zA-Z0-9_]{3,32}$/;
const TELEGRAM_PLAIN_RE = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
const TELEGRAM_URL_RE = /^(https?:\/\/)?(t\.me|telegram\.me)\/[a-zA-Z0-9_+]{3,64}\/?$/i;
const PHONE_CHARS_RE = /^[\d\s()+\-\u2013\u2014.]+$/;

const MESSAGES: Record<
  Lang,
  {
    forbiddenOrigin: string;
    expectedJson: string;
    bodyRequired: string;
    tooLarge: string;
    invalidJson: string;
    invalidId: string;
    invalidName: string;
    invalidContact: string;
    invalidService: string;
    consentRequired: string;
    dbUnavailable: string;
  }
> = {
  ru: {
    forbiddenOrigin: "Отправляйте заявку только со страницы сайта студии.",
    expectedJson: "Ожидается JSON-запрос.",
    bodyRequired: "Заполните данные заявки.",
    tooLarge: "Текст заявки слишком длинный — сократите его, пожалуйста.",
    invalidJson: "Некорректный формат данных заявки.",
    invalidId: "Некорректный идентификатор заявки. Обновите страницу и попробуйте снова.",
    invalidName: "Укажите ваше имя (от 1 до 100 символов).",
    invalidContact: "Укажите корректный Telegram, телефон или email.",
    invalidService: "Выберите формат проекта.",
    consentRequired: "Подтвердите согласие на обработку персональных данных.",
    dbUnavailable:
      "Сервис заявок временно недоступен. Попробуйте ещё раз или напишите в Telegram.",
  },
  en: {
    forbiddenOrigin: "Please submit inquiries directly from the studio website.",
    expectedJson: "Expected a JSON request payload.",
    bodyRequired: "Inquiry details are required.",
    tooLarge: "Your inquiry text is too long — please shorten it.",
    invalidJson: "Invalid inquiry payload.",
    invalidId: "Invalid inquiry reference. Refresh the page and try again.",
    invalidName: "Please enter your name (1 to 100 characters).",
    invalidContact: "Please enter a valid email, Telegram handle, or phone number.",
    invalidService: "Please choose a project format.",
    consentRequired: "Please confirm consent to data processing before submitting.",
    dbUnavailable:
      "The studio inbox is temporarily unavailable. Please retry or email hello@a09.studio.",
  },
};

function detectHeaderLang(request: Request): Lang {
  const header = request.headers.get("accept-language")?.toLowerCase() ?? "";
  return header.startsWith("en") ? "en" : "ru";
}

function resolveLang(raw: unknown, fallback: Lang): Lang {
  return raw === "en" ? "en" : raw === "ru" ? "ru" : fallback;
}

function isValidContact(value: string): boolean {
  if (value.length < 3 || value.length > 254) return false;
  if (EMAIL_RE.test(value)) return true;
  if (TELEGRAM_HANDLE_RE.test(value)) return true;
  if (TELEGRAM_PLAIN_RE.test(value)) return true;
  if (TELEGRAM_URL_RE.test(value)) return true;
  if (PHONE_CHARS_RE.test(value)) {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }
  return false;
}

function failed(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const headerLang = detectHeaderLang(request);

  const origin = request.headers.get("origin");
  if (origin && new URL(request.url).origin !== origin) {
    return failed(MESSAGES[headerLang].forbiddenOrigin, 403);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return failed(MESSAGES[headerLang].expectedJson, 415);
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return failed(MESSAGES[headerLang].bodyRequired, 400);
  }

  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;

  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    bytes += chunk.value.length;
    if (bytes > 32000) {
      await reader.cancel();
      return failed(MESSAGES[headerLang].tooLarge, 413);
    }
    body += decoder.decode(chunk.value, { stream: true });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body + decoder.decode());
  } catch {
    return failed(MESSAGES[headerLang].invalidJson, 400);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return failed(MESSAGES[headerLang].invalidJson, 400);
  }

  const data = parsed as Record<string, unknown>;
  const lang = resolveLang(data.lang, headerLang);
  const msg = MESSAGES[lang];

  const field = (key: string): string =>
    typeof data[key] === "string" ? data[key].trim() : "";

  const id = field("id");
  const name = field("name");
  const contact = field("contact") || field("email");
  const service = field("service");
  const brief = field("brief");
  const slot = field("slot");
  const company = field("company");
  const estimateSummary = field("estimateSummary");
  const nda = data.nda === true;
  const consent = data.consent === true;

  if (!UUID_RE.test(id)) {
    return failed(msg.invalidId, 400);
  }
  if (!name || name.length > 100) {
    return failed(msg.invalidName, 400);
  }
  if (!isValidContact(contact)) {
    return failed(msg.invalidContact, 400);
  }
  if (!service || service.length > 140) {
    return failed(msg.invalidService, 400);
  }
  if (!consent) {
    return failed(msg.consentRequired, 400);
  }
  if (
    brief.length > 3500 ||
    slot.length > 140 ||
    company.length > 140 ||
    estimateSummary.length > 4000
  ) {
    return failed(msg.tooLarge, 400);
  }

  const parts: string[] = [];
  if (slot) {
    parts.push(lang === "ru" ? `Слот: ${slot}` : `Slot: ${slot}`);
  }
  if (company) {
    parts.push(lang === "ru" ? `Компания / сайт: ${company}` : `Company / site: ${company}`);
  }
  if (nda) {
    parts.push(lang === "ru" ? "NDA: требуется до обсуждения деталей" : "NDA: required before details");
  }
  if (brief) {
    parts.push(brief);
  }
  if (estimateSummary) {
    parts.push(estimateSummary);
  }

  const fallbackBrief =
    lang === "ru"
      ? `Быстрая заявка · формат: ${service}`
      : `Quick inquiry · format: ${service}`;

  const combinedBrief = (parts.length ? parts.join("\n\n") : fallbackBrief)
    .slice(0, 6000)
    .trim();

  try {
    await getDb()
      .insert(inquiries)
      .values({
        id,
        createdAt: Date.now(),
        name,
        email: contact,
        service,
        brief: combinedBrief,
      })
      .onConflictDoNothing();

    return Response.json(
      { reference: id.slice(0, 8).toUpperCase() },
      { status: 201 }
    );
  } catch {
    return failed(msg.dbUnavailable, 503);
  }
}
