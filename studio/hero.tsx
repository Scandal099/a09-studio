"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/paths";
import { content, studioContact, type Lang } from "./content";
import {
  Arrow,
  CalendarIcon,
  Close,
  MenuIcon,
  Telegram,
  Wordmark,
} from "./shared";

interface HeaderProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onOpenBrief: () => void;
}

export function Header({ lang, onLangChange, onOpenBrief }: HeaderProps) {
  const t = content[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const navItems = [
    { href: "#formats", label: t.nav.links.formats },
    { href: "#work", label: t.nav.links.work },
    { href: "#process", label: t.nav.links.process },
    { href: "#contact", label: t.nav.links.contact },
  ];

  const hasTelegram = Boolean(studioContact.telegramUrl);
  const hasCal = Boolean(studioContact.calUrl);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          href="#top"
          className="brand-link"
          onClick={() => setMenuOpen(false)}
        >
          <Wordmark />
          <span className="brand-descriptor">{t.nav.descriptor}</span>
        </a>

        <nav
          className="desktop-nav"
          aria-label={lang === "ru" ? "Основная" : "Primary"}
        >
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-controls">
          <div
            className="lang-switch"
            role="group"
            aria-label={t.nav.langLabel}
          >
            <button
              type="button"
              lang="ru"
              className={lang === "ru" ? "lang-btn is-active" : "lang-btn"}
              aria-pressed={lang === "ru"}
              onClick={() => onLangChange("ru")}
            >
              RU
            </button>
            <button
              type="button"
              lang="en"
              className={lang === "en" ? "lang-btn is-active" : "lang-btn"}
              aria-pressed={lang === "en"}
              onClick={() => onLangChange("en")}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className="pill-btn pill-light pill-sm header-cta"
            onClick={onOpenBrief}
          >
            <span>{t.nav.cta}</span>
            <Arrow direction="up-right" size={14} />
          </button>

          {lang === "ru" && hasTelegram ? (
            <a
              href={studioContact.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-quick-action"
              aria-label={t.hero.primaryCta}
            >
              <Telegram size={16} />
              <span className="mobile-quick-label">TG</span>
            </a>
          ) : (
            <button
              type="button"
              className="mobile-quick-action"
              aria-label={t.nav.cta}
              onClick={onOpenBrief}
            >
              <Arrow direction="up-right" size={15} />
              <span className="mobile-quick-label">
                {lang === "ru" ? t.nav.cta : "Start"}
              </span>
            </button>
          )}

          <button
            ref={menuBtnRef}
            type="button"
            className="mobile-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t.nav.menuClose : t.nav.menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <Close size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-nav" className="mobile-nav">
          <div className="container mobile-nav-inner">
            <nav aria-label={lang === "ru" ? "Мобильная" : "Mobile"}>
              <ul className="mobile-nav-list">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="mobile-nav-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      <Arrow direction="right" size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mobile-nav-actions">
              {lang === "ru" && hasTelegram ? (
                <>
                  <a
                    href={studioContact.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn pill-light pill-lg pill-full"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Telegram size={16} />
                    <span>{t.hero.primaryCta}</span>
                    <Arrow direction="up-right" size={15} />
                  </a>
                  <button
                    type="button"
                    className="pill-btn pill-outline-dark pill-lg pill-full"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenBrief();
                    }}
                  >
                    <span>{t.hero.secondaryCta}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="pill-btn pill-light pill-lg pill-full"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenBrief();
                    }}
                  >
                    <span>{t.hero.primaryCta}</span>
                    <Arrow direction="up-right" size={15} />
                  </button>
                  {hasCal && (
                    <a
                      href={studioContact.calUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill-btn pill-outline-dark pill-lg pill-full"
                      onClick={() => setMenuOpen(false)}
                    >
                      <CalendarIcon size={16} />
                      <span>{t.hero.secondaryCta}</span>
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

interface HeroProps {
  lang: Lang;
  onOpenBrief: () => void;
}

export function Hero({ lang, onOpenBrief }: HeroProps) {
  const t = content[lang].hero;
  const hasTelegram = Boolean(studioContact.telegramUrl);
  const hasCal = Boolean(studioContact.calUrl);

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">
              <span className="hero-signal" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>{t.kicker}</span>
            </p>

            <h1 id="hero-title" className="hero-title">
              {t.titleLines.map((line) => (
                <span key={line} className="hero-title-line">
                  {line}
                </span>
              ))}
            </h1>

            <p className="hero-lead">{t.lead}</p>

            <div className="hero-actions">
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
                alt={t.visualAlt}
                fetchPriority="high"
                decoding="async"
                className="hero-metal-img"
              />
            </div>
            <figcaption className="hero-visual-caption" aria-hidden="true">
              A/09 · STUDIO
            </figcaption>
          </figure>
        </div>

        <dl className="hero-metrics">
          {t.metrics.map((metric) => (
            <div key={metric.value} className="hero-metric">
              <dt className="hero-metric-value">{metric.value}</dt>
              <dd className="hero-metric-label">{metric.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
