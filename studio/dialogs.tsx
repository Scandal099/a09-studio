"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { getStoredUtm, trackGoal } from "@/lib/analytics";
import { copyTextToClipboard } from "@/lib/clipboard";
import { isValidContact, sanitizeText, sliceCodePoints } from "@/lib/contact";
import {
  getInquiryEndpoint,
  IS_STATIC_EXPORT,
  withBasePath,
} from "@/lib/paths";
import {
  buildTelegramUrl,
  CONSENT_VERSION,
  formatIdToServiceOption,
  POLICY_VERSION,
  SERVICE_OPTIONS,
  siteContent,
  studioContact,
  type AttachedCatalogItem,
  type CaseSlot,
} from "./content";
import {
  Arrow,
  Check,
  Close,
  Copy,
  ExternalLink,
  SectionEyebrow,
  Telegram,
} from "./shared";

const DRAFT_STORAGE_KEY = "a09_brief_draft_v2";
const FETCH_TIMEOUT_MS = 12_000;

interface DraftState {
  name: string;
  contact: string;
  brief: string;
}

function loadDraft(): DraftState {
  if (typeof window === "undefined") {
    return { name: "", contact: "", brief: "" };
  }
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return { name: "", contact: "", brief: "" };
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    return {
      name: typeof parsed.name === "string" ? parsed.name.slice(0, 100) : "",
      contact:
        typeof parsed.contact === "string" ? parsed.contact.slice(0, 160) : "",
      brief:
        typeof parsed.brief === "string" ? parsed.brief.slice(0, 2500) : "",
    };
  } catch {
    return { name: "", contact: "", brief: "" };
  }
}

