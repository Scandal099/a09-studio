export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/+$/,
  ""
);

export const IS_STATIC_EXPORT =
  process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export const INQUIRY_API_URL = (
  process.env.NEXT_PUBLIC_INQUIRY_API ?? ""
).trim();

const ALLOWED_EXTERNAL_PROTOCOLS = new Set([
  "https:",
  "http:",
  "mailto:",
  "tel:",
]);

export function safeRelativePath(raw: string): string {
  if (
    !raw ||
    /[\u0000-\u001F\u007F]/.test(raw) ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.includes("\\")
  ) {
    return "/";
  }
  return raw;
}

export function safeExternalUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function withBasePath(path: string): string {
  const safe = safeRelativePath(path);
  if (!BASE_PATH) return safe;
  return safe === "/" ? `${BASE_PATH}/` : `${BASE_PATH}${safe}`;
}

export function resolveAssetUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) {
    return withBasePath(trimmed);
  }
  return safeExternalUrl(trimmed);
}

export function getInquiryEndpoint(): string {
  if (INQUIRY_API_URL) {
    return safeExternalUrl(INQUIRY_API_URL) ?? withBasePath("/api/inquiries");
  }
  return withBasePath("/api/inquiries");
}
