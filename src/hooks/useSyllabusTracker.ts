import { useCallback, useEffect, useMemo, useState } from "react";
import { ALL_CHAPTERS, MAX_STARS } from "@/data/jeeSyllabus";
import { useProfile } from "@/hooks/useProfile";

interface StoredData {
  updated_at: string;
  stars: Record<string, number>; // chapter key -> 0..3
}

const THREE_MONTHS_MS = 1000 * 60 * 60 * 24 * 90;

function storageKey(profileKey: string) {
  return `bookie_syllabus_progress_v1::${profileKey}`;
}

function readStore(profileKey: string): StoredData {
  try {
    const raw = localStorage.getItem(storageKey(profileKey));
    if (!raw) return { updated_at: new Date().toISOString(), stars: {} };
    const parsed = JSON.parse(raw) as StoredData;
    // 3-month auto-clear for inactive data
    if (Date.now() - new Date(parsed.updated_at).getTime() > THREE_MONTHS_MS) {
      localStorage.removeItem(storageKey(profileKey));
      return { updated_at: new Date().toISOString(), stars: {} };
    }
    return parsed;
  } catch {
    return { updated_at: new Date().toISOString(), stars: {} };
  }
}

function writeStore(profileKey: string, data: StoredData) {
  try { localStorage.setItem(storageKey(profileKey), JSON.stringify(data)); } catch {}
}

export function useSyllabusTracker() {
  const { profile, deviceId } = useProfile();
  const profileKey = profile?.id || deviceId;

  const [stars, setStars] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!profileKey) return;
    const s = readStore(profileKey);
    setStars(s.stars);
  }, [profileKey]);

  const setStar = useCallback((chapterKey: string, value: number) => {
    if (!profileKey) return;
    setStars((prev) => {
      const next = { ...prev, [chapterKey]: value };
      if (value <= 0) delete next[chapterKey];
      writeStore(profileKey, { updated_at: new Date().toISOString(), stars: next });
      return next;
    });
  }, [profileKey]);

  const cycleStar = useCallback((chapterKey: string) => {
    const current = stars[chapterKey] || 0;
    setStar(chapterKey, (current + 1) % (MAX_STARS + 1));
  }, [stars, setStar]);

  const resetAll = useCallback(() => {
    if (!profileKey) return;
    setStars({});
    writeStore(profileKey, { updated_at: new Date().toISOString(), stars: {} });
  }, [profileKey]);

  const overall = useMemo(() => {
    const total = ALL_CHAPTERS.length * MAX_STARS;
    const earned = Object.values(stars).reduce((a, b) => a + Math.min(MAX_STARS, b), 0);
    return total ? Math.round((earned / total) * 100) : 0;
  }, [stars]);

  return { stars, setStar, cycleStar, resetAll, overall };
}