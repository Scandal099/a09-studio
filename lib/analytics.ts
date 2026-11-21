export interface UtmPayload {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  yclid?: string;
  gclid?: string;
  referrer?: string;
  landingUrl?: string;
}

const UTM_STORAGE_KEY = "a09_utm_v1";

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

export const YM_COUNTER_ID = (() => {
  const raw = (process.env.NEXT_PUBLIC_YM_ID ?? "").trim();
  if (!/^\d{5,12}$/.test(raw)) return null;
  return Number(raw);
})();

function pickParam(params: URLSearchParams, key: string): string | undefined {
  const val = params.get(key)?.trim();
  if (!val) return undefined;
  return val.slice(0, 120);
}

export function captureInitialUtm(): UtmPayload {
  if (typeof window === "undefined") return {};

  try {
    const existingRaw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    const existing: UtmPayload = existingRaw
      ? (JSON.parse(existingRaw) as UtmPayload)
      : {};

    const params = new URLSearchParams(window.location.search);
    const fresh: UtmPayload = {
      source: pickParam(params, "utm_source"),
      medium: pickParam(params, "utm_medium"),
      campaign: pickParam(params, "utm_campaign"),
      content: pickParam(params, "utm_content"),
      term: pickParam(params, "utm_term"),
      yclid: pickParam(params, "yclid"),
      gclid: pickParam(params, "gclid"),
    };

    const hasFreshUtm = Object.values(fresh).some(Boolean);
    const merged: UtmPayload = hasFreshUtm
      ? {
          ...existing,
          ...Object.fromEntries(
            Object.entries(fresh).filter(([, v]) => Boolean(v))
          ),
          landingUrl: window.location.pathname.slice(0, 200),
          referrer:
            existing.referrer ||
            (document.referrer ? document.referrer.slice(0, 200) : undefined),
        }
      : {
          ...existing,
          landingUrl:
            existing.landingUrl || window.location.pathname.slice(0, 200),
          referrer:
            existing.referrer ||
            (document.referrer ? document.referrer.slice(0, 200) : undefined),
        };

    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return {};
  }
}

export function getStoredUtm(): UtmPayload {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmPayload;
  } catch {
    return {};
  }
}

/** Fires a Yandex Metrika reachGoal event without sending any personal data. */
export function trackGoal(goalName: string): void {
  if (typeof window === "undefined" || !YM_COUNTER_ID) return;
  try {
    window.ym?.(YM_COUNTER_ID, "reachGoal", goalName);
  } catch {
    // Ignore analytics errors
  }
}