function saveDraft(draft: DraftState): void {
  if (typeof window === "undefined") return;
  try {
    if (!draft.name && !draft.contact && !draft.brief) {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota errors
  }
}

function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

function generateUuidV4(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    crypto.getRandomValues(bytes);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    ""
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

interface FieldErrors {
  name?: string;
  contact?: string;
  consent?: string;
}

type ModalStatus = "idle" | "sending" | "sent" | "draftFallback";

const ERROR_CODE_MAP: Record<
  string,
  keyof typeof siteContent.briefModal.errors
> = {
  INVALID_NAME: "nameRequired",
  INVALID_CONTACT: "contactInvalid",
  RATE_LIMITED: "rateLimited",
  VALIDATION_FAILED: "validationFailed",
  TOO_LARGE: "tooLarge",
};

interface InquiryFormCoreProps {
  mode: "modal" | "inline";
  titleId: string;
  defaultService: string;
  attachedSlot?: CaseSlot | null;
  onClearSlot?: () => void;
  attachedCatalogItem?: AttachedCatalogItem | null;
  onClearCatalogItem?: () => void;
  onRequestClose?: () => void;
  onStatusChange?: (status: ModalStatus, isDirty: boolean) => void;
}

function InquiryFormCore({
  mode,
  titleId,
  defaultService,
  attachedSlot = null,
  onClearSlot,
  attachedCatalogItem = null,
  onClearCatalogItem,
  onRequestClose,
  onStatusChange,
}: InquiryFormCoreProps) {
  const uid = useId();
  const t = siteContent.briefModal;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<HTMLSelectElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const submittingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const idempotencyKeyRef = useRef<string>("");
  const renderedAtRef = useRef<number>(0);

  const [initialDraft] = useState<DraftState>(() => loadDraft());

  const [name, setName] = useState(initialDraft.name);
  const [contact, setContact] = useState(initialDraft.contact);
  const [service, setService] = useState(defaultService || SERVICE_OPTIONS[0]);
  const [brief, setBrief] = useState(initialDraft.brief);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState<ModalStatus>("idle");
  const [showCancelSend, setShowCancelSend] = useState(false);
  const [reference, setReference] = useState("");
  const [draftSummary, setDraftSummary] = useState("");
  const [draftCopied, setDraftCopied] = useState(false);

  const isDirty = Boolean(
    name.trim() || contact.trim() || brief.trim() || consent
  );

  useEffect(() => {
    onStatusChange?.(status, isDirty);
  }, [status, isDirty, onStatusChange]);

  useEffect(() => {
    if (status === "sent") return;
    saveDraft({ name, contact, brief });
  }, [name, contact, brief, status]);

  useEffect(() => {
    renderedAtRef.current = Date.now();
    if (mode === "modal") {
      const isCoarsePointer =
        typeof window !== "undefined" &&
        window.matchMedia("(pointer: coarse)").matches;
      if (isCoarsePointer) {
        titleRef.current?.focus();
      } else {
        nameRef.current?.focus();
      }
    }
    return () => {
      abortRef.current?.abort();
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, [mode]);

  useEffect(() => {
    if (status === "sent" || status === "draftFallback") {
      successHeadingRef.current?.focus();
    }
  }, [status]);

  useEffect(() => {
    if (status !== "sending") return;
    const timer = window.setTimeout(() => setShowCancelSend(true), 2500);
    return () => {
      window.clearTimeout(timer);
      setShowCancelSend(false);
    };
  }, [status]);

  const nameId = `${uid}-name`;
  const contactId = `${uid}-contact`;
  const contactHintId = `${uid}-contact-hint`;
  const serviceId = `${uid}-service`;
  const briefId = `${uid}-brief`;
  const briefHintId = `${uid}-brief-hint`;
  const consentId = `${uid}-consent`;

  const isAuditMode = service === formatIdToServiceOption("audit");

  function validateField(field: keyof FieldErrors): string | undefined {
    if (field === "name") {
      const cleaned = sanitizeText(name, false);
      return cleaned.length > 0 && cleaned.length <= 100
        ? undefined
        : t.errors.nameRequired;
    }
    if (field === "contact") {
      return isValidContact(contact) ? undefined : t.errors.contactInvalid;
    }
    if (field === "consent") {
      return consent ? undefined : t.errors.consentRequired;
    }
    return undefined;
  }

  function handleBlur(field: keyof FieldErrors, hasValue: boolean) {
    if (!hasValue && !errors[field]) return;
    const msg = validateField(field);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  }

  function handleEnterNext(
    e: KeyboardEvent<HTMLInputElement>,
    nextEl: HTMLElement | null
  ) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      nextEl?.focus();
    }
  }

  function cancelPendingRequest() {
    abortRef.current?.abort();
    submittingRef.current = false;
    setStatus("idle");
    setSubmitError(t.errors.timeout);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current || status === "sending") return;

    const nextErrors: FieldErrors = {
      name: validateField("name"),
      contact: validateField("contact"),
      consent: validateField("consent"),
    };
    setErrors(nextErrors);
    setSubmitError("");

    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.contact) {
      contactRef.current?.focus();
      return;
    }
    if (nextErrors.consent) {
      consentRef.current?.focus();
      return;
    }

    submittingRef.current = true;
    setStatus("sending");

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = generateUuidV4();
    }

    const chosenService = (SERVICE_OPTIONS as readonly string[]).includes(
      service
    )
      ? service
      : SERVICE_OPTIONS[0];
    const cleanName = sliceCodePoints(sanitizeText(name, false), 100);
    const cleanContact = sliceCodePoints(sanitizeText(contact, false), 160);
    const userBrief = sanitizeText(brief, true);
    const catalogPrefixLine = attachedCatalogItem
      ? `Услуга из каталога: «${attachedCatalogItem.name}» (${attachedCatalogItem.price})`
      : "";
    const combinedBrief = [catalogPrefixLine, userBrief]
      .filter(Boolean)
      .join("\n\n");
    const cleanBrief = sliceCodePoints(combinedBrief, 2500);
    const slotLabel = attachedSlot
      ? `/${attachedSlot.id} · ${attachedSlot.category} (${attachedSlot.terms})`
      : "";

    const formattedDraft = [
      "Заявка с сайта А/09",
      `Имя: ${cleanName}`,
      `Контакт: ${cleanContact}`,
      `Формат: ${chosenService}`,
      slotLabel ? `Слот: ${slotLabel}` : "",
      cleanBrief ? `О задаче: ${cleanBrief}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const endpoint = getInquiryEndpoint();
    if (IS_STATIC_EXPORT && !process.env.NEXT_PUBLIC_INQUIRY_API) {
      setDraftSummary(formattedDraft);
      setStatus("draftFallback");
      submittingRef.current = false;
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      FETCH_TIMEOUT_MS
    );

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          idempotencyKey: idempotencyKeyRef.current,
          name: cleanName,
          contact: cleanContact,
          service: chosenService,
          slotId: attachedSlot?.id ?? "",
          brief: cleanBrief,
          consent: true,
          consentVersion: CONSENT_VERSION,
          policyVersion: POLICY_VERSION,
          utm: getStoredUtm(),
          website: honeypot,
          formRenderedAt: renderedAtRef.current,
        }),
      });

      window.clearTimeout(timeoutId);

      if (response.status === 404 || response.status === 405) {
        setDraftSummary(formattedDraft);
        setStatus("draftFallback");
        return;
      }

      const data = (await response.json().catch(() => ({}))) as {
        reference?: string;
        errorCode?: string;
      };

      if (response.status === 429) {
        setDraftSummary(formattedDraft);
        setSubmitError(t.errors.rateLimited);
        setStatus("idle");
        return;
      }

      if (!response.ok || !data.reference) {
        const mappedKey = data.errorCode
          ? ERROR_CODE_MAP[data.errorCode]
          : undefined;
        setSubmitError(mappedKey ? t.errors[mappedKey] : t.errors.network);
        setDraftSummary(formattedDraft);
        setStatus("idle");
        return;
      }

      clearDraft();
      setReference(data.reference);
      setStatus("sent");
      trackGoal("form_submit_success");
    } catch (err) {
      window.clearTimeout(timeoutId);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      setDraftSummary(formattedDraft);
      setSubmitError(isAbort ? t.errors.timeout : t.errors.network);
      setStatus("idle");
    } finally {
      abortRef.current = null;
      submittingRef.current = false;
    }
  }

  async function handleCopyDraft() {
    if (!draftSummary) return;
    const ok = await copyTextToClipboard(draftSummary);
    if (ok) {
      setDraftCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setDraftCopied(false);
        copyTimerRef.current = null;
      }, 2600);
    }
  }

  function resetForNewInquiry() {
    idempotencyKeyRef.current = "";
    setName("");
    setContact("");
    setBrief("");
    setConsent(false);
    setErrors({});
    setSubmitError("");
    setDraftSummary("");
    setDraftCopied(false);
    setReference("");
    setStatus("idle");
  }

  const shortFallbackForUrl =
    draftSummary.length > 420
      ? `${draftSummary.slice(0, 420)}…`
      : draftSummary;

  const fallbackTelegramHref = buildTelegramUrl(shortFallbackForUrl);
  const fallbackMailtoHref = studioContact.email
    ? `mailto:${studioContact.email}?subject=${encodeURIComponent("Заявка с сайта А/09")}&body=${encodeURIComponent(shortFallbackForUrl)}`
    : "";

  if (status === "sent") {
    return (
      <div className="dialog-success">
        <SectionEyebrow>{t.success.eyebrow}</SectionEyebrow>
        <h2
          id={titleId}
          ref={successHeadingRef}
          tabIndex={-1}
          className="dialog-title"
        >
          {t.success.title}
        </h2>
        <p className="success-ref">
          <span>{t.success.referenceLabel}</span>
          <strong>#{reference}</strong>
        </p>
        <p className="dialog-subtitle">{t.success.body}</p>
        <div className="dialog-success-actions">
          {mode === "modal" && onRequestClose ? (
            <button
              type="button"
              className="pill-btn pill-dark pill-lg"
              onClick={onRequestClose}
            >
              {t.success.doneLabel}
            </button>
          ) : (
            <button
              type="button"
              className="pill-btn pill-dark pill-lg"
              onClick={resetForNewInquiry}
            >
              Отправить ещё одну заявку
            </button>
          )}
          {studioContact.telegramUrl && (
            <a
              href={buildTelegramUrl(
                `Здравствуйте! Только что оставил(а) заявку #${reference} на сайте А/09.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn pill-outline-light pill-lg"
              onClick={() => trackGoal("tg_click_after_submit")}
            >
              <Telegram size={15} />
              <span>{t.success.altCta}</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  if (status === "draftFallback") {
    return (
      <div className="dialog-success">
        <SectionEyebrow>{t.fallbackDraft.eyebrow}</SectionEyebrow>
        <h2
          id={titleId}
          ref={successHeadingRef}
          tabIndex={-1}
          className="dialog-title"
        >
          {t.fallbackDraft.title}
        </h2>
        <p className="dialog-subtitle">{t.fallbackDraft.body}</p>

        <pre className="draft-preview">{draftSummary}</pre>

        <div className="dialog-success-actions">
          {fallbackTelegramHref && (
            <a
              href={fallbackTelegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn pill-dark pill-lg"
              onClick={() => {
                clearDraft();
                trackGoal("tg_click_fallback_draft");
              }}
            >
              <Telegram size={15} />
              <span>{t.fallbackDraft.sendTelegram}</span>
              <Arrow direction="up-right" size={14} />
            </a>
          )}

          <button
            type="button"
            className="pill-btn pill-outline-light pill-lg"
            onClick={handleCopyDraft}
          >
            {draftCopied ? <Check size={15} /> : <Copy size={15} />}
            <span>
              {draftCopied
                ? t.fallbackDraft.copiedText
                : t.fallbackDraft.copyText}
            </span>
          </button>

          {fallbackMailtoHref && (
            <a
              href={fallbackMailtoHref}
              className="pill-btn pill-outline-light pill-lg"
            >
              <ExternalLink size={14} />
              <span>{t.fallbackDraft.sendEmail}</span>
            </a>
          )}

          <button
            type="button"
            className="attached-clear-btn"
            onClick={() => setStatus("idle")}
          >
            {t.fallbackDraft.backToForm}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dialog-content">
      <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
      <h2 id={titleId} ref={titleRef} tabIndex={-1} className="dialog-title">
        {isAuditMode ? t.auditTitle : t.title}
      </h2>
      <p className="dialog-subtitle">
        {isAuditMode ? t.auditSubtitle : t.subtitle}
      </p>

      {attachedSlot && (
        <div className="attached-slot">
          <span className="attached-slot-text">
            {t.slotPrefix} {attachedSlot.id} / {attachedSlot.category} —{" "}
            {attachedSlot.terms}
          </span>
          {onClearSlot && (
            <button
              type="button"
              className="attached-clear-btn"
              onClick={() => {
                idempotencyKeyRef.current = "";
                onClearSlot();
              }}
            >
              {t.clearSlotLabel}
            </button>
          )}
        </div>
      )}

      {attachedCatalogItem && (
        <div className="attached-slot">
          <span className="attached-slot-text">
            {t.catalogPrefix}: {attachedCatalogItem.name} (
            {attachedCatalogItem.price})
          </span>
          {onClearCatalogItem && (
            <button
              type="button"
              className="attached-clear-btn"
              onClick={() => {
                idempotencyKeyRef.current = "";
                onClearCatalogItem();
              }}
            >
              {t.clearSlotLabel}
            </button>
          )}
        </div>
      )}

      <form
        method="POST"
        action={IS_STATIC_EXPORT ? undefined : withBasePath("/api/inquiries")}
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby={titleId}
        className="brief-form"
      >
        <div className="visually-hidden" aria-hidden="true">
          <label htmlFor={`${uid}-website`}>Сайт компании</label>
          <input
            id={`${uid}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="form-row-2">
          <div className="field-group">
            <label htmlFor={nameId} className="field-label">
              {t.fields.nameLabel} <span aria-hidden="true">*</span>
            </label>
            <input
              id={nameId}
              ref={nameRef}
              name="name"
              type="text"
              autoComplete="name"
              enterKeyHint="next"
              maxLength={100}
              required
              value={name}
              placeholder={t.fields.namePlaceholder}
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? `${nameId}-err` : undefined}
              onKeyDown={(e) => handleEnterNext(e, contactRef.current)}
              onChange={(e) => {
                idempotencyKeyRef.current = "";
                setName(e.target.value);
                if (
                  errors.name &&
                  sanitizeText(e.target.value, false).length > 0
                ) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              onBlur={() => handleBlur("name", name.length > 0)}
              className="field-input"
            />
            {errors.name && (
              <p id={`${nameId}-err`} className="field-error" aria-live="polite">
                {errors.name}
              </p>
            )}
          </div>

          <div className="field-group">
            <label htmlFor={contactId} className="field-label">
              {t.fields.contactLabel} <span aria-hidden="true">*</span>
            </label>
            <input
              id={contactId}
              ref={contactRef}
              name="contact"
              type="text"
              inputMode="text"
              autoComplete="tel"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              maxLength={160}
              required
              value={contact}
              placeholder={t.fields.contactPlaceholder}
              aria-invalid={errors.contact ? "true" : undefined}
              aria-describedby={
                errors.contact
                  ? `${contactHintId} ${contactId}-err`
                  : contactHintId
              }
              onKeyDown={(e) => handleEnterNext(e, serviceRef.current)}
              onChange={(e) => {
                idempotencyKeyRef.current = "";
                const next = e.target.value;
                setContact(next);
                if (errors.contact && isValidContact(next)) {
                  setErrors((prev) => ({ ...prev, contact: undefined }));
                }
              }}
              onBlur={() => handleBlur("contact", contact.length > 0)}
              className="field-input"
            />
            <span id={contactHintId} className="field-hint">
              {t.fields.contactHint}
            </span>
            {errors.contact && (
              <p
                id={`${contactId}-err`}
                className="field-error"
                aria-live="polite"
              >
                {errors.contact}
              </p>
            )}
          </div>
        </div>

        <div className="field-group">
          <label htmlFor={serviceId} className="field-label">
            {t.fields.serviceLabel}
          </label>
          <select
            id={serviceId}
            ref={serviceRef}
            name="service"
            value={service}
            onChange={(e) => {
              idempotencyKeyRef.current = "";
              setService(e.target.value);
            }}
            className="field-select"
          >
            {t.fields.serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor={briefId} className="field-label">
            {t.fields.briefLabel}
          </label>
          <textarea
            id={briefId}
            name="brief"
            rows={3}
            maxLength={2500}
            value={brief}
            placeholder={t.fields.briefPlaceholder}
            aria-describedby={briefHintId}
            onChange={(e) => {
              idempotencyKeyRef.current = "";
              setBrief(e.target.value);
            }}
            className="field-textarea"
          />
          <span id={briefHintId} className="field-hint">
            {t.fields.briefHint}
          </span>
        </div>

        <div className="checkbox-block">
          <div className="checkbox-row">
            <input
              id={consentId}
              ref={consentRef}
              name="consent"
              type="checkbox"
              required
              checked={consent}
              aria-invalid={errors.consent ? "true" : undefined}
              aria-describedby={
                errors.consent ? `${consentId}-err` : undefined
              }
              onChange={(e) => {
                const next = e.target.checked;
                setConsent(next);
                if (errors.consent && next) {
                  setErrors((prev) => ({ ...prev, consent: undefined }));
                }
              }}
              className="native-checkbox"
            />
            <label
              htmlFor={consentId}
              className="checkbox-text checkbox-label"
            >
              {t.fields.consentPrefix}
              <a
                href={withBasePath("/consent")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link-btn"
              >
                {t.fields.consentDocLink}
              </a>
              {t.fields.consentMid}
              <a
                href={withBasePath("/privacy")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link-btn"
              >
                {t.fields.privacyDocLink}
              </a>
              {t.fields.consentSuffix}
            </label>
          </div>
          {errors.consent && (
            <p
              id={`${consentId}-err`}
              className="field-error"
              aria-live="polite"
            >
              {errors.consent}
            </p>
          )}
        </div>

        {submitError && (
          <div className="form-alert" role="alert">
            <p>{submitError}</p>
            {draftSummary && (
              <div className="form-alert-actions">
                {fallbackTelegramHref && (
                  <a
                    href={fallbackTelegramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-link-btn"
                  >
                    Отправить в Telegram
                  </a>
                )}
                <button
                  type="button"
                  className="inline-link-btn"
                  onClick={handleCopyDraft}
                >
                  {draftCopied ? "Скопировано" : "Скопировать заявку"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="form-submit-row">
          <button
            type="submit"
            className="pill-btn pill-dark pill-lg pill-full"
            disabled={status === "sending"}
          >
            <span>
              {status === "sending" ? t.submittingLabel : t.submitLabel}
            </span>
            {status !== "sending" && <Arrow direction="up-right" size={15} />}
          </button>

          {showCancelSend && (
            <button
              type="button"
              className="attached-clear-btn cancel-send-btn"
              onClick={cancelPendingRequest}
            >
              {t.cancelSendLabel}
            </button>
          )}

          {mode === "modal" && (
            <p className="form-offer-note">{t.modalOfferNote}</p>
          )}
        </div>
      </form>
    </div>
  );
}

interface NativeModalProps {
  titleId: string;
  closeLabel: string;
  allowLightDismiss?: boolean;
  canClose?: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLDialogElement | null>;
  children: ReactNode;
}

function NativeModal({
  titleId,
  closeLabel,
  allowLightDismiss = true,
  canClose = true,
  onClose,
  dialogRef,
  children,
}: NativeModalProps) {
  const allowLightDismissRef = useRef(allowLightDismiss);
  const canCloseRef = useRef(canClose);

  useEffect(() => {
    allowLightDismissRef.current = allowLightDismiss;
    canCloseRef.current = canClose;
  }, [allowLightDismiss, canClose]);

  // Use useLayoutEffect so showModal() runs BEFORE child InquiryFormCore's useEffect focuses inputs
  useLayoutEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (!el.open) {
      el.showModal();
    }

    let cleanupFallback: (() => void) | undefined;
    if (
      typeof HTMLDialogElement !== "undefined" &&
      !("closedBy" in HTMLDialogElement.prototype)
    ) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        return (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        );
      };
      const onPointerDown = (e: PointerEvent) => {
        if (!allowLightDismissRef.current || !canCloseRef.current) {
          pressedOutside = false;
          return;
        }
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (
          allowLightDismissRef.current &&
          canCloseRef.current &&
          pressedOutside &&
          isOutside(e)
        ) {
          el.close();
        }
        pressedOutside = false;
      };
      el.addEventListener("pointerdown", onPointerDown);
      el.addEventListener("pointerup", onPointerUp);
      cleanupFallback = () => {
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointerup", onPointerUp);
      };
    }

    return () => {
      cleanupFallback?.();
      if (el.open) el.close();
    };
  }, [dialogRef]);

  function handleNativeClose() {
    const el = dialogRef.current;
    if (!el || el.open) return;
    el.returnValue = "";
    onClose();
  }

  function requestClose() {
    if (!canClose) return;
    const el = dialogRef.current;
    if (el?.open) {
      el.close();
    } else {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="studio-dialog"
      aria-labelledby={titleId}
      onClose={handleNativeClose}
      onCancel={(e) => {
        if (!canClose) e.preventDefault();
      }}
      {...({
        closedby: !canClose
          ? "none"
          : allowLightDismiss
            ? "any"
            : "closerequest",
      } as Record<string, string>)}
    >
      <div className="dialog-frame">
        <button
          type="button"
          className="dialog-close"
          aria-label={closeLabel}
          disabled={!canClose}
          onClick={requestClose}
        >
          <Close size={18} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

interface BriefDialogProps {
  defaultService: string;
  attachedSlot: CaseSlot | null;
  onClearSlot: () => void;
  attachedCatalogItem: AttachedCatalogItem | null;
  onClearCatalogItem: () => void;
  onClose: () => void;
}

export function BriefDialog({
  defaultService,
  attachedSlot,
  onClearSlot,
  attachedCatalogItem,
  onClearCatalogItem,
  onClose,
}: BriefDialogProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [modalMeta, setModalMeta] = useState<{
    status: ModalStatus;
    isDirty: boolean;
  }>({ status: "idle", isDirty: false });

  const handleStatusChange = useCallback(
    (status: ModalStatus, isDirty: boolean) => {
      setModalMeta((prev) =>
        prev.status === status && prev.isDirty === isDirty
          ? prev
          : { status, isDirty }
      );
    },
    []
  );

  function closeModal() {
    if (modalMeta.status === "sending") return;
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    } else {
      onClose();
    }
  }

  return (
    <NativeModal
      titleId={titleId}
      closeLabel={siteContent.briefModal.closeLabel}
      allowLightDismiss={!modalMeta.isDirty && modalMeta.status !== "sending"}
      canClose={modalMeta.status !== "sending"}
      onClose={onClose}
      dialogRef={dialogRef}
    >
      <InquiryFormCore
        mode="modal"
        titleId={titleId}
        defaultService={defaultService}
        attachedSlot={attachedSlot}
        onClearSlot={onClearSlot}
        attachedCatalogItem={attachedCatalogItem}
        onClearCatalogItem={onClearCatalogItem}
        onRequestClose={closeModal}
        onStatusChange={handleStatusChange}
      />
    </NativeModal>
  );
}

export function InlineInquiryForm({
  defaultService = SERVICE_OPTIONS[6],
}: {
  defaultService?: string;
}) {
  const uid = useId();
  return (
    <div className="inline-form-card">
      <InquiryFormCore
        mode="inline"
        titleId={`${uid}-inline-title`}
        defaultService={defaultService}
      />
    </div>
  );
}
