import type { Metadata } from "next";
import { content } from "@/studio/content";
import Studio from "./studio";

const { title, description } = content.ru.meta;
const ogImage = {
  url: "/art/wall-wide.webp",
  width: 1672,
  height: 941,
  alt: content.ru.statement.alt,
};

export const metadata: Metadata = {
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
};

export default function HomePage() {
  return <Studio initialLang="ru" />;
}
