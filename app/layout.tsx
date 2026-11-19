import type { Metadata, Viewport } from "next";
import "./globals.css";

const origin = "https://a09-digital-studio.brownmoose33.chatgpt.site";
const description = "A/09 is an independent digital design and development studio. Explore selected concepts in web design, interactive experiences and digital products.";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: "A/09 — Independent Digital Studio",
  description,
  alternates: { canonical: "/" },
  openGraph: { title: "A/09 — Digital experiences with character.", description, type: "website", url: "/", images: [{ url: "/art/wall-wide.webp", width: 1672, height: 941, alt: "A/09 in spray paint on architectural concrete" }] },
  twitter: { card: "summary_large_image", title: "A/09 — Independent Digital Studio", description, images: ["/art/wall-wide.webp"] },
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
