import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/onest";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { withBasePath } from "@/lib/paths";
import { BriefModalProvider } from "@/studio/brief-context";
import { siteContent } from "@/studio/content";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const ymIdRaw = (process.env.NEXT_PUBLIC_YM_ID ?? "").trim();
const ymId = /^\d{5,12}$/.test(ymIdRaw) ? Number(ymIdRaw) : null;

const { title, description } = siteContent.meta;
const ogImage = {
  url: withBasePath("/og-ru.png"),
  width: 1200,
  height: 630,
  alt: title,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  referrer: "strict-origin-when-cross-origin",
  manifest: withBasePath("/manifest.webmanifest"),
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
  icons: {
    icon: [
      { url: withBasePath("/favicon.svg"), type: "image/svg+xml" },
      { url: withBasePath("/icon-192.png"), sizes: "192x192", type: "image/png" },
    ],
    apple: [
      {
        url: withBasePath("/apple-touch-icon.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <BriefModalProvider>{children}</BriefModalProvider>
        {ymId !== null && (
          <Script id="yandex-metrika" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${ymId},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});`}
          </Script>
        )}
      </body>
    </html>
  );
}
