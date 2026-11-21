import type { Metadata } from "next";
import { withBasePath } from "@/lib/paths";
import { siteContent } from "@/studio/content";
import { CasesView } from "@/studio/sections";
import { StudioShell } from "@/studio/shell";

const pageMeta = siteContent.pages.cases;
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
    canonical: withBasePath("/cases"),
  },
  openGraph: {
    title: pageMeta.title,
    description: pageMeta.description,
    type: "website",
    url: withBasePath("/cases"),
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

export default function CasesPage() {
  return (
    <StudioShell>
      <CasesView />
    </StudioShell>
  );
}
