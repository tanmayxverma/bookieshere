import { useCallback, useEffect, useMemo, useState } from "react";
import { ALL_CHAPTERS, MAX_STARS } from "@/data/jeeSyllabus";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

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
  const { profile, deviceId, isAuthenticated } = useProfile();
  const profileKey = profile?.id || deviceId;

  const [stars, setStars] = useState<Record<string, number>>({});

  // Load from DB when possible, fall back to localStorage. Also merge local → DB
  // on first login so guest progress carries over to Gmail account.
  useEffect(() => {
    if (!profileKey) return;
    const local = readStore(profileKey);
    setStars(local.stars);

    let cancelled = false;
    (async () => {
      try {
        let rows: any[] | null = null;
        if (isAuthenticated && profile) {
          const { data } = await supabase
            .from('syllabus_progress' as any)
            .select('chapter_key, stars')
            .eq('profile_id', profile.id);
          rows = data as any[] | null;
        } else if (deviceId) {
          const { data } = await (supabase as any).rpc('guest_list_syllabus_progress', { _device_id: deviceId });
          rows = data;
        }
        if (cancelled) return;
        const remote: Record<string, number> = {};
        (rows || []).forEach((r: any) => { remote[r.chapter_key] = r.stars; });

        // Merge: prefer higher star count between local & remote per chapter
        const merged: Record<string, number> = { ...remote };
        let needsUpload = false;
        for (const [k, v] of Object.entries(local.stars)) {
          if ((merged[k] || 0) < v) { merged[k] = v; needsUpload = true; }
        }
        setStars(merged);
        writeStore(profileKey, { updated_at: new Date().toISOString(), stars: merged });

        // Push any local-only progress up so it survives across devices
        if (needsUpload) {
          const toUpload = Object.entries(local.stars).filter(([k, v]) => (remote[k] || 0) < v);
          if (toUpload.length > 0) {
            if (isAuthenticated && profile) {
              const rows = toUpload.map(([k, v]) => ({
                profile_id: profile.id,
                chapter_key: k,
                stars: v,
              }));
              await supabase
                .from('syllabus_progress' as any)
                .upsert(rows, { onConflict: 'profile_id,chapter_key' });
            } else if (deviceId) {
              await Promise.all(
                toUpload.map(([k, v]) =>
                  (supabase as any).rpc('guest_upsert_syllabus_progress', { _device_id: deviceId, _chapter_key: k, _stars: v })
                )
              );
            }
          }
        }
      } catch { /* offline / no profile — localStorage still works */ }
    })();
    return () => { cancelled = true; };
  }, [profileKey, isAuthenticated, profile, deviceId]);

  const setStar = useCallback((chapterKey: string, value: number) => {
    if (!profileKey) return;
    setStars((prev) => {
      const next = { ...prev, [chapterKey]: value };
      if (value <= 0) delete next[chapterKey];
      writeStore(profileKey, { updated_at: new Date().toISOString(), stars: next });
      return next;
    });
    // Best-effort DB sync (fire-and-forget)
    (async () => {
      try {
        if (isAuthenticated && profile) {
          if (value <= 0) {
            await supabase.from('syllabus_progress' as any)
              .delete().eq('profile_id', profile.id).eq('chapter_key', chapterKey);
          } else {
            await supabase.from('syllabus_progress' as any)
              .upsert({ profile_id: profile.id, chapter_key: chapterKey, stars: value }, { onConflict: 'profile_id,chapter_key' });
          }
        } else if (deviceId) {
          await (supabase as any).rpc('guest_upsert_syllabus_progress', {
            _device_id: deviceId, _chapter_key: chapterKey, _stars: Math.max(0, value),
          });
        }
      } catch {}
    })();
  }, [profileKey, isAuthenticated, profile, deviceId]);

  const cycleStar = useCallback((chapterKey: string) => {
    const current = stars[chapterKey] || 0;
    setStar(chapterKey, (current + 1) % (MAX_STARS + 1));
  }, [stars, setStar]);

  const resetAll = useCallback(() => {
    if (!profileKey) return;
    setStars({});
    writeStore(profileKey, { updated_at: new Date().toISOString(), stars: {} });
    (async () => {
      try {
        if (isAuthenticated && profile) {
          await supabase.from('syllabus_progress' as any).delete().eq('profile_id', profile.id);
        } else if (deviceId) {
          await (supabase as any).rpc('guest_reset_syllabus_progress', { _device_id: deviceId });
        }
      } catch {}
    })();
  }, [profileKey, isAuthenticated, profile, deviceId]);

  const overall = useMemo(() => {
    const total = ALL_CHAPTERS.length * MAX_STARS;
    const earned = Object.values(stars).reduce((a, b) => a + Math.min(MAX_STARS, b), 0);
    return total ? Math.round((earned / total) * 100) : 0;
  }, [stars]);

  return { stars, setStar, cycleStar, resetAll, overall };
}