"use client";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { services, type Project } from "./content";
import { Arrow, SectionLabel } from "./shared";

export function Modal({ titleId, onClose, children, variant }: { titleId: string; onClose: () => void; children: ReactNode; variant: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return <dialog className={`modal ${variant}`} ref={ref} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose();
  }}>
    <button className="close-modal" aria-label="Close dialog" onClick={onClose}><span aria-hidden="true">×</span></button>{children}
  </dialog>;
}

export function ProjectDetail({ project, onClose, onStart }: { project: Project; onClose: () => void; onStart: () => void }) {
  return <Modal variant="case-modal" titleId="case-title" onClose={onClose}>
    <div className={`case-image case-${project.look}`}><img src={project.image} alt={project.alt} /></div>
    <div className="case-body"><SectionLabel>Concept study / {project.id}</SectionLabel>
      <h2 id="case-title">{project.title}</h2><p className="case-meta">{project.type} / {project.year}</p>
      <p>{project.idea}</p><p>{project.design}</p>
      <div className="deliverables"><span>Scope</span><p>{project.deliverables}</p></div>
      <button className="primary-button dark-button" onClick={onStart}>Discuss a project <Arrow /></button>
    </div>
  </Modal>;
}

export function Inquiry({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const token = useRef("");
  const confirmation = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (status === "sent") confirmation.current?.focus(); }, [status]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    if (!token.current) token.current = crypto.randomUUID();
    setStatus("sending"); setError("");
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, id: token.current }) });
      const result = await response.json() as { reference?: string; error?: string };
      if (!response.ok || !result.reference) throw new Error(result.error || "Please try sending your brief again.");
      setReference(result.reference); setStatus("sent");
    } catch (err) {
      setError(err instanceof TypeError ? "Connection interrupted. Your brief is still here. Please try again." : err instanceof Error ? err.message : "Please try again.");
      setStatus("idle");
    }
  }
  return <Modal titleId="inquiry-title" onClose={onClose} variant="inquiry-modal">
    <SectionLabel>A/09 / Project inquiry</SectionLabel>
    {status === "sent" ? <div className="sent-state"><h2 id="inquiry-title" ref={confirmation} tabIndex={-1}>Brief received.</h2><p>Your project is in the studio inbox. We’ll use the email you supplied to get in touch.</p><p className="reference">Inquiry / {reference}</p><button className="primary-button dark-button" onClick={onClose}>Back to the studio <Arrow /></button></div> :
    <><h2 id="inquiry-title">Start a project.</h2><form onSubmit={submit}>
      <div className="field-pair"><label>Your name<input name="name" autoComplete="name" placeholder="Full name" required maxLength={100} /></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254} /></label></div>
      <label>Interested in<select name="service" defaultValue="Still exploring"><option>Still exploring</option>{services.map(s => <option key={s.title}>{s.title}</option>)}</select></label>
      <label>Project brief<textarea name="brief" required minLength={10} maxLength={3000} rows={4} placeholder="What are you hoping to make? Share your goals, scope or timing." /></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="primary-button dark-button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending brief…" : "Send project brief"}<Arrow /></button>
    </form></>}
  </Modal>;
}
