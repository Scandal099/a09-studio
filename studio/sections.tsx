"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trackGoal } from "@/lib/analytics";
import { copyTextToClipboard } from "@/lib/clipboard";
import { resolveAssetUrl, safeExternalUrl, withBasePath } from "@/lib/paths";
import { useBriefModal } from "./brief-context";
import {
  buildTelegramUrl,
  buildWhatsappUrl,
  siteContent,
  studioContact,
  type CatalogCategoryId,
} from "./content";
import { InlineInquiryForm } from "./dialogs";
import {
  Arrow,
  Check,
  Copy,
  ExternalLink,
  PhoneIcon,
  SectionEyebrow,
  Telegram,
} from "./shared";

/* ============================================================
   HOME VIEW (/) — Clean, breathable architectural studio showcase
   ============================================================ */
export function HomeView() {
  const { openBrief } = useBriefModal();
  const h = siteContent.hero;
  const overview = siteContent.homeOverview;
  const formats = siteContent.formats;
  const wall = siteContent.statement;
  const hasTelegram = Boolean(studioContact.telegramUrl);

  return (
    <>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="hero-kicker">
                <span className="hero-signal" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>{h.kicker}</span>
              </p>

              <h1 id="hero-title" className="hero-title">
                {h.titleLines.map((line) => (
                  <span key={line} className="hero-title-line">
                    <span className="hero-title-inner">{line}</span>
                  </span>
                ))}
              </h1>

              <p className="hero-lead">{h.lead}</p>

              <div className="hero-actions">
                {hasTelegram ? (
                  <a
                    href={buildTelegramUrl(h.primaryPrefill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn pill-light pill-lg"
                    onClick={() => trackGoal("tg_click_hero")}
                  >
                    <Telegram size={16} />
                    <span>{h.primaryCta}</span>
                    <Arrow direction="up-right" size={15} />
                  </a>
                ) : (
                  <button
                    type="button"
                    className="pill-btn pill-light pill-lg"
                    onClick={(e) => {
                      trackGoal("form_open_hero");
                      openBrief(undefined, e.currentTarget);
                    }}
                  >
                    <span>{h.secondaryCta}</span>
                    <Arrow direction="up-right" size={15} />
                  </button>
                )}

                {hasTelegram && (
                  <button
                    type="button"
                    className="pill-btn pill-outline-dark pill-lg"
                    onClick={(e) => {
                      trackGoal("form_open_hero");
                      openBrief(undefined, e.currentTarget);
                    }}
                  >
                    <span>{h.secondaryCta}</span>
                  </button>
                )}
              </div>
            </div>

            <dl className="hero-metrics">
              {h.metrics.map((metric) => (
                <div key={metric.value} className="hero-metric">
                  <dt className="hero-metric-value">{metric.value}</dt>
                  <dd className="hero-metric-label">{metric.label}</dd>
                </div>
              ))}
            </dl>

            <figure className="hero-visual">
              <div className="hero-visual-frame">
                <span className="crosshair crosshair-tl" aria-hidden="true" />
                <span className="crosshair crosshair-br" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath("/art/metal.webp")}
                  srcSet={`${withBasePath("/art/metal-small.webp")} 768w, ${withBasePath("/art/metal.webp")} 1536w`}
                  sizes="(max-width: 64rem) 100vw, 46vw"
                  width={1536}
                  height={1024}
                  alt={h.visualAlt}
                  fetchPriority="high"
                  decoding="async"
                  className="hero-metal-img"
                />
              </div>
              <figcaption className="hero-visual-caption" aria-hidden="true">
                {h.visualCaption}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Compact editorial format preview linking to /services */}
      <section
        className="section section-paper"
        aria-labelledby="home-formats-title"
      >
        <div className="container">
          <div className="section-head section-head-split">
            <div>
              <SectionEyebrow>{overview.formatsEyebrow}</SectionEyebrow>
              <h2 id="home-formats-title" className="section-title">
                {overview.formatsTitle}
              </h2>
            </div>
            <Link href="/services" className="pill-btn pill-dark pill-md">
              <span>{overview.formatsAllLink}</span>
              <Arrow direction="right" size={15} />
            </Link>
          </div>

          <div className="home-formats-list">
            {formats.items.map((item, idx) => (
              <Link
                key={item.id}
                href={`/services#${item.id}`}
                className="home-format-row"
              >
                <span className="format-index">
                  {String(idx + 1).padStart(2, "0")} /
                </span>
                <span className="home-format-main">
                  <span className="home-format-name-line">
                    <span className="home-format-name">{item.name}</span>
                    {item.badge && (
                      <span
                        className={
                          item.flagship
                            ? "format-badge format-badge-ink"
                            : "format-badge"
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="format-tagline">{item.tagline}</span>
                </span>
                <span className="home-format-pricing">
                  <span className="format-price">{item.price}</span>
                  <span className="format-timeline">{item.timeline}</span>
                </span>
                <span className="home-format-arrow" aria-hidden="true">
                  <Arrow direction="right" size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural Concrete Wall Statement */}
      <section className="wall-section" aria-labelledby="wall-title">
        <div className="wall-picture" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath("/art/wall-ru.webp")}
            srcSet={`${withBasePath("/art/wall-ru-small.webp")} 800w, ${withBasePath("/art/wall-ru.webp")} 1600w`}
            sizes="100vw"
            loading="lazy"
            decoding="async"
            width={1600}
            height={900}
            alt={wall.alt}
            className="wall-img"
          />
        </div>
        <div className="wall-scrim" aria-hidden="true" />
        <div className="container wall-content">
          <p className="wall-kicker">{wall.kicker}</p>
          <h2 id="wall-title" className="wall-title">
            {wall.title}
          </h2>
          <p className="wall-lead">{wall.lead}</p>
          <div className="wall-cta-row">
            <button
              type="button"
              className="pill-btn pill-light pill-md"
              onClick={(e) => {
                trackGoal("form_open_wall_audit");
                openBrief("audit", e.currentTarget);
              }}
            >
              <span>{wall.ctaLabel}</span>
              <Arrow direction="up-right" size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Clean 3-Card Directory to /catalog, /cases and /process */}
      <section
        className="section section-charcoal"
        aria-label="Разделы сайта"
      >
        <div className="container">
          <div className="home-directory-grid">
            {overview.directory.map((card) => (
              <article key={card.href} className="directory-card">
                <SectionEyebrow>{card.eyebrow}</SectionEyebrow>
                <h2 className="directory-card-title">{card.title}</h2>
                <p className="directory-card-text">{card.text}</p>
                <div className="directory-card-action">
                  <Link
                    href={card.href}
                    className="pill-btn pill-outline-dark pill-md"
                  >
                    <span>{card.cta}</span>
                    <Arrow direction="right" size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   SERVICES VIEW (/services) — 4 Core Directions + Comparison
   ============================================================ */
export function ServicesView() {
  const { openBrief } = useBriefModal();
  const p = siteContent.pages.services;
  const t = siteContent.formats;
  const hasTelegram = Boolean(studioContact.telegramUrl);

  return (
    <>
      <section className="page-hero" aria-labelledby="services-page-title">
        <div className="container">
          <SectionEyebrow>{p.eyebrow}</SectionEyebrow>
          <h1 id="services-page-title" className="page-hero-title">
            {p.heading}
          </h1>
          <p className="page-hero-lead">{p.lead}</p>
        </div>
      </section>

      <section className="section section-paper" aria-label="Основные направления">
        <div className="container">
          <div className="formats-cards-grid">
            {t.items.map((item, idx) => (
              <article
                key={item.id}
                id={item.id}
                className={
                  item.flagship
                    ? "format-card format-card-flagship"
                    : "format-card"
                }
              >
                <div className="format-card-top">
                  <span className="format-index">
                    {String(idx + 1).padStart(2, "0")} /
                  </span>
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
                </div>

                <h2 className="format-name">{item.name}</h2>
                <p className="format-tagline">{item.tagline}</p>

                <div className="format-card-pricing">
                  <span className="format-price">{item.price}</span>
                  <span className="format-timeline">{item.timeline}</span>
                </div>

                <p className="format-details">{item.details}</p>

                <ul className="format-deliverables" role="list">
                  {item.deliverables.map((point) => (
                    <li key={point} className="format-deliverable-item">
                      <Check size={15} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <p className="format-tags">{item.tags.join(" · ")}</p>

                <div className="format-card-actions">
                  <button
                    type="button"
                    className={
                      item.flagship
                        ? "pill-btn pill-light pill-md pill-full"
                        : "pill-btn pill-dark pill-md pill-full"
                    }
                    onClick={(e) => {
                      trackGoal(`format_cta_${item.id}`);
                      openBrief(item.id, e.currentTarget);
                    }}
                  >
                    <span>
                      {t.ctaLabel}
                      <span className="visually-hidden"> — {item.name}</span>
                    </span>
                    <Arrow direction="right" size={15} />
                  </button>

                  {hasTelegram && (
                    <a
                      href={buildTelegramUrl(item.telegramPrefill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        item.flagship
                          ? "format-tg-link format-tg-link-dark"
                          : "format-tg-link"
                      }
                      onClick={() => trackGoal(`tg_click_format_${item.id}`)}
                    >
                      <Telegram size={14} />
                      <span>
                        {t.tgLabel}
                        <span className="visually-hidden"> ({item.name})</span>
                      </span>
                      <Arrow direction="up-right" size={13} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <p className="formats-included">{t.included}</p>

          <div className="author-card">
            <div className="author-card-head">
              <SectionEyebrow>{t.catalogBanner.eyebrow}</SectionEyebrow>
              <h2 className="author-card-title">{t.catalogBanner.title}</h2>
            </div>
            <div className="audit-banner-body">
              <p className="author-card-text">{t.catalogBanner.text}</p>
              <div className="audit-banner-actions">
                <Link href="/catalog" className="pill-btn pill-dark pill-md">
                  <span>{t.catalogBanner.ctaLabel}</span>
                  <Arrow direction="right" size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section section-charcoal"
        aria-labelledby="comparison-title"
      >
        <div className="container">
          <div className="section-head">
            <SectionEyebrow>{t.comparison.eyebrow}</SectionEyebrow>
            <h2 id="comparison-title" className="section-title">
              {t.comparison.title}
            </h2>
          </div>

          <div className="comparison-grid">
            {t.comparison.items.map((col) => (
              <div key={col.label} className="comparison-card">
                <p className="comparison-label">{col.label}</p>
                <p className="comparison-value">{col.value}</p>
                <p className="comparison-note">{col.note}</p>
              </div>
            ))}
          </div>

          <div className="page-next-links">
            <Link href="/catalog" className="pill-btn pill-light pill-md">
              <span>Каталог отдельных услуг</span>
              <Arrow direction="right" size={15} />
            </Link>
            <Link href="/cases" className="pill-btn pill-outline-dark pill-md">
              <span>Стартовые слоты (−15% за кейс)</span>
              <Arrow direction="right" size={15} />
            </Link>
            <Link
              href="/process"
              className="pill-btn pill-outline-dark pill-md"
            >
              <span>Процесс и частые вопросы</span>
              <Arrow direction="right" size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   CATALOG VIEW (/catalog) — Modular Individual Services Catalog
   ============================================================ */
export function CatalogView() {
  const { openBrief, openCatalogBrief } = useBriefModal();
  const p = siteContent.pages.catalog;
  const cat = siteContent.catalog;
  const hasTelegram = Boolean(studioContact.telegramUrl);
  const [activeCategory, setActiveCategory] =
    useState<CatalogCategoryId>("all");

  const activeCategoryLabel =
    cat.categories.find((c) => c.id === activeCategory)?.label ??
    cat.categories[0].label;

  const visibleItems =
    activeCategory === "all"
      ? cat.items
      : cat.items.filter((item) => item.category === activeCategory);

  return (
    <>
      <section className="page-hero" aria-labelledby="catalog-page-title">
        <div className="container">
          <SectionEyebrow>{p.eyebrow}</SectionEyebrow>
          <h1 id="catalog-page-title" className="page-hero-title">
            {p.heading}
          </h1>
          <p className="page-hero-lead">{p.lead}</p>
        </div>
      </section>

      <section
        className="section section-paper"
        aria-label="Каталог отдельных услуг"
      >
        <div className="container">
          <div className="catalog-toolbar">
            <div
              className="catalog-filters"
              role="group"
              aria-label="Фильтр услуг по категориям"
            >
              {cat.categories.map((category) => {
                const isSelected = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={
                      isSelected
                        ? "catalog-filter-btn is-active"
                        : "catalog-filter-btn"
                    }
                    aria-pressed={isSelected}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            <p className="catalog-count" aria-live="polite" aria-atomic="true">
              {activeCategoryLabel} · показано услуг: {visibleItems.length}
            </p>
          </div>

          <div className="catalog-grid">
            {visibleItems.map((item, idx) => {
              const tgOrderNote = `Интересует услуга из каталога: «${item.name}» (${item.price}).`;
              return (
                <article key={item.id} className="catalog-card">
                  <div className="catalog-card-top">
                    <span className="format-index">
                      {String(idx + 1).padStart(2, "0")} /
                    </span>
                    <span className="catalog-category-tag">
                      {item.categoryLabel}
                    </span>
                  </div>

                  <h2 className="catalog-card-title">{item.name}</h2>
                  <p className="catalog-card-summary">{item.summary}</p>
                  <p className="catalog-card-includes">
                    <strong>Что входит:</strong> {item.includes}
                  </p>

                  <div className="catalog-card-meta">
                    <span className="format-price">{item.price}</span>
                    <span className="format-timeline">{item.timeline}</span>
                  </div>

                  <div className="catalog-card-actions">
                    <button
                      type="button"
                      className="pill-btn pill-dark pill-md pill-full"
                      onClick={(e) => {
                        trackGoal(`catalog_order_${item.id}`);
                        openCatalogBrief(item, e.currentTarget);
                      }}
                    >
                      <span>
                        {cat.orderCta}
                        <span className="visually-hidden">
                          {" "}
                          — {item.name}
                        </span>
                      </span>
                      <Arrow direction="up-right" size={15} />
                    </button>

                    {hasTelegram && (
                      <a
                        href={buildTelegramUrl(
                          `Здравствуйте! ${tgOrderNote} Подскажите по деталям и срокам.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="format-tg-link"
                        onClick={() => trackGoal(`tg_click_${item.id}`)}
                      >
                        <Telegram size={14} />
                        <span>
                          {cat.tgCta}
                          <span className="visually-hidden">
                            {" "}
                            ({item.name})
                          </span>
                        </span>
                        <Arrow direction="up-right" size={13} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="section section-charcoal"
        aria-labelledby="custom-catalog-title"
      >
        <div className="container">
          <div className="directory-card">
            <SectionEyebrow>{cat.customBanner.eyebrow}</SectionEyebrow>
            <h2 id="custom-catalog-title" className="directory-card-title">
              {cat.customBanner.title}
            </h2>
            <p className="directory-card-text">{cat.customBanner.text}</p>
            <div className="page-next-links">
              <button
                type="button"
                className="pill-btn pill-light pill-md"
                onClick={(e) => {
                  trackGoal("form_open_catalog_custom");
                  openBrief("crm", e.currentTarget);
                }}
              >
                <span>{cat.customBanner.ctaLabel}</span>
                <Arrow direction="up-right" size={15} />
              </button>
              <Link
                href="/services"
                className="pill-btn pill-outline-dark pill-md"
              >
                <span>Основные форматы под ключ</span>
                <Arrow direction="right" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   CASES VIEW (/cases) — Founding Slots & Free Audit
   ============================================================ */
export function CasesView() {
  const { openBrief, openSlotBrief } = useBriefModal();
  const p = siteContent.pages.cases;
  const t = siteContent.work;
  const hasTelegram = Boolean(studioContact.telegramUrl);

  return (
    <>
      <section className="page-hero" aria-labelledby="cases-page-title">
        <div className="container">
          <SectionEyebrow>{p.eyebrow}</SectionEyebrow>
          <h1 id="cases-page-title" className="page-hero-title">
            {p.heading}
          </h1>
          <p className="page-hero-lead">{p.lead}</p>
        </div>
      </section>

      <section className="section section-charcoal" aria-label="Стартовые слоты">
        <div className="container">
          <div className="slots-grid">
            {t.slots.map((slot) => {
              const safeImgSrc = resolveAssetUrl(slot.image);
              const safeLiveHref = safeExternalUrl(slot.liveUrl);

              return slot.status === "published" ? (
                <article
                  key={slot.id}
                  className="slot-card slot-card-published"
                >
                  {safeImgSrc && (
                    <div className="slot-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={safeImgSrc}
                        alt={slot.imageAlt || slot.title}
                        width={1200}
                        height={750}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}

                  <div className="slot-top">
                    <span className="slot-index">{slot.id} /</span>
                    {(slot.client || slot.year) && (
                      <span className="slot-status">
                        {[slot.client, slot.year].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>

                  <h2 className="slot-category">{slot.title}</h2>
                  {slot.summary && (
                    <p className="slot-subtitle">{slot.summary}</p>
                  )}

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
                    {safeLiveHref ? (
                      <a
                        href={safeLiveHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill-btn pill-light pill-md pill-full"
                      >
                        <span>
                          {t.publishedCta}
                          <span className="visually-hidden">
                            {" "}
                            — {slot.title}
                          </span>
                        </span>
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="pill-btn pill-light pill-md pill-full"
                        onClick={(e) => openSlotBrief(slot, e.currentTarget)}
                      >
                        <span>
                          {t.slotCta}
                          <span className="visually-hidden">
                            {" "}
                            — {slot.category}
                          </span>
                        </span>
                        <Arrow direction="up-right" size={15} />
                      </button>
                    )}
                  </div>
                </article>
              ) : (
                <article key={slot.id} className="slot-card">
                  <div className="slot-top">
                    <span className="slot-index">{slot.id} /</span>
                    <span className="slot-status">
                      <span className="slot-dot" aria-hidden="true" />
                      <span>Открыт</span>
                    </span>
                  </div>

                  <h2 className="slot-category">{slot.category}</h2>
                  <p className="slot-subtitle">{slot.title}</p>

                  <div className="slot-terms-box">
                    <p className="slot-terms">{slot.terms}</p>
                    <p className="slot-terms-note">{slot.termsNote}</p>
                  </div>

                  <div className="slot-actions">
                    <button
                      type="button"
                      className="pill-btn pill-light pill-md pill-full"
                      onClick={(e) => {
                        trackGoal(`slot_click_${slot.id}`);
                        openSlotBrief(slot, e.currentTarget);
                      }}
                    >
                      <span>
                        {t.slotCta}
                        <span className="visually-hidden">
                          {" "}
                          {slot.id} — {slot.category}
                        </span>
                      </span>
                      <Arrow direction="up-right" size={15} />
                    </button>
                    {hasTelegram && (
                      <a
                        href={buildTelegramUrl(
                          `Здравствуйте! Интересует стартовый слот ${slot.id} — ${slot.category} (${slot.terms}).`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="slot-tg-link"
                        onClick={() => trackGoal(`tg_click_slot_${slot.id}`)}
                      >
                        <Telegram size={14} />
                        <span>
                          Написать в Telegram
                          <span className="visually-hidden">
                            {" "}
                            по слоту {slot.id} ({slot.category})
                          </span>
                        </span>
                        <Arrow direction="up-right" size={13} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="slots-disclaimer">{t.slotsDisclaimer}</p>
        </div>
      </section>

      <section
        className="section section-paper"
        aria-labelledby="audit-banner-title"
      >
        <div className="container">
          <div className="author-card">
            <div className="author-card-head">
              <SectionEyebrow>{t.auditBanner.eyebrow}</SectionEyebrow>
              <h2 id="audit-banner-title" className="author-card-title">
                {t.auditBanner.title}
              </h2>
            </div>
            <div className="audit-banner-body">
              <p className="author-card-text">{t.auditBanner.text}</p>
              <div className="audit-banner-actions">
                <button
                  type="button"
                  className="pill-btn pill-dark pill-md"
                  onClick={(e) => {
                    trackGoal("form_open_cases_audit");
                    openBrief("audit", e.currentTarget);
                  }}
                >
                  <span>{t.auditBanner.ctaLabel}</span>
                  <Arrow direction="up-right" size={15} />
                </button>
                <Link
                  href="/catalog"
                  className="pill-btn pill-outline-light pill-md"
                >
                  <span>Открыть каталог услуг</span>
                  <Arrow direction="right" size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   PROCESS VIEW (/process) — Steps, Guarantees, Author & FAQ
   ============================================================ */
export function ProcessView() {
  const p = siteContent.pages.process;
  const t = siteContent.process;
  const hasTelegram = Boolean(studioContact.telegramUrl);

  return (
    <>
      <section className="page-hero" aria-labelledby="process-page-title">
        <div className="container">
          <SectionEyebrow>{p.eyebrow}</SectionEyebrow>
          <h1 id="process-page-title" className="page-hero-title">
            {p.heading}
          </h1>
          <p className="page-hero-lead">{p.lead}</p>
        </div>
      </section>

      <section className="section section-paper" aria-label="Этапы и вопросы">
        <div className="container">
          <ol className="process-grid" role="list">
            {t.steps.map((step) => (
              <li key={step.number} className="process-step">
                <p className="process-meta">
                  <span>{step.number} /</span>
                  <span>{step.duration}</span>
                </p>
                <h2 className="process-step-title">{step.title}</h2>
                <p className="process-step-text">{step.text}</p>
              </li>
            ))}
          </ol>

          <p className="process-modules-note">{t.modulesNote}</p>

          <dl className="guarantees-grid">
            {t.guarantees.map((item, idx) => (
              <div key={idx} className="guarantee-item">
                <dt className="guarantee-value">{item.value}</dt>
                <dd className="guarantee-label">{item.label}</dd>
              </div>
            ))}
          </dl>

          <div className="author-card">
            <div className="author-card-head">
              <SectionEyebrow>{t.authorBlock.eyebrow}</SectionEyebrow>
              <h2 className="author-card-title">{t.authorBlock.title}</h2>
            </div>
            <p className="author-card-text">{t.authorBlock.text}</p>
          </div>

          <div className="faq-block">
            <h2 className="faq-heading">{t.faqTitle}</h2>
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

          {hasTelegram && (
            <div className="post-faq-cta">
              <p className="post-faq-text">{t.postFaqPrompt}</p>
              <a
                href={buildTelegramUrl(t.postFaqPrefill)}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn pill-dark pill-md"
                onClick={() => trackGoal("tg_click_post_faq")}
              >
                <Telegram size={15} />
                <span>{t.postFaqCta}</span>
                <Arrow direction="up-right" size={14} />
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ============================================================
   CONTACT VIEW (/contact) — Direct Channels + Inline Inquiry Form
   ============================================================ */
export function ContactView() {
  const p = siteContent.pages.contact;
  const c = siteContent.contact;
  const [copiedTg, setCopiedTg] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function copyHandle() {
    const val = `@${studioContact.telegramHandle}`;
    const ok = await copyTextToClipboard(val);
    if (!ok) return;
    setCopiedTg(true);
    trackGoal("tg_handle_copy_contact");
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopiedTg(false);
      timerRef.current = null;
    }, 2400);
  }

  const hasTelegram = Boolean(studioContact.telegramUrl);
  const hasWhatsapp = Boolean(studioContact.whatsappUrl);
  const hasPhone = Boolean(studioContact.phoneHref && studioContact.phoneDisplay);
  const hasEmail = Boolean(studioContact.email);

  return (
    <>
      <section className="page-hero" aria-labelledby="contact-page-title">
        <div className="container">
          <SectionEyebrow>{p.eyebrow}</SectionEyebrow>
          <h1 id="contact-page-title" className="page-hero-title">
            {p.heading}
          </h1>
          <p className="page-hero-lead">{p.lead}</p>
        </div>
      </section>

      <section
        className="section section-charcoal"
        aria-label="Способы связи и форма заявки"
      >
        <div className="container">
          <div className="contact-page-grid">
            <div className="contact-channels-col">
              {hasTelegram && (
                <div className="contact-channel-card">
                  <p className="contact-channel-label">
                    Быстрый ответ в мессенджере
                  </p>
                  <h2 className="contact-channel-title">
                    Telegram @{studioContact.telegramHandle}
                  </h2>
                  <p className="contact-channel-text">
                    Самый быстрый способ обсудить сайт, редизайн, внедрение CRM
                    или забронировать стартовый слот.
                  </p>
                  <div className="contact-channel-actions">
                    <a
                      href={buildTelegramUrl(c.primaryPrefill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill-btn pill-light pill-md"
                      onClick={() => trackGoal("tg_click_contact_page")}
                    >
                      <Telegram size={16} />
                      <span>{c.primaryCta}</span>
                      <Arrow direction="up-right" size={15} />
                    </a>
                    <button
                      type="button"
                      className="copy-pill-btn"
                      onClick={copyHandle}
                    >
                      {copiedTg ? <Check size={14} /> : <Copy size={14} />}
                      <span>
                        {copiedTg ? c.telegramCopied : c.copyTelegram}
                      </span>
                    </button>
                  </div>
                  <span className="visually-hidden" aria-live="polite">
                    {copiedTg ? c.telegramCopied : ""}
                  </span>
                </div>
              )}

              {(hasWhatsapp || hasPhone || hasEmail) && (
                <div className="contact-channel-card">
                  <p className="contact-channel-label">Дополнительные каналы</p>
                  <div className="contact-channel-actions">
                    {hasWhatsapp && (
                      <a
                        href={buildWhatsappUrl(c.primaryPrefill)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill-btn pill-outline-dark pill-md"
                      >
                        <span>WhatsApp</span>
                        <Arrow direction="up-right" size={15} />
                      </a>
                    )}
                    {hasPhone && (
                      <a
                        href={studioContact.phoneHref}
                        className="pill-btn pill-outline-dark pill-md"
                      >
                        <PhoneIcon size={16} />
                        <span>{studioContact.phoneDisplay}</span>
                      </a>
                    )}
                    {hasEmail && (
                      <a
                        href={`mailto:${studioContact.email}`}
                        className="pill-btn pill-outline-dark pill-md"
                      >
                        <span>{studioContact.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="contact-channel-card">
                <p className="contact-channel-label">Режим работы и реквизиты</p>
                <dl className="contact-details-list">
                  <div>
                    <dt>График</dt>
                    <dd>{studioContact.workHours}</dd>
                  </div>
                  <div>
                    <dt>Статус</dt>
                    <dd>{studioContact.legal.operatorFullName}</dd>
                  </div>
                  <div>
                    <dt>Документы</dt>
                    <dd>{studioContact.legal.taxNote}</dd>
                  </div>
                  <div>
                    <dt>ИНН</dt>
                    <dd>{studioContact.legal.inn}</dd>
                  </div>
                  <div>
                    <dt>География</dt>
                    <dd>{studioContact.legal.location}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="contact-form-col">
              <InlineInquiryForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
