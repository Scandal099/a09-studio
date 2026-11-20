import type { Metadata } from "next";
import { content } from "@/studio/content";
import Studio from "../studio";

const { title, description } = content.en.meta;
const ogImage = {
  url: "/art/wall-wide.webp",
  width: 1672,
  height: 941,
  alt: content.en.statement.alt,
};

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/en",
    languages: {
      ru: "/",
      en: "/en",
    },
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/en",
    siteName: "A/09",
    locale: "en_US",
    alternateLocale: ["ru_RU"],
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage.url],
  },
};

export default function EnglishHomePage() {
  return <Studio initialLang="en" />;
}
