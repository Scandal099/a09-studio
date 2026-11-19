"use client";
import { useEffect, useRef, useState } from "react";
import { Header, Hero } from "@/studio/hero";
import { projects, services, stages, studioContact, type Project } from "@/studio/content";
import { Arrow, SectionLabel, Wordmark } from "@/studio/shared";
import { Inquiry, ProjectDetail } from "@/studio/dialogs";

function StudioSection() {
  return <section id="studio" className="studio-section paper section-pad" aria-labelledby="studio-title">
    <div className="studio-lead">
      <SectionLabel>01 / Studio</SectionLabel>
      <h2 id="studio-title">We don’t just build websites.<br /><span>We shape digital identities.</span></h2>
      <p>Independent by design. A/09 brings strategy, visual identity and code together to give each business a digital form of its own.</p>
      <a className="text-link" href="#approach">Our approach <Arrow size={17} /></a>
    </div>
    <div className="identity-materials">
      <figure className="studio-wall"><img src="/art/wall.webp" width={667} height={409} alt="Original A/09 concrete wall and stencilled identity." /><figcaption>01—A / Environmental identity</figcaption></figure>
      <figure className="studio-poster"><div><img src="/art/poster.webp" width={317} height={389} alt="Original A/09 poster, divided by a diagonal slash." /></div><figcaption>01—B / Print study</figcaption></figure>
    </div>
    <div className="studio-symbol"><div className="symbol-text" aria-label="A/09"><span>A</span><span>/</span><span>09</span></div><div><h3>The art of becoming.</h3><p>A for the first idea. A slash for transformation. Zero to nine, from a starting point to a finished form.</p></div></div>
  </section>;
}

function SelectedWork({ onSelect }: { onSelect: (project: Project) => void }) {
  return <section className="work-section section-pad" id="work" aria-labelledby="work-title"><SectionLabel>02 / Projects</SectionLabel>
    <div className="section-heading"><h2 id="work-title">Selected work</h2><span className="range">/ &nbsp;001—004</span></div>
    <div className="work-grid">{projects.map(p => <button className={`work-card work-${p.look}`} key={p.id} onClick={() => onSelect(p)} aria-label={`View ${p.title} concept study`}>
      <div className="project-image"><img src={p.image} alt={p.alt} loading="lazy" width={p.look === "poster" ? 317 : 1200} height={p.look === "poster" ? 389 : 800} />
        {p.look === "terrain" && <span className="terrain-masthead" aria-hidden="true">Terrain Index<span>Field journal</span></span>}
        <span className="view-case"><Arrow size={23} /></span>
      </div>
      <div className="project-caption"><span className="project-number">/{p.id}</span><div><h3>{p.title}</h3><p>{p.type} / {p.year}</p></div><span className="concept-tag">Concept study</span></div>
      <span className="project-scope">{p.scope}</span>
    </button>)}</div>
  </section>;
}

