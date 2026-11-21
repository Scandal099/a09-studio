import type { Metadata } from "next";
import { withBasePath } from "@/lib/paths";
import { siteContent } from "@/studio/content";
import { CatalogView } from "@/studio/sections";
import { StudioShell } from "@/studio/shell";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const pageMeta = siteContent.pages.catalog;
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
    canonical: withBasePath("/catalog"),
  },
  openGraph: {
    title: pageMeta.title,
    description: pageMeta.description,
    type: "website",
    url: withBasePath("/catalog"),
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

function buildCatalogJsonLd() {
  const canonicalUrl = `${siteUrl}${withBasePath("/catalog")}`;

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Каталог услуг и интеграций — А/09",
    url: canonicalUrl,
    description: pageMeta.description,
    itemListElement: siteContent.catalog.items.map((item) => ({
      "@type": "Offer",
      name: item.name,
      description: item.summary,
      priceCurrency: "RUB",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: item.minPriceRub,
        priceCurrency: "RUB",
      },
    })),
  };
}

export default function CatalogPage() {
  const jsonLd = buildCatalogJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <StudioShell>
        <CatalogView />
      </StudioShell>
    </>
  );
}
