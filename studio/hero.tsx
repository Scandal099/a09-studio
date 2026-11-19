"use client";
import { useState } from "react";
import { studies } from "./content";
import { Arrow, Wordmark } from "./shared";

const links = [["Work", "work"], ["Services", "services"], ["Studio", "studio"], ["Contact", "contact"]];
export function Header({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  return <header className="site-header" onKeyDown={event => {
    if (event.key === "Escape" && open) { closeMenu(); document.getElementById("menu-toggle")?.focus(); }
  }}>
    <div className="header-inner">
      <a href="#top" className="brand" aria-label="A/09 Digital Studio, back to top" onClick={closeMenu}><Wordmark /><span className="brand-descriptor">DIGITAL<br />STUDIO</span></a>
      <nav aria-label="Main navigation" id="main-nav" className={open ? "navigation is-open" : "navigation"}>{links.map(([text, id]) => <a key={id} href={`#${id}`} onClick={closeMenu}>{text}</a>)}</nav>
      <div className="header-actions"><button className="header-cta" onClick={() => { closeMenu(); onStart(); }}>Start a project <Arrow size={15} /></button><button id="menu-toggle" aria-controls="main-nav" aria-expanded={open} className={open ? "menu-toggle is-open" : "menu-toggle"} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}><span /><span /></button></div>
    </div>
  </header>;
}
export function Hero() {
  const [active, setActive] = useState(0);
  const scene = studies[active];
  const cycle = (step: number) => setActive(index => (index + step + studies.length) % studies.length);
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-stage">
      <div className="hero-copy">
        <p className="hero-kicker"><span className="signal" aria-hidden="true"><i /><i /><i /><i /></span>Independent digital studio</p>
        <h1 id="hero-title"><span><b>Digital</b></span><span><b>experiences</b></span><span><b>with character.</b></span></h1>
        <a className="primary-button explore" href="#work">Explore our work <Arrow size={18} /></a>
      </div>
      <div className={`visual-stage scene-${active}`} role="region" aria-label="Studio visual studies" aria-roledescription="carousel">
        <div className="study-picture" key={scene.image}><img src={scene.image} srcSet={active === 2 ? undefined : `${scene.small} 768w, ${scene.image} ${active === 0 ? 1536 : 1672}w`} sizes="(max-width: 680px) 100vw, 55vw" alt={scene.alt} width={active === 2 ? 317 : 1536} height={active === 2 ? 389 : 1024} fetchPriority={active === 0 ? "high" : "auto"} /></div>
        <span className="frame-cross cross-tl" aria-hidden="true" /><span className="frame-cross cross-tr" aria-hidden="true" />
        <div className="study-caption" aria-live="polite" aria-atomic="true"><span>FIG. 0{active + 1}</span><span className="caption-rule" />{scene.name}</div>
        <div className="study-controls"><span className="count" aria-hidden="true">0{active + 1}<i>/</i><em>03</em></span><button onClick={() => cycle(-1)} aria-label="Previous visual study"><Arrow direction="left" size={15} /></button><button onClick={() => cycle(1)} aria-label="Next visual study"><Arrow direction="right" size={15} /></button></div>
      </div>
    </div>
    <div className="hero-baseline"><span className="discipline-list">Design <i>/</i> Development <i>/</i> Digital products</span><a href="#studio">Scroll to explore <Arrow size={15} direction="down" /></a></div>
  </section>;
}
