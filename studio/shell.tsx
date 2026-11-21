"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { trackGoal } from "@/lib/analytics";
import { copyTextToClipboard } from "@/lib/clipboard";
import { withBasePath } from "@/lib/paths";
import { useBriefModal } from "./brief-context";
import {
  buildTelegramUrl,
  buildWhatsappUrl,
  siteContent,
  studioContact,
} from "./content";
import {
  Arrow,
  Check,
  Close,
  Copy,
  MenuIcon,
  PhoneIcon,
  SectionEyebrow,
  Telegram,
  Wordmark,
} from "./shared";

const COOKIE_ACK_KEY = "a09_cookie_ack_v1";
const YM_ENABLED = /^\d{5,12}$/.test(
  (process.env.NEXT_PUBLIC_YM_ID ?? "").trim()
);

function subscribeNoop(): () => void {
  return () => {};
}

function getCookieAckSnapshot(): boolean {
  try {
    return window.localStorage.getItem(COOKIE_ACK_KEY) === "1";
  } catch {
    return false;
  }
}

function getCookieAckServerSnapshot(): boolean {
  return true;
}

function CookieNotice() {
  const storedAck = useSyncExternalStore(
    subscribeNoop,
    getCookieAckSnapshot,
    getCookieAckServerSnapshot
  );
  const [dismissed, setDismissed] = useState(false);

  if (!YM_ENABLED || storedAck || dismissed) return null;

  return (
    <aside
      className="cookie-notice"
      role="region"
      aria-label="Уведомление о файлах cookie"
    >
      <div className="container cookie-notice-inner">
        <p className="cookie-notice-text">
          Для статистики посещаемости на сайте используется «Яндекс Метрика» и
          файлы cookie (куки) без записи полей форм. Подробнее — в{" "}
          <Link href="/privacy" className="cookie-notice-link">
            Политике обработки ПДн
          </Link>
          .
        </p>
        <button
          type="button"
          className="pill-btn pill-light pill-sm"
          onClick={() => {
            try {
              window.localStorage.setItem(COOKIE_ACK_KEY, "1");
            } catch {
              // Ignore
            }
            setDismissed(true);
          }}
        >
          Понятно
        </button>
      </div>
    </aside>
  );
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const { openBrief } = useBriefModal();
  const t = siteContent;
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

    const mql = window.matchMedia("(min-width: 64.0625rem)");
    const onResize = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    mql.addEventListener("change", onResize);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      mql.removeEventListener("change", onResize);
    };
  }, [menuOpen]);

  const hasTelegram = Boolean(studioContact.telegramUrl);
  const headerTgHref = buildTelegramUrl(t.hero.primaryPrefill);

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/\/+$/, "") || "/";
    return cleanPath === href;
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          href="/"
          className="brand-link"
          aria-current={isActive("/") ? "page" : undefined}
          onClick={() => setMenuOpen(false)}
        >
          <Wordmark />
          <span className="brand-descriptor">{t.nav.descriptor}</span>
        </Link>

        <nav className="desktop-nav" aria-label="Основная">
          <ul className="nav-list">
            {t.nav.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    isActive(item.href) ? "nav-link is-current" : "nav-link"
                  }
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-controls">
          <button
            type="button"
            className="pill-btn pill-light pill-sm header-cta"
            onClick={(e) => {
              trackGoal("form_open_header");
              openBrief(undefined, e.currentTarget);
            }}
          >
            <span>{t.nav.cta}</span>
            <Arrow direction="up-right" size={14} />
          </button>

          {hasTelegram ? (
            <a
              href={headerTgHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-quick-action"
              aria-label={t.nav.mobileQuickAria}
              onClick={() => trackGoal("tg_click_header")}
            >
              <Telegram size={16} />
              <span className="mobile-quick-label">
                {t.nav.mobileQuickLabel}
              </span>
            </a>
          ) : (
            <button
              type="button"
              className="mobile-quick-action"
              onClick={(e) => {
                trackGoal("form_open_header_mobile");
                openBrief(undefined, e.currentTarget);
              }}
            >
              <Arrow direction="up-right" size={15} />
              <span className="mobile-quick-label">{t.nav.cta}</span>
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
        <>
          <div
            className="mobile-nav-backdrop"
            aria-hidden="true"
            onClick={() => {
              setMenuOpen(false);
              menuBtnRef.current?.focus();
            }}
          />
          <div id="mobile-nav" className="mobile-nav">
            <div className="container mobile-nav-inner">
              <nav aria-label="Мобильная">
                <ul className="mobile-nav-list">
                  <li>
                    <Link
                      href="/"
                      className="mobile-nav-link"
                      aria-current={isActive("/") ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>Главная</span>
                      <Arrow direction="right" size={16} />
                    </Link>
                  </li>
                  {t.nav.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="mobile-nav-link"
                        aria-current={isActive(item.href) ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>{item.label}</span>
                        <Arrow direction="right" size={16} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mobile-nav-actions">
                {hasTelegram && (
                  <a
                    href={headerTgHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn pill-light pill-lg pill-full"
                    onClick={() => {
                      trackGoal("tg_click_mobile_menu");
                      setMenuOpen(false);
                    }}
                  >
                    <Telegram size={16} />
                    <span>{t.hero.primaryCta}</span>
                    <Arrow direction="up-right" size={15} />
                  </a>
                )}
                <button
                  type="button"
                  className={
                    hasTelegram
                      ? "pill-btn pill-outline-dark pill-lg pill-full"
                      : "pill-btn pill-light pill-lg pill-full"
                  }
                  onClick={() => {
                    trackGoal("form_open_mobile_menu");
                    setMenuOpen(false);
                    menuBtnRef.current?.focus();
                    openBrief(undefined, menuBtnRef.current);
                  }}
                >
                  <span>{t.nav.cta}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const { openBrief } = useBriefModal();
  const t = siteContent.contact;
  const [copiedKey, setCopiedKey] = useState<"email" | "tg" | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy(kind: "email" | "tg", value: string) {
    const ok = await copyTextToClipboard(value);
    if (!ok) return;
    setCopiedKey(kind);
    trackGoal(kind === "email" ? "email_copy" : "tg_handle_copy");
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopiedKey(null);
      timerRef.current = null;
    }, 2400);
  }

  const hasTelegram = Boolean(studioContact.telegramUrl);
  const hasWhatsapp = Boolean(studioContact.whatsappUrl);
  const hasEmail = Boolean(studioContact.email);
  const hasPhone = Boolean(studioContact.phoneHref && studioContact.phoneDisplay);

  return (
    <footer
      id="contact"
      className={compact ? "contact-footer contact-footer-compact" : "contact-footer"}
    >
      <div className="container contact-inner">
        {!compact && (
          <div className="contact-hero">
            <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
            <h2 className="contact-title">{t.title}</h2>
            <p className="contact-sla">{t.sla}</p>

            <div className="contact-actions">
              {hasTelegram && (
                <a
                  href={buildTelegramUrl(t.primaryPrefill)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-btn pill-light pill-lg"
                  onClick={() => trackGoal("tg_click_footer")}
                >
                  <Telegram size={16} />
                  <span>{t.primaryCta}</span>
                  <Arrow direction="up-right" size={15} />
                </a>
              )}

              <button
                type="button"
                className={
                  hasTelegram
                    ? "pill-btn pill-outline-dark pill-lg"
                    : "pill-btn pill-light pill-lg"
                }
                onClick={(e) => {
                  trackGoal("form_open_footer");
                  openBrief(undefined, e.currentTarget);
                }}
              >
                <span>{t.secondaryCta}</span>
                <Arrow direction="up-right" size={15} />
              </button>

              {hasWhatsapp && (
                <a
                  href={buildWhatsappUrl(t.primaryPrefill)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-btn pill-outline-dark pill-lg"
                  onClick={() => trackGoal("wa_click_footer")}
                >
                  <span>WhatsApp</span>
                  <Arrow direction="up-right" size={15} />
                </a>
              )}

              {hasPhone && (
                <a
                  href={studioContact.phoneHref}
                  className="pill-btn pill-outline-dark pill-lg"
                  onClick={() => trackGoal("phone_click_footer")}
                >
                  <PhoneIcon size={16} />
                  <span>{studioContact.phoneDisplay}</span>
                </a>
              )}
            </div>
          </div>
        )}

        <div className="footer-bar">
          <div className="footer-email-group">
            {hasTelegram && (
              <>
                <span className="footer-handle-text">
                  @{studioContact.telegramHandle}
                </span>
                <button
                  type="button"
                  className="copy-pill-btn"
                  onClick={() =>
                    handleCopy("tg", `@${studioContact.telegramHandle}`)
                  }
                >
                  {copiedKey === "tg" ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span>
                    {copiedKey === "tg" ? t.telegramCopied : t.copyTelegram}
                  </span>
                </button>
              </>
            )}

            {hasEmail && (
              <>
                <a
                  href={`mailto:${studioContact.email}`}
                  className="footer-email-link"
                >
                  {studioContact.email}
                </a>
                <button
                  type="button"
                  className="copy-pill-btn"
                  onClick={() => handleCopy("email", studioContact.email)}
                >
                  {copiedKey === "email" ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span>
                    {copiedKey === "email" ? t.emailCopied : t.copyEmail}
                  </span>
                </button>
              </>
            )}

            <span className="visually-hidden" aria-live="polite">
              {copiedKey === "email"
                ? t.emailCopied
                : copiedKey === "tg"
                  ? t.telegramCopied
                  : ""}
            </span>
          </div>

          <div className="footer-meta-links">
            <Link href={t.privacyHref} className="footer-link">
              {t.privacyLabel}
            </Link>
            <Link href={t.consentHref} className="footer-link">
              {t.consentLabel}
            </Link>
            <a
              href={withBasePath(t.licensesHref)}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              {t.licensesLabel}
            </a>
            <span className="footer-copy">{t.copyright}</span>
            <a href="#top" className="footer-link footer-top-link">
              <span>{t.backToTop}</span>
              <Arrow direction="up" size={14} />
            </a>
          </div>
        </div>

        <div className="footer-legal-block">
          <p className="footer-legal-line">
            {studioContact.legal.operatorFullName} · ИНН:{" "}
            {studioContact.legal.inn} · {studioContact.legal.location} ·{" "}
            {studioContact.workHours}
          </p>
          <p className="footer-legal-disclaimer">{t.offerDisclaimer}</p>
        </div>
      </div>

      <div className="footer-mark" aria-hidden="true">
        <Wordmark />
      </div>
    </footer>
  );
}

export function StudioShell({
  children,
  compactFooter = false,
  hideStickyBar = false,
}: {
  children: ReactNode;
  compactFooter?: boolean;
  hideStickyBar?: boolean;
}) {
  const { briefOpen, openBrief } = useBriefModal();
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    if (hideStickyBar) return;
    const onScroll = () => setShowStickyBar(window.scrollY > 460);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideStickyBar]);

  const hasTelegram = Boolean(studioContact.telegramUrl);

  return (
    <div className="site" id="top">
      <a className="skip-link" href="#main">
        {siteContent.nav.skipToContent}
      </a>

      <SiteHeader />

      <main id="main" tabIndex={-1}>
        {children}
      </main>

      <SiteFooter compact={compactFooter} />

      {!hideStickyBar && showStickyBar && (
        <div
          className="mobile-sticky-bar"
          role="region"
          aria-label="Быстрая связь"
          hidden={briefOpen}
        >
          {hasTelegram && (
            <a
              href={buildTelegramUrl(siteContent.stickyBar.prefill)}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn pill-light pill-sm sticky-bar-btn"
              onClick={() => trackGoal("tg_click_sticky")}
            >
              <Telegram size={15} />
              <span>{siteContent.stickyBar.telegramLabel}</span>
            </a>
          )}
          <button
            type="button"
            className={
              hasTelegram
                ? "pill-btn pill-outline-dark pill-sm sticky-bar-btn"
                : "pill-btn pill-light pill-sm sticky-bar-btn"
            }
            onClick={(e) => {
              trackGoal("form_open_sticky");
              openBrief(undefined, e.currentTarget);
            }}
          >
            <span>{siteContent.stickyBar.briefLabel}</span>
          </button>
        </div>
      )}

      <CookieNotice />
    </div>
  );
}
