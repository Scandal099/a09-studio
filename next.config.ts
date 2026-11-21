import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = isStaticExport
  ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "")
  : "";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const isHttpsSite = siteUrl.startsWith("https://");
const ymEnabled = /^\d{5,12}$/.test(process.env.NEXT_PUBLIC_YM_ID?.trim() ?? "");

function getExternalApiOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_INQUIRY_API ?? "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.origin;
    }
  } catch {
    // Ignore invalid URL
  }
  return "";
}

function buildCsp(): string {
  const scriptSrc = ymEnabled
    ? "script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://mc.yandex.com"
    : "script-src 'self' 'unsafe-inline'";
  const apiOrigin = getExternalApiOrigin();
  const connectSources = ["'self'"];
  if (apiOrigin) connectSources.push(apiOrigin);
  if (ymEnabled) {
    connectSources.push("https://mc.yandex.ru", "https://mc.yandex.com", "wss://mc.yandex.ru");
  }
  const connectSrc = `connect-src ${connectSources.join(" ")}`;
  const imgSrc = ymEnabled
    ? "img-src 'self' data: https://mc.yandex.ru https://mc.yandex.com"
    : "img-src 'self' data:";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    imgSrc,
    "font-src 'self'",
    connectSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isHttpsSite ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC_EXPORT: isStaticExport ? "true" : "false",
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  ...(isStaticExport
    ? {
        output: "export",
        ...(basePath ? { basePath } : {}),
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "Content-Security-Policy", value: buildCsp() },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "X-Content-Type-Options", value: "nosniff" },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=(), payment=()",
                },
                {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin",
                },
                ...(isHttpsSite
                  ? [
                      {
                        key: "Strict-Transport-Security",
                        value: "max-age=31536000; includeSubDomains",
                      },
                    ]
                  : []),
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
