import { useState, useEffect, useCallback, createContext, useContext, useMemo, type ReactNode, createElement } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

const DEVICE_ID_KEY = 'ypt_device_id';
const PROFILE_CACHE_KEY = 'bookie_profile_cache_v1';

export const TARGET_CATEGORIES = [
  'JEE 2027',
  'JEE 2028',
  'JEE 2029',
  'JEE 2030+',
  'Droppers',
  'Seniors',
  'Early Starters',
  'Other',
] as const;
export type TargetCategory = typeof TARGET_CATEGORIES[number];

export interface Profile {
  id: string;
  user_id: string | null;
  device_id: string | null;
  account_type: 'guest' | 'google' | 'email';
  display_name: string;
  avatar_url: string | null;
  target_category: string;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function readCache(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch { return null; }
}
function writeCache(p: Profile | null) {
  try {
    if (p) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch { /* ignore */ }
}

type ProfileContextValue = ReturnType<typeof useProfileInternal>;
const ProfileContext = createContext<ProfileContextValue | null>(null);

function useProfileInternal() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const cached = readCache();
  const [profile, setProfileState] = useState<Profile | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const deviceId = getOrCreateDeviceId();

  const setProfile = useCallback((p: Profile | null) => {
    setProfileState(p);
    writeCache(p);
  }, []);

  const loadProfile = useCallback(async (sess: Session | null) => {
    try {
      if (sess?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', sess.user.id)
          .maybeSingle();
        setProfile((data as Profile) ?? null);
      } else {
        const { data } = await (supabase as any).rpc('get_guest_profile', { _device_id: deviceId });
        const row = Array.isArray(data) ? data[0] : data;
        setProfile((row as Profile) ?? null);
      }
    } catch {
      /* keep cached profile on transient errors */
    } finally {
      setLoading(false);
    }
  }, [deviceId, setProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setProfile(null);
        setLoading(true);
      }
      setTimeout(() => loadProfile(s), 0);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      loadProfile(s);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(() => loadProfile(session), [loadProfile, session]);

  const saveProfile = useCallback(async (input: {
    display_name: string;
    target_category: string;
    avatar_url?: string | null;
  }) => {
    if (session?.user) {
      const payload = {
        user_id: session.user.id,
        display_name: input.display_name,
        target_category: input.target_category,
        avatar_url: input.avatar_url ?? null,
        account_type: (session.user.app_metadata?.provider === 'google' ? 'google' : 'email'),
        onboarded_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload as any, { onConflict: 'user_id' })
        .select()
        .single();
      if (!error && data) setProfile(data as Profile);
      return { data: data as Profile | null, error };
    } else {
      const { data, error } = await (supabase as any).rpc('upsert_guest_profile', {
        _device_id: deviceId,
        _display_name: input.display_name,
        _target_category: input.target_category,
        _avatar_url: input.avatar_url ?? null,
      });
      if (!error && data) setProfile(data as Profile);
      return { data: data as Profile | null, error };
    }
  }, [session, deviceId, setProfile]);

  const updateAvatar = useCallback(async (avatar_url: string | null) => {
    if (!profile) return { error: new Error('no profile') } as any;
    if (session?.user) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('user_id', session.user.id)
        .select()
        .single();
      if (!error && data) setProfile(data as Profile);
      return { data, error };
    } else {
      return saveProfile({
        display_name: profile.display_name,
        target_category: profile.target_category,
        avatar_url,
      });
    }
  }, [profile, session, saveProfile, setProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, [setProfile]);

  return {
    user,
    session,
    profile,
    loading,
    deviceId,
    isOnboarded: !!profile?.onboarded_at,
    isAuthenticated: !!session,
    saveProfile,
    updateAvatar,
    signOut,
    refetch,
  };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfileInternal();
  const memo = useMemo(() => value, [value]);
  return createElement(ProfileContext.Provider, { value: memo }, children);
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within <ProfileProvider>');
  return ctx;
}