import type { Metadata } from "next";
import Link from "next/link";
import { siteContent } from "@/studio/content";
import { Arrow, SectionEyebrow, Wordmark } from "@/studio/shared";

const title = "404 — Страница не найдена · А/09";
const description =
  "Запрошенная страница не найдена. Перейдите на главную страницу А/09.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "А/09",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function NotFound() {
  return (
    <div className="not-found-page">
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand-link">
            <Wordmark />
            <span className="brand-descriptor">{siteContent.nav.descriptor}</span>
          </Link>
        </div>
      </header>

      <main className="container not-found-main">
        <SectionEyebrow>Ошибка 404</SectionEyebrow>
        <h1 className="not-found-title">Страница не найдена.</h1>
        <p className="not-found-lead">
          Возможно, ссылка устарела или в адресе опечатка. Вернитесь на главную
          страницу — там форматы, каталог услуг и форма связи.
        </p>
        <div className="not-found-actions">
          <Link href="/" className="pill-btn pill-light pill-lg">
            <span>Вернуться на главную</span>
            <Arrow direction="right" size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
