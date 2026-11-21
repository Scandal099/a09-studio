import type { Metadata } from "next";
import Link from "next/link";
import { withBasePath } from "@/lib/paths";
import { siteContent, studioContact } from "@/studio/content";
import { Wordmark } from "@/studio/shared";

const title = "Согласие на обработку персональных данных — А/09";
const description =
  "Отдельный документ согласия на обработку персональных данных пользователей сайта А/09 в соответствии с ч. 1 ст. 9 ФЗ № 152-ФЗ (в ред. 156-ФЗ).";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: withBasePath("/consent"),
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: withBasePath("/consent"),
    siteName: "А/09",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function ConsentPage() {
  const doc = siteContent.consentDocument;
  const legal = studioContact.legal;

  return (
    <div className="legal-page">
      <a className="skip-link" href="#main">
        Перейти к документу
      </a>

      <header className="legal-header">
        <div className="legal-container legal-header-inner">
          <Link href="/" className="brand-link">
            <Wordmark />
          </Link>
          <nav aria-label="Навигация по документам" className="legal-nav">
            <Link href="/" className="legal-nav-link">
              ← На главную
            </Link>
            <Link href="/privacy" className="legal-nav-link">
              Политика ПДн
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="legal-container legal-main">
        <article className="legal-card" aria-labelledby="consent-title">
          <div className="legal-card-head">
            <p className="legal-eyebrow">{doc.eyebrow}</p>
            <h1 id="consent-title" className="legal-title">
              {doc.title}
            </h1>
            <p className="legal-updated">{doc.updated}</p>
          </div>

          <div className="legal-operator-box">
            <strong>{legal.operatorFullName}</strong>
            <p>
              ИНН: {legal.inn} · {legal.location}
            </p>
            <p>{doc.intro}</p>
          </div>

          <div className="legal-sections">
            {doc.sections.map((section) => (
              <section key={section.heading} className="legal-section">
                <h2 className="legal-section-heading">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="legal-section-body">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>
      </main>

      <footer className="legal-footer">
        <div className="legal-container legal-footer-inner">
          <span>{siteContent.contact.copyright}</span>
          <div className="legal-footer-links">
            <Link href="/privacy" className="legal-footer-link">
              Политика обработки ПДн
            </Link>
            <Link href="/" className="legal-footer-link">
              Вернуться на сайт
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
