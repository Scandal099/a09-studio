import type { Metadata, Viewport } from "next";
import "@fontsource-variable/onest";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { withBasePath } from "@/lib/paths";
import { content } from "@/studio/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://a09.studio";
const { title, description } = content.ru.meta;
const ogImage = {
  url: withBasePath("/art/wall-wide.webp"),
  width: 1672,
  height: 941,
  alt: content.ru.statement.alt,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: withBasePath("/"),
    languages: {
      ru: withBasePath("/"),
      en: withBasePath("/en"),
    },
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: withBasePath("/"),
    siteName: "A/09",
    locale: "ru_RU",
    alternateLocale: ["en_US"],
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage.url],
  },
  icons: { icon: withBasePath("/favicon.svg") },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
