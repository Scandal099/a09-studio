import type { Metadata, Viewport } from "next";
import "@fontsource-variable/onest";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { content } from "@/studio/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://a09.studio";
const { title, description } = content.ru.meta;
const ogImage = {
  url: "/art/wall-wide.webp",
  width: 1672,
  height: 941,
  alt: content.ru.statement.alt,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/",
    languages: {
      ru: "/",
      en: "/en",
    },
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
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
  icons: { icon: "/favicon.svg" },
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
