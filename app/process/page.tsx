import type { Metadata } from "next";
import { withBasePath } from "@/lib/paths";
import { siteContent } from "@/studio/content";
import { ProcessView } from "@/studio/sections";
import { StudioShell } from "@/studio/shell";

const pageMeta = siteContent.pages.process;
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
    canonical: withBasePath("/process"),
  },
  openGraph: {
    title: pageMeta.title,
    description: pageMeta.description,
    type: "website",
    url: withBasePath("/process"),
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

function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: siteContent.process.faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export default function ProcessPage() {
  const jsonLd = buildFaqJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <StudioShell>
        <ProcessView />
      </StudioShell>
    </>
  );
}
