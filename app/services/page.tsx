import type { Metadata } from "next";
import { withBasePath } from "@/lib/paths";
import { siteContent } from "@/studio/content";
import { ServicesView } from "@/studio/sections";
import { StudioShell } from "@/studio/shell";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const pageMeta = siteContent.pages.services;
const ogImage = {
  url: withBasePath("/og-ru.png"),
  width: 1200,
  height: 630,
  alt: pageMeta.title,
};

export const metadata: Metadata = {
  title: pageMeta.title,
  description: pageMeta.description,
  alternates: {
    canonical: withBasePath("/services"),
  },
  openGraph: {
    title: pageMeta.title,
    description: pageMeta.description,
    type: "website",
    url: withBasePath("/services"),
    siteName: "А/09",
    locale: "ru_RU",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: pageMeta.title,
    description: pageMeta.description,
    images: [ogImage.url],
  },
};

function buildServicesJsonLd() {
  const canonicalUrl = `${siteUrl}${withBasePath("/services")}`;

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Форматы разработки сайтов, редизайна и систем учёта (CRM) — А/09",
    url: canonicalUrl,
    description: pageMeta.description,
    itemListElement: siteContent.formats.items.map((item) => ({
      "@type": "Offer",
      name: item.name,
      description: item.tagline,
      priceCurrency: "RUB",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: item.minPriceRub,
        priceCurrency: "RUB",
      },
    })),
  };
}

export default function ServicesPage() {
  const jsonLd = buildServicesJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <StudioShell>
        <ServicesView />
      </StudioShell>
    </>
  );
}
