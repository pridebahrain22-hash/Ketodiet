import { useEffect, useState } from 'react';

const OFFER_DURATION_MS = 5 * 60 * 60 * 1000; // 5 hours
const STORAGE_KEY = 'ketolife_5h_offer_deadline';

function getOrCreateDeadline(): number {
  const now = Date.now();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = Number(saved);
      if (Number.isFinite(parsed) && parsed > now && parsed - now <= OFFER_DURATION_MS) {
        return parsed;
      }
    }
    const next = now + OFFER_DURATION_MS;
    localStorage.setItem(STORAGE_KEY, String(next));
    return next;
  } catch {
    return now + OFFER_DURATION_MS;
  }
}

export interface CountdownParts {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
}

function formatRemaining(ms: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const hours = String(h).padStart(2, '0');
  const minutes = String(m).padStart(2, '0');
  const seconds = String(s).padStart(2, '0');
  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}:${minutes}:${seconds}`,
  };
}

export function useOfferCountdown(): CountdownParts {
  const [deadline, setDeadline] = useState<number>(() => getOrCreateDeadline());
  const [remainingMs, setRemainingMs] = useState<number>(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 1000) {
        const refreshed = now + OFFER_DURATION_MS;
        try {
          localStorage.setItem(STORAGE_KEY, String(refreshed));
        } catch {
          // Ignore storage error
        }
        setDeadline(refreshed);
        setRemainingMs(OFFER_DURATION_MS);
      } else {
        setRemainingMs(diff);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [deadline]);

  return formatRemaining(remainingMs);
}
