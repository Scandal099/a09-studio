"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildTelegramUrl,
  content,
  studioContact,
  type CaseSlot,
  type FormatId,
  type Lang,
} from "@/studio/content";
import { BriefDialog, PrivacyDialog } from "@/studio/dialogs";
import { Header, Hero } from "@/studio/hero";
import {
  Arrow,
  CalendarIcon,
  Check,
  Copy,
  ExternalLink,
  formatIdToServiceOption,
  SectionEyebrow,
  Telegram,
  Wordmark,
} from "@/studio/shared";

function FormatsSection({
  lang,
  onSelectFormat,
}: {
  lang: Lang;
  onSelectFormat: (formatId: FormatId) => void;
}) {
  const t = content[lang].formats;

  return (
    <section
      id="formats"
      className="section section-paper"
      aria-labelledby="formats-title"
    >
      <div className="container">
        <div className="section-head">
          <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
          <h2 id="formats-title" className="section-title">
            {t.title}
          </h2>
        </div>

        <div className="formats-list">
          {t.items.map((item, idx) => (
            <details key={item.id} className="format-row">
              <summary className="format-summary">
                <span className="format-index">0{idx + 1} /</span>

                <span className="format-main">
                  <span className="format-name-line">
                    <span className="format-name">{item.name}</span>
                    {item.badge && (
                      <span
                        className={
                          item.flagship
                            ? "format-badge format-badge-solid"
                            : "format-badge"
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="format-tagline">{item.tagline}</span>
                </span>

                <span className="format-pricing">
                  <span className="format-price">{item.price}</span>
                  <span className="format-timeline">{item.timeline}</span>
                </span>

                <span className="format-toggle" aria-hidden="true" />
              </summary>

              <div className="format-panel">
                <div className="format-panel-inner">
                  <p className="format-details">{item.details}</p>
                  <p className="format-tags">{item.tags.join(" · ")}</p>
                  <div className="format-panel-cta">
                    <button
                      type="button"
                      className="pill-btn pill-dark pill-md"
                      onClick={() => onSelectFormat(item.id)}
                    >
                      <span>{t.ctaLabel}</span>
                      <Arrow direction="right" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>

        <p className="formats-included">{t.included}</p>
      </div>
    </section>
  );
}

function SlotsSection({
  lang,
  onClaimSlot,
}: {
  lang: Lang;
  onClaimSlot: (slot: CaseSlot) => void;
}) {
  const t = content[lang].work;
  const hasTelegram = Boolean(studioContact.telegramUrl);

  return (
    <section
      id="work"
      className="section section-charcoal"
      aria-labelledby="work-title"
    >
      <div className="container">
        <div className="section-head">
          <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
          <h2 id="work-title" className="section-title">
            {t.title}
          </h2>
          <p className="section-lead">{t.lead}</p>
        </div>

        <div className="slots-grid">
          {t.slots.map((slot) =>
            slot.status === "published" ? (
              <article key={slot.id} className="slot-card slot-card-published">
                {slot.image && (
                  <div className="slot-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slot.image}
                      alt={slot.imageAlt || slot.title}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="slot-top">
                  <span className="slot-index">/{slot.id}</span>
                  {(slot.client || slot.year) && (
                    <span className="slot-status">
                      {[slot.client, slot.year].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>

                <h3 className="slot-category">{slot.title}</h3>
                {slot.summary && <p className="slot-subtitle">{slot.summary}</p>}

                {slot.metrics && slot.metrics.length > 0 && (
                  <dl className="slot-metrics">
                    {slot.metrics.map((m) => (
                      <div key={m.label}>
                        <dt>{m.label}</dt>
                        <dd>{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="slot-actions">
                  {slot.liveUrl ? (
                    <a
                      href={slot.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill-btn pill-light pill-md pill-full"
                    >
                      <span>{t.publishedCta}</span>
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="pill-btn pill-light pill-md pill-full"
                      onClick={() => onClaimSlot(slot)}
                    >
                      <span>{t.slotCta}</span>
                      <Arrow direction="up-right" size={15} />
                    </button>
                  )}
                </div>
              </article>
            ) : (
              <article key={slot.id} className="slot-card">
                <div className="slot-top">
                  <span className="slot-index">/{slot.id}</span>
                  <span className="slot-status">
                    <span className="slot-dot" aria-hidden="true" />
                    <span>{lang === "ru" ? "Открыт" : "Open"}</span>
                  </span>
                </div>

                <h3 className="slot-category">{slot.category}</h3>
                <p className="slot-subtitle">{slot.title}</p>
                <p className="slot-terms">{slot.terms}</p>

                <div className="slot-actions">
                  <button
                    type="button"
                    className="pill-btn pill-light pill-md pill-full"
                    onClick={() => onClaimSlot(slot)}
                  >
                    <span>{t.slotCta}</span>
                    <Arrow direction="up-right" size={15} />
                  </button>
                  {lang === "ru" && hasTelegram && (
                    <a
                      href={buildTelegramUrl(
                        `Здравствуйте! Интересует слот ${slot.id} — ${slot.category} (${slot.terms})`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="slot-tg-link"
                    >
                      <span>Telegram</span>
                      <Arrow direction="up-right" size={13} />
                    </a>
                  )}
                </div>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function WallStatement({ lang }: { lang: Lang }) {
  const t = content[lang].statement;

  return (
    <section className="wall-section" aria-labelledby="wall-title">
      <picture className="wall-picture">
        <source
          media="(orientation: portrait) and (max-width: 64rem)"
          srcSet="/art/wall-portrait.webp"
          width={800}
          height={1421}
        />
        <img
          src="/art/wall-wide.webp"
          loading="lazy"
          decoding="async"
          width={1672}
          height={941}
          alt={t.alt}
          className="wall-img"
        />
      </picture>
      <div className="wall-scrim" aria-hidden="true" />
      <div className="container wall-content">
        <p className="wall-kicker">{t.kicker}</p>
        <h2 id="wall-title" className="wall-title">
          {t.title}
        </h2>
      </div>
    </section>
  );
}

function ProcessSection({ lang }: { lang: Lang }) {
  const t = content[lang].process;

  return (
    <section
      id="process"
      className="section section-paper"
      aria-labelledby="process-title"
    >
      <div className="container">
        <div className="section-head">
          <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
          <h2 id="process-title" className="section-title">
            {t.title}
          </h2>
        </div>

        <ol className="process-grid">
          {t.steps.map((step) => (
            <li key={step.number} className="process-step">
              <p className="process-meta">
                <span>{step.number} /</span>
                <span>{step.duration}</span>
              </p>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-text">{step.text}</p>
            </li>
          ))}
        </ol>

        <dl className="guarantees-grid">
          {t.guarantees.map((item) => (
            <div key={item.value} className="guarantee-item">
              <dt className="guarantee-value">{item.value}</dt>
              <dd className="guarantee-label">{item.label}</dd>
            </div>
          ))}
        </dl>

        <div className="faq-block">
          <h3 className="faq-heading">{t.faqTitle}</h3>
          <div className="faq-list">
            {t.faq.map((item) => (
              <details key={item.question} className="faq-item">
                <summary className="faq-summary">
                  <span className="faq-question">{item.question}</span>
                </summary>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactFooter({
  lang,
  onOpenBrief,
}: {
  lang: Lang;
  onOpenBrief: () => void;
}) {
  const t = content[lang].contact;
  const [emailCopied, setEmailCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function copyEmail() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(studioContact.email);
      } else {
        const helper = document.createElement("textarea");
        helper.value = studioContact.email;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
      }
      setEmailCopied(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setEmailCopied(false);
        timerRef.current = null;
      }, 2400);
    } catch {
      setEmailCopied(false);
    }
  }

  const hasTelegram = Boolean(studioContact.telegramUrl);
  const hasCal = Boolean(studioContact.calUrl);
  const hasWhatsapp = Boolean(studioContact.whatsappUrl);

  return (
    <footer id="contact" className="contact-footer">
      <div className="container contact-inner">
        <div className="contact-hero">
          <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
          <h2 className="contact-title">{t.title}</h2>
          <p className="contact-sla">{t.sla}</p>

          <div className="contact-actions">
            {lang === "ru" ? (
              <>
                {hasTelegram ? (
                  <a
                    href={studioContact.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn pill-light pill-lg"
                  >
                    <Telegram size={16} />
                    <span>{t.primaryCta}</span>
                    <Arrow direction="up-right" size={15} />
                  </a>
                ) : (
                  <button
                    type="button"
                    className="pill-btn pill-light pill-lg"
                    onClick={onOpenBrief}
                  >
                    <span>{t.secondaryCta}</span>
                    <Arrow direction="up-right" size={15} />
                  </button>
                )}

                {hasTelegram && (
                  <button
                    type="button"
                    className="pill-btn pill-outline-dark pill-lg"
                    onClick={onOpenBrief}
                  >
                    <span>{t.secondaryCta}</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="pill-btn pill-light pill-lg"
                  onClick={onOpenBrief}
                >
                  <span>{t.primaryCta}</span>
                  <Arrow direction="up-right" size={15} />
                </button>
                {hasCal && (
                  <a
                    href={studioContact.calUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn pill-outline-dark pill-lg"
                  >
                    <CalendarIcon size={16} />
                    <span>{t.secondaryCta}</span>
                    <Arrow direction="up-right" size={15} />
                  </a>
                )}
              </>
            )}
          </div>
        </div>

        <div className="footer-bar">
          <div className="footer-email-group">
            <a
              href={`mailto:${studioContact.email}`}
              className="footer-email-link"
            >
              {studioContact.email}
            </a>
            <button
              type="button"
              className="copy-pill-btn"
              onClick={copyEmail}
            >
              {emailCopied ? <Check size={14} /> : <Copy size={14} />}
              <span>{emailCopied ? t.emailCopied : t.copyEmail}</span>
            </button>
            <span className="visually-hidden" aria-live="polite">
              {emailCopied ? t.emailCopied : ""}
            </span>
          </div>

          <div className="footer-meta-links">
            {hasWhatsapp && (
              <a
                href={studioContact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                WhatsApp
              </a>
            )}
            <a href={t.privacyHref} className="footer-link">
              {t.privacyLabel}
            </a>
            <span className="footer-copy">{t.copyright}</span>
            <a href="#top" className="footer-link footer-top-link">
              <span>{t.backToTop}</span>
              <Arrow direction="up" size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-mark" aria-hidden="true">
        <Wordmark />
      </div>
    </footer>
  );
}

export default function Studio({
  initialLang = "ru",
}: {
  initialLang?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [briefOpen, setBriefOpen] = useState(false);
  const [defaultFormatId, setDefaultFormatId] = useState<FormatId | null>(null);
  const [attachedSlot, setAttachedSlot] = useState<CaseSlot | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const t = content[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    const metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    if (metaDesc) {
      metaDesc.setAttribute("content", t.meta.description);
    }
  }, [lang, t.meta.title, t.meta.description]);

  function handleLangChange(nextLang: Lang) {
    if (nextLang === lang) return;
    setLang(nextLang);
    const targetPath = nextLang === "en" ? "/en" : "/";
    const hash = window.location.hash || "";
    window.history.replaceState(null, "", `${targetPath}${hash}`);
  }

  function openGeneralBrief() {
    setDefaultFormatId(null);
    setAttachedSlot(null);
    setBriefOpen(true);
  }

  function openFormatBrief(formatId: FormatId) {
    setDefaultFormatId(formatId);
    setAttachedSlot(null);
    setBriefOpen(true);
  }

  function openSlotBrief(slot: CaseSlot) {
    setDefaultFormatId(slot.formatId);
    setAttachedSlot(slot);
    setBriefOpen(true);
  }

  const defaultServiceLabel = formatIdToServiceOption(defaultFormatId, lang);

  return (
    <div className="site" id="top">
      <a className="skip-link" href="#main">
        {t.nav.skipToContent}
      </a>

      <Header
        lang={lang}
        onLangChange={handleLangChange}
        onOpenBrief={openGeneralBrief}
      />

      <main id="main" tabIndex={-1}>
        <Hero lang={lang} onOpenBrief={openGeneralBrief} />
        <FormatsSection lang={lang} onSelectFormat={openFormatBrief} />
        <SlotsSection lang={lang} onClaimSlot={openSlotBrief} />
        <WallStatement lang={lang} />
        <ProcessSection lang={lang} />
      </main>

      <ContactFooter lang={lang} onOpenBrief={openGeneralBrief} />

      {briefOpen && (
        <BriefDialog
          lang={lang}
          defaultService={defaultServiceLabel}
          attachedSlot={attachedSlot}
          onClearSlot={() => setAttachedSlot(null)}
          onOpenPrivacy={() => setPrivacyOpen(true)}
          onClose={() => setBriefOpen(false)}
        />
      )}

      {privacyOpen && (
        <PrivacyDialog lang={lang} onClose={() => setPrivacyOpen(false)} />
      )}
    </div>
  );
}