function Expertise() {
  const [opened, setOpened] = useState<number | null>(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? opened;
  return <section id="services" className="services-section paper section-pad" aria-labelledby="services-title">
    <div className="services-heading"><SectionLabel>03 / Expertise</SectionLabel><h2 id="services-title">What we do.</h2></div>
    <div className="services-list" onPointerLeave={() => setHovered(null)}>{services.map((s, i) => {
      const expanded = i === active;
      return <div className={expanded ? "service expanded" : "service"} key={s.title} onPointerEnter={e => { if (e.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) setHovered(i); }}>
        <h3><button aria-expanded={expanded} aria-controls={`service-${i}`} id={`service-trigger-${i}`} onClick={() => { setOpened(opened === i ? null : i); setHovered(null); }} onKeyDown={e => { if (e.key === " " || e.key === "Enter") setHovered(null); }}><span className="service-number">0{i + 1} /</span>{s.title}<span className="disclosure" aria-hidden="true"><i /><i /></span></button></h3>
        <div className="service-description" id={`service-${i}`} role="region" aria-labelledby={`service-trigger-${i}`} aria-hidden={!expanded}><div><p>{s.copy}</p></div></div>
      </div>;
    })}</div>
  </section>;
}

function WallScene() {
  return <section className="wall-sequence" aria-label="A/09 concrete identity campaign">
    <div className="wall-stage"><picture className="wall-picture"><source media="(orientation: portrait) and (max-width: 1024px)" srcSet="/art/wall-portrait.webp" /><img src="/art/wall-wide.webp" loading="lazy" width={1672} height={941} alt="An A/09 stencil across concrete panels. A blurred pedestrian crosses the frame." /></picture>
    <div className="wall-statement"><span className="mono">A/09 / Spatial study</span><h2>Not made to blend in.</h2></div><div className="wall-slash" aria-hidden="true" /></div>
  </section>;
}

function Approach() {
  return <section id="approach" className="approach-section paper section-pad" aria-labelledby="approach-title"><SectionLabel>04 / Approach</SectionLabel>
    <div className="section-heading"><h2 id="approach-title">From zero to nine.</h2><span className="range">0 &nbsp;—&nbsp; 9</span></div>
    <div className="process-grid">{stages.map((s, i) => <article key={s.name}><div className="stage-num">0{i + 1}<span> /</span></div><h3>{s.name}</h3><p>{s.text}</p></article>)}</div>
  </section>;
}

function Contact({ onStart }: { onStart: () => void }) {
  return <footer id="contact" className="contact-section"><div className="contact-content">
    <SectionLabel>05 / Contact</SectionLabel><h2>Have something<br />in mind?</h2>
    <div className="contact-cta"><p>Let’s make it real.</p><button className="primary-button" onClick={onStart}>Start a project <Arrow size={21} /></button></div>
    {(studioContact.email || studioContact.socials.length > 0) && <div className="contact-links">{studioContact.email && <a href={`mailto:${studioContact.email}`}>{studioContact.email}</a>}{studioContact.socials.map(s => <a key={s.name} href={s.url}>{s.name}<Arrow size={15} /></a>)}</div>}
    <div className="footer-line"><span>© A/09 Digital Studio</span><a href="#top">Back to top <Arrow direction="up" size={16} /></a></div>
    </div><div className="footer-mark" aria-hidden="true"><Wordmark /></div></footer>;
}

function useStudioMotion() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let revert: (() => void) | undefined;
    const enabled = window.matchMedia("(prefers-reduced-motion: no-preference)");
    if (!enabled.matches) return;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const ctx = gsap.context(() => {
          gsap.from(".symbol-text span", { x: (i: number) => (i - 1) * 34, scrollTrigger: { trigger: ".studio-symbol", start: "top 96%", end: "center 55%", scrub: true } });
          const wall = gsap.timeline({ scrollTrigger: { trigger: ".wall-sequence", start: "top top", end: "bottom 50%", scrub: true } });
          wall.to(".wall-picture", { scale: 1.15, ease: "none", duration: 0.7 }).to(".wall-picture", { scale: 1.78, ease: "power1.in", duration: 0.3 });
          wall.fromTo(".wall-slash", { xPercent: -100 }, { xPercent: 105, ease: "none", duration: 0.19 }, 0.81);
        }, root);
        return () => ctx.revert();
      });
      revert = () => mm.revert();
    });
    return () => { disposed = true; revert?.(); };
  }, []);
  return root;
}

export default function Studio() {
  const root = useStudioMotion();
  const [detail, setDetail] = useState<Project | null>(null);
  const [inquiry, setInquiry] = useState(false);
  const startProject = () => { setDetail(null); setInquiry(true); };
  return <div className="site" id="top" ref={root}>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="intro-curtain" aria-hidden="true"><Wordmark /></div>
    <Header onStart={startProject} />
    <main id="main"><Hero /><StudioSection /><SelectedWork onSelect={setDetail} /><Expertise /><WallScene /><Approach /></main>
    <Contact onStart={startProject} />
    {detail && <ProjectDetail project={detail} onClose={() => setDetail(null)} onStart={startProject} />}
    {inquiry && <Inquiry onClose={() => setInquiry(false)} />}
  </div>;
}
