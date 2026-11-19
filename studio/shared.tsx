export function Arrow({ direction = "up-right", size = 18 }: { direction?: "up-right" | "down" | "up" | "left" | "right"; size?: number }) {
  const rotation = { "up-right": -45, down: 90, up: -90, left: 180, right: 0 }[direction];
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rotation}deg)` }}><path d="M4 12h15m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Wordmark() {
  return <span className="wordmark" aria-hidden="true">A<span>/</span>09</span>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="section-label"><i aria-hidden="true" />{children}</div>;
}
