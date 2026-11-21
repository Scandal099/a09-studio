import type { Metadata } from "next";
import Link from "next/link";
import { withBasePath } from "@/lib/paths";
import { siteContent, studioContact } from "@/studio/content";
import { Wordmark } from "@/studio/shared";

const title = "Политика обработки персональных данных — А/09";
const description =
  "Порядок обработки, локализации и защиты персональных данных пользователей сайта А/09 в соответствии с Федеральным законом № 152-ФЗ.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: withBasePath("/privacy"),
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: withBasePath("/privacy"),
    siteName: "А/09",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function PrivacyPage() {
  const doc = siteContent.privacyPolicy;
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
            <Link href="/consent" className="legal-nav-link">
              Согласие на ПДн
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="legal-container legal-main">
        <article className="legal-card" aria-labelledby="privacy-title">
          <div className="legal-card-head">
            <p className="legal-eyebrow">{doc.eyebrow}</p>
            <h1 id="privacy-title" className="legal-title">
              {doc.title}
            </h1>
            <p className="legal-updated">{doc.updated}</p>
          </div>

          <div className="legal-operator-box">
            <strong>{legal.operatorFullName}</strong>
            <p>
              ИНН: {legal.inn}
              {legal.rknRegistryNumber
                ? ` · Реестр РКН № ${legal.rknRegistryNumber}`
                : ""}
            </p>
            <p>
              {legal.location} · Режим работы: {studioContact.workHours}
            </p>
            <p>
              Связь по вопросам ПДн:{" "}
              {studioContact.email ? (
                <a
                  href={`mailto:${studioContact.email}`}
                  className="legal-inline-link"
                >
                  {studioContact.email}
                </a>
              ) : (
                <a
                  href={studioContact.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="legal-inline-link"
                >
                  Telegram @{studioContact.telegramHandle}
                </a>
              )}
            </p>
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
            <Link href="/consent" className="legal-footer-link">
              Согласие на обработку ПДн
            </Link>
            <a
              href={withBasePath("/THIRD-PARTY-LICENSES.txt")}
              target="_blank"
              rel="noopener noreferrer"
              className="legal-footer-link"
            >
              Лицензии ПО и шрифтов
            </a>
            <Link href="/" className="legal-footer-link">
              Вернуться на сайт
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
