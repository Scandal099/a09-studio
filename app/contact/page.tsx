import type { Metadata } from "next";
import { withBasePath } from "@/lib/paths";
import { siteContent, studioContact } from "@/studio/content";
import { ContactView } from "@/studio/sections";
import { StudioShell } from "@/studio/shell";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const pageMeta = siteContent.pages.contact;
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
    canonical: withBasePath("/contact"),
  },
  openGraph: {
    title: pageMeta.title,
    description: pageMeta.description,
    type: "website",
    url: withBasePath("/contact"),
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

function buildContactJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: pageMeta.title,
    url: `${siteUrl}${withBasePath("/contact")}`,
    description: pageMeta.description,
    mainEntity: {
      "@type": "Organization",
      name: studioContact.brandName,
      url: `${siteUrl}${withBasePath("/")}`,
      ...(studioContact.email ? { email: studioContact.email } : {}),
      ...(studioContact.telegramUrl
        ? { sameAs: [studioContact.telegramUrl] }
        : {}),
    },
  };
}

export default function ContactPage() {
  const jsonLd = buildContactJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <StudioShell compactFooter hideStickyBar>
        <ContactView />
      </StudioShell>
    </>
  );
}
