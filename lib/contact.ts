export type ContactKind = "email" | "telegram" | "phone";

// RFC-safe subset that disallows HTML/header metacharacters (< > " ' \ ;)
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

// Requires explicit "@" prefix (prevents bare words like "artem" or "whatsapp" passing)
const TELEGRAM_HANDLE_RE = /^@[a-zA-Z][a-zA-Z0-9_]{3,31}$/;

// Allows public Telegram user profiles, explicitly excludes invite links (t.me/+...) and reserved paths
const TELEGRAM_URL_RE =
  /^(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([a-zA-Z][a-zA-Z0-9_]{3,31})\/?$/i;

const RESERVED_TG_PATHS = new Set([
  "joinchat",
  "addstickers",
  "addemoji",
  "addtheme",
  "share",
  "proxy",
  "socks",
  "iv",
  "s",
  "c",
  "contact",
  "login",
]);

// Matches a phone sequence with at least 10 digits (e.g. +7 999 123-45-67, 89991234567)
const PHONE_CANDIDATE_RE = /(?:\+?\d[\d\s()\-.\u2013\u2014]{8,22}\d)/;

// Reject arbitrary URLs disguised as phone strings (e.g. "https://evil.tld/9991234567")
const URL_IN_PHONE_RE = /https?:\/\/|www\.|t\.me\//i;

// Matches an embedded @handle inside a human note like "тг @ivanov"
const EMBEDDED_TG_RE =
  /(?:^|[\s,:;(])(@[a-zA-Z][a-zA-Z0-9_]{3,31})(?:$|[\s,;).])/;

// Matches an embedded email inside a human note like "почта ivan@mail.ru"
const EMBEDDED_EMAIL_RE =
  /(?:^|[\s,:;(])([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)(?:$|[\s,;).])/;

// C0/C1 controls, Arabic Letter Mark, line separators, zero-width & Bidi overrides, Braille blank
const SINGLE_LINE_UNSAFE_RE =
  /[\u0000-\u001F\u007F-\u009F\u061C\u200B-\u200F\u2028-\u202E\u2060-\u206F\u2800\uFEFF]/g;
const MULTILINE_UNSAFE_RE =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u061C\u200B-\u200F\u2028-\u202E\u2060-\u206F\u2800\uFEFF]/g;
// Prevent Zalgo / excessive combining marks distortion in Telegram & logs
const EXCESSIVE_COMBINING_RE = /\p{M}{3,}/gu;

const MAX_BRIEF_LINES = 25;

export function sanitizeText(raw: string, multiline = false): string {
  const normalized = raw
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(EXCESSIVE_COMBINING_RE, "");
  const stripped = normalized.replace(
    multiline ? MULTILINE_UNSAFE_RE : SINGLE_LINE_UNSAFE_RE,
    multiline ? "" : " "
  );
  if (!multiline) {
    return stripped.replace(/\s+/g, " ").trim();
  }
  const collapsed = stripped.replace(/\n{3,}/g, "\n\n").trim();
  const lines = collapsed.split("\n");
  return lines.length > MAX_BRIEF_LINES
    ? lines.slice(0, MAX_BRIEF_LINES).join("\n").trim()
    : collapsed;
}

export function sliceCodePoints(value: string, maxCodePoints: number): string {
  const chars = Array.from(value);
  if (chars.length <= maxCodePoints) return value;
  return chars.slice(0, maxCodePoints).join("");
}

export function codePointLength(value: string): number {
  return Array.from(value).length;
}

function isValidEmailToken(token: string): boolean {
  if (token.length > 254 || token.includes("..")) return false;
  return EMAIL_RE.test(token);
}

function isValidTelegramUrl(token: string): boolean {
  const match = TELEGRAM_URL_RE.exec(token);
  if (!match) return false;
  return !RESERVED_TG_PATHS.has(match[1].toLowerCase());
}

export function classifyContact(raw: string): ContactKind | null {
  const value = sanitizeText(raw, false);
  if (value.length < 5 || value.length > 160) return null;

  if (isValidEmailToken(value)) return "email";
  if (TELEGRAM_HANDLE_RE.test(value)) return "telegram";
  if (isValidTelegramUrl(value)) return "telegram";

  // Allow natural human notes around a real contact, e.g. "+7 999 123-45-67 ватсап" or "тг @ivanov"
  const embeddedEmail = EMBEDDED_EMAIL_RE.exec(value);
  if (embeddedEmail && isValidEmailToken(embeddedEmail[1])) {
    return "email";
  }

  const embeddedTg = EMBEDDED_TG_RE.exec(value);
  if (embeddedTg) {
    return "telegram";
  }

  if (URL_IN_PHONE_RE.test(value)) {
    return null;
  }

  const phoneCandidate = PHONE_CANDIDATE_RE.exec(value);
  if (phoneCandidate) {
    const digits = phoneCandidate[0].replace(/\D/g, "");
    if (digits.length >= 10 && digits.length <= 15) {
      return "phone";
    }
  }

  return null;
}

export function isValidContact(raw: string): boolean {
  return classifyContact(raw) !== null;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
