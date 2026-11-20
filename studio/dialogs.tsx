"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { content, studioContact, type CaseSlot, type Lang } from "./content";
import {
  Arrow,
  CalendarIcon,
  Close,
  ExternalLink,
  SectionEyebrow,
  Telegram,
} from "./shared";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_HANDLE_RE = /^@[a-zA-Z0-9_]{3,32}$/;
const TELEGRAM_PLAIN_RE = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
const TELEGRAM_URL_RE =
  /^(https?:\/\/)?(t\.me|telegram\.me)\/[a-zA-Z0-9_+]{3,64}\/?$/i;
const PHONE_CHARS_RE = /^[\d\s()+\-\u2013\u2014.]+$/;

function isValidContact(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 254) return false;
  if (EMAIL_RE.test(trimmed)) return true;
  if (TELEGRAM_HANDLE_RE.test(trimmed)) return true;
  if (TELEGRAM_PLAIN_RE.test(trimmed)) return true;
  if (TELEGRAM_URL_RE.test(trimmed)) return true;
  if (PHONE_CHARS_RE.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }
  return false;
}

function generateInquiryId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const rand = (Math.random() * 16) | 0;
    const val = ch === "x" ? rand : (rand & 0x3) | 0x8;
    return val.toString(16);
  });
}

interface NativeModalProps {
  titleId: string;
  closeLabel: string;
  variantClass: string;
  allowLightDismiss?: boolean;
  canClose?: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLDialogElement | null>;
  children: ReactNode;
}

