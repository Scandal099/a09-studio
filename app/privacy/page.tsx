import type { Metadata } from "next";
import Link from "next/link";
import { withBasePath } from "@/lib/paths";
import { content, studioContact } from "@/studio/content";

export const metadata: Metadata = {
  title: "Политика конфиденциальности / Privacy Notice — A/09",
  description:
    "Порядок обработки и защиты персональных данных веб-студии A/09 в соответствии с Федеральным законом № 152-ФЗ и EU GDPR.",
  alternates: {
    canonical: withBasePath("/privacy"),
  },
};

export default function PrivacyPage() {
  const ru = content.ru.privacyModal;
  const en = content.en.privacyModal;

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "#f2f2f2",
        color: "#0b0b0b",
        fontFamily: "'Onest Variable', system-ui, -apple-system, sans-serif",
      }}
    >
      <header
        style={{
          background: "#0b0b0b",
          color: "#f2f2f2",
          borderBottom: "1px solid #262626",
        }}
      >
        <div
          style={{
            maxWidth: "820px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              fontWeight: 500,
              fontSize: "1.35rem",
              letterSpacing: "-0.06em",
              color: "#f2f2f2",
              textDecoration: "none",
            }}
          >
            <span>A</span>
            <span style={{ opacity: 0.55, margin: "0 1px" }}>/</span>
            <span>09</span>
          </Link>

          <nav
            aria-label="Навигация"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "18px",
              fontSize: "0.875rem",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#f2f2f2",
                fontWeight: 500,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              ← Вернуться на сайт (RU)
            </Link>
            <Link
              href="/en"
              style={{
                color: "#c4c4c4",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Back to site (EN)
            </Link>
            <a
              href="#en-privacy"
              style={{
                color: "#c4c4c4",
                fontFamily: "'JetBrains Mono Variable', monospace",
                fontSize: "0.78rem",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              GDPR (EN) ↓
            </a>
          </nav>
        </div>
      </header>

      <main
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          padding: "44px 24px 76px",
          display: "grid",
          gap: "40px",
        }}
      >
        <article
          lang="ru"
          aria-labelledby="ru-privacy-title"
          style={{
            background: "#ffffff",
            border: "1px solid #d4d4d4",
            padding: "clamp(24px, 4vw, 44px)",
            display: "grid",
            gap: "24px",
          }}
        >
          <div style={{ display: "grid", gap: "8px" }}>
            <p
              style={{
                fontFamily: "'JetBrains Mono Variable', monospace",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#404040",
              }}
            >
              {ru.eyebrow}
            </p>
            <h1
              id="ru-privacy-title"
              style={{
                fontSize: "clamp(1.75rem, 1.35rem + 1.5vw, 2.35rem)",
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                fontWeight: 600,
              }}
            >
              {ru.title}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#404040" }}>{ru.updated}</p>
          </div>

          <div
            style={{
              padding: "14px 16px",
              background: "#f2f2f2",
              borderLeft: "2px solid #0b0b0b",
              fontSize: "0.875rem",
              lineHeight: 1.55,
              display: "grid",
              gap: "4px",
            }}
          >
            <strong>{studioContact.legal.ru.entity}</strong>
            <span>{ru.operatorLine}</span>
            <span>
              {studioContact.legal.ru.location} ·{" "}
              <a
                href={`mailto:${studioContact.email}`}
                style={{
                  color: "#0b0b0b",
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                {studioContact.email}
              </a>
            </span>
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
            {ru.sections.map((section) => (
              <section
                key={section.heading}
                style={{ display: "grid", gap: "6px" }}
              >
                <h2
                  style={{
                    fontSize: "1.02rem",
                    fontWeight: 600,
                    lineHeight: 1.35,
                  }}
                >
                  {section.heading}
                </h2>
                <p
                  style={{
                    color: "#404040",
                    lineHeight: 1.65,
                    fontSize: "0.95rem",
                  }}
                >
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </article>

        <article
          id="en-privacy"
          lang="en"
          aria-labelledby="en-privacy-title"
          style={{
            background: "#ffffff",
            border: "1px solid #d4d4d4",
            padding: "clamp(24px, 4vw, 44px)",
            display: "grid",
            gap: "24px",
          }}
        >
          <div style={{ display: "grid", gap: "8px" }}>
            <p
              style={{
                fontFamily: "'JetBrains Mono Variable', monospace",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#404040",
              }}
            >
              {en.eyebrow}
            </p>
            <h2
              id="en-privacy-title"
              style={{
                fontSize: "clamp(1.65rem, 1.25rem + 1.4vw, 2.2rem)",
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                fontWeight: 600,
              }}
            >
              {en.title}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#404040" }}>{en.updated}</p>
          </div>

          <div
            style={{
              padding: "14px 16px",
              background: "#f2f2f2",
              borderLeft: "2px solid #0b0b0b",
              fontSize: "0.875rem",
              lineHeight: 1.55,
              display: "grid",
              gap: "4px",
            }}
          >
            <strong>{studioContact.legal.en.entity}</strong>
            <span>{en.operatorLine}</span>
            <span>
              {studioContact.legal.en.location} ·{" "}
              <a
                href={`mailto:${studioContact.email}`}
                style={{
                  color: "#0b0b0b",
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                {studioContact.email}
              </a>
            </span>
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
            {en.sections.map((section) => (
              <section
                key={section.heading}
                style={{ display: "grid", gap: "6px" }}
              >
                <h3
                  style={{
                    fontSize: "1.02rem",
                    fontWeight: 600,
                    lineHeight: 1.35,
                  }}
                >
                  {section.heading}
                </h3>
                <p
                  style={{
                    color: "#404040",
                    lineHeight: 1.65,
                    fontSize: "0.95rem",
                  }}
                >
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
