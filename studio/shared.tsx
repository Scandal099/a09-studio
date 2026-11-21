import type { ReactNode } from "react";

export function Wordmark() {
  return (
    <span className="wordmark">
      А<span className="wordmark-slash" aria-hidden="true">/</span>09
    </span>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="section-eyebrow">
      <span className="eyebrow-mark" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

const ARROW_ROTATION_CLASS: Record<
  "up-right" | "right" | "down" | "up" | "left",
  string
> = {
  "up-right": "icon icon-rot-up-right",
  right: "icon",
  down: "icon icon-rot-down",
  up: "icon icon-rot-up",
  left: "icon icon-rot-left",
};

export function Arrow({
  direction = "up-right",
  size = 16,
}: {
  direction?: "up-right" | "right" | "down" | "up" | "left";
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={ARROW_ROTATION_CLASS[direction]}
    >
      <path
        d="M4.25 10h11.5m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Check({ size = 15 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className="icon"
    >
      <path
        d="M4.5 10.5 8.25 14.25 15.75 6.25"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Copy({ size = 15 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className="icon"
    >
      <rect
        x="7.25"
        y="7.25"
        width="9.5"
        height="9.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12.75 7.25V4.75a1.5 1.5 0 0 0-1.5-1.5h-6.5a1.5 1.5 0 0 0-1.5 1.5v6.5a1.5 1.5 0 0 0 1.5 1.5h2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Telegram({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className="icon"
    >
      <path
        d="M17.25 3.75 2.75 9.65l5.1 1.75 1.85 5.1 2.7-3.15 3.6 2.6 1.25-12.2Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path
        d="M7.85 11.4 14.2 6.5"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PhoneIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className="icon"
    >
      <path
        d="M5.6 3.5h2.2l1.1 3.1-1.45 1.15a9.4 9.4 0 0 0 4.8 4.8l1.15-1.45 3.1 1.1v2.2a1.5 1.5 0 0 1-1.6 1.5C8.55 15.65 4.35 11.45 4.1 5.1A1.5 1.5 0 0 1 5.6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Close({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className="icon"
    >
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className="icon"
    >
      <path
        d="M3.5 7h13M3.5 13h13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className="icon"
    >
      <path
        d="M11.5 4.25h4.25v4.25M15.5 4.5 9.25 10.75M14.75 11.75v3a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1v-8.5a1 1 0 0 1 1-1h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