function NativeModal({
  titleId,
  closeLabel,
  variantClass,
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

  useEffect(() => {
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
      className={`studio-dialog ${variantClass}`}
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
  lang: Lang;
  defaultService: string;
  attachedSlot: CaseSlot | null;
  onClearSlot: () => void;
  onOpenPrivacy: () => void;
  onClose: () => void;
}

interface FieldErrors {
  name?: string;
  contact?: string;
  consent?: string;
}

export function BriefDialog({
  lang,
  defaultService,
  attachedSlot,
  onClearSlot,
  onOpenPrivacy,
  onClose,
}: BriefDialogProps) {
  const uid = useId();
  const t = content[lang].briefModal;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const tokenRef = useRef<string>("");

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [service, setService] = useState(defaultService);
  const [brief, setBrief] = useState("");
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [reference, setReference] = useState("");

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === "sent") {
      successHeadingRef.current?.focus();
    }
  }, [status]);

  const titleId = `${uid}-title`;
  const nameId = `${uid}-name`;
  const contactId = `${uid}-contact`;
  const serviceId = `${uid}-service`;
  const briefId = `${uid}-brief`;
  const consentId = `${uid}-consent`;

  const isDirty = Boolean(
    name.trim() || contact.trim() || brief.trim() || consent
  );

  function validateField(field: keyof FieldErrors): string | undefined {
    if (field === "name") {
      return name.trim().length > 0 && name.trim().length <= 100
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

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

    if (!tokenRef.current) {
      tokenRef.current = generateInquiryId();
    }

    setStatus("sending");

    const slotLabel = attachedSlot
      ? `${attachedSlot.id} · ${attachedSlot.category} (${attachedSlot.terms})`
      : "";

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tokenRef.current,
          lang,
          name: name.trim(),
          contact: contact.trim(),
          service: service || t.fields.serviceOptions[0],
          brief: brief.trim(),
          slot: slotLabel,
          consent,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reference?: string;
        error?: string;
      };

      if (!response.ok || !data.reference) {
        throw new Error(data.error || t.errors.network);
      }

      setReference(data.reference);
      setStatus("sent");
    } catch (err) {
      setSubmitError(
        err instanceof TypeError
          ? t.errors.network
          : err instanceof Error
            ? err.message
            : t.errors.network
      );
      setStatus("idle");
    }
  }

  function closeModal() {
    if (status === "sending") return;
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    } else {
      onClose();
    }
  }

  return (
    <NativeModal
      titleId={titleId}
      closeLabel={t.closeLabel}
      variantClass="brief-dialog"
      allowLightDismiss={!isDirty && status !== "sending"}
      canClose={status !== "sending"}
      onClose={onClose}
      dialogRef={dialogRef}
    >
      {status === "sent" ? (
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
            <button
              type="button"
              className="pill-btn pill-dark pill-lg"
              onClick={closeModal}
            >
              {t.success.doneLabel}
            </button>
            {lang === "en"
              ? studioContact.calUrl && (
                  <a
                    href={studioContact.calUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn pill-outline-light pill-lg"
                  >
                    <CalendarIcon size={15} />
                    <span>{t.success.altCta}</span>
                  </a>
                )
              : studioContact.telegramUrl && (
                  <a
                    href={studioContact.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn pill-outline-light pill-lg"
                  >
                    <Telegram size={15} />
                    <span>{t.success.altCta}</span>
                  </a>
                )}
          </div>
        </div>
      ) : (
        <div className="dialog-content">
          <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
          <h2 id={titleId} className="dialog-title">
            {t.title}
          </h2>
          <p className="dialog-subtitle">{t.subtitle}</p>

          {attachedSlot && (
            <div className="attached-slot">
              <span className="attached-slot-text">
                {t.slotPrefix} /{attachedSlot.id} · {attachedSlot.category} —{" "}
                {attachedSlot.terms}
              </span>
              <button
                type="button"
                className="attached-clear-btn"
                onClick={onClearSlot}
              >
                {t.clearSlotLabel}
              </button>
            </div>
          )}

          <form
            method="POST"
            action="/api/inquiries"
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby={titleId}
            className="brief-form"
          >
            <div className="form-row-2">
              <div className="field-group">
                <label htmlFor={nameId} className="field-label">
                  {t.fields.nameLabel}{" "}
                  <span aria-hidden="true">*</span>
                </label>
                <input
                  id={nameId}
                  ref={nameRef}
                  name="name"
                  type="text"
                  autoFocus
                  autoComplete="name"
                  enterKeyHint="next"
                  maxLength={100}
                  required
                  value={name}
                  placeholder={t.fields.namePlaceholder}
                  aria-invalid={errors.name ? "true" : undefined}
                  aria-describedby={errors.name ? `${nameId}-err` : undefined}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name && e.target.value.trim().length > 0) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  onBlur={() => handleBlur("name", name.length > 0)}
                  className="field-input"
                />
                {errors.name && (
                  <p
                    id={`${nameId}-err`}
                    className="field-error"
                    aria-live="polite"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="field-group">
                <label htmlFor={contactId} className="field-label">
                  {t.fields.contactLabel}{" "}
                  <span aria-hidden="true">*</span>
                </label>
                <input
                  id={contactId}
                  ref={contactRef}
                  name="contact"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  maxLength={254}
                  required
                  value={contact}
                  placeholder={t.fields.contactPlaceholder}
                  aria-invalid={errors.contact ? "true" : undefined}
                  aria-describedby={
                    errors.contact ? `${contactId}-err` : undefined
                  }
                  onChange={(e) => {
                    const next = e.target.value;
                    setContact(next);
                    if (errors.contact && isValidContact(next)) {
                      setErrors((prev) => ({ ...prev, contact: undefined }));
                    }
                  }}
                  onBlur={() => handleBlur("contact", contact.length > 0)}
                  className="field-input"
                />
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
                name="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
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
                rows={2}
                maxLength={3500}
                value={brief}
                placeholder={t.fields.briefPlaceholder}
                onChange={(e) => setBrief(e.target.value)}
                className="field-textarea"
              />
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
                <div className="checkbox-text">
                  <label htmlFor={consentId} className="checkbox-label">
                    {t.fields.consentPrefix}
                  </label>
                  <button
                    type="button"
                    className="inline-link-btn"
                    onClick={onOpenPrivacy}
                  >
                    {t.fields.consentLink}
                  </button>
                </div>
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
              <p className="form-alert" role="alert">
                {submitError}
              </p>
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
            </div>
          </form>
        </div>
      )}
    </NativeModal>
  );
}

interface PrivacyDialogProps {
  lang: Lang;
  onClose: () => void;
}

export function PrivacyDialog({ lang, onClose }: PrivacyDialogProps) {
  const uid = useId();
  const t = content[lang].privacyModal;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `${uid}-privacy-title`;

  function closeModal() {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    } else {
      onClose();
    }
  }

  return (
    <NativeModal
      titleId={titleId}
      closeLabel={t.closeLabel}
      variantClass="privacy-dialog"
      onClose={onClose}
      dialogRef={dialogRef}
    >
      <div className="dialog-content">
        <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
        <h2 id={titleId} className="dialog-title">
          {t.title}
        </h2>
        <p className="privacy-updated">{t.updated}</p>
        <p className="privacy-operator">{t.operatorLine}</p>

        <div className="privacy-sections">
          {t.sections.map((section) => (
            <section key={section.heading} className="privacy-section">
              <h3 className="privacy-heading">{section.heading}</h3>
              <p className="privacy-body">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="privacy-footer">
          <a
            href={lang === "en" ? "/privacy#en-privacy" : "/privacy"}
            className="pill-btn pill-outline-light pill-sm"
          >
            <span>{t.fullPageLabel}</span>
            <ExternalLink size={14} />
          </a>
          <button
            type="button"
            className="pill-btn pill-dark pill-sm"
            onClick={closeModal}
          >
            {t.closeLabel}
          </button>
        </div>
      </div>
    </NativeModal>
  );
}
