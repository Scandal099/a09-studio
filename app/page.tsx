import type { Metadata } from "next";
import { withBasePath } from "@/lib/paths";
import { siteContent, studioContact } from "@/studio/content";
import { HomeView } from "@/studio/sections";
import { StudioShell } from "@/studio/shell";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const { title, description } = siteContent.meta;
const ogImage = {
  url: withBasePath("/og-ru.png"),
  width: 1200,
  height: 630,
  alt: title,
};

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: withBasePath("/"),
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: withBasePath("/"),
    siteName: "А/09",
    locale: "ru_RU",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage.url],
  },
};

function buildStructuredData() {
  const canonicalUrl = `${siteUrl}${withBasePath("/")}`;

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "А/09 — Сайты, редизайн и внедрение CRM-систем для бизнеса",
    url: canonicalUrl,
    image: `${siteUrl}${withBasePath("/og-ru.png")}`,
    description,
    areaServed: "RU",
    priceRange: "8 000 ₽ – 55 000 ₽+",
    ...(studioContact.email ? { email: studioContact.email } : {}),
    ...(studioContact.telegramUrl
      ? { sameAs: [studioContact.telegramUrl] }
      : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Основные форматы разработки и интеграций",
      itemListElement: siteContent.formats.items.map((item) => ({
        "@type": "Offer",
        name: item.name,
        priceCurrency: "RUB",
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: item.minPriceRub,
          priceCurrency: "RUB",
        },
      })),
    },
  };
}

export default function HomePage() {
  const jsonLd = buildStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <StudioShell>
        <HomeView />
      </StudioShell>
    </>
  );
}
