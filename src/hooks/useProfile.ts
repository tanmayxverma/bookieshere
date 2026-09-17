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
  avatar_customized?: boolean;
  target_category: string;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export function extractGoogleAvatar(user: User | null | undefined): string | null {
  if (!user) return null;
  const meta = (user.user_metadata || {}) as Record<string, any>;
  if (typeof meta.avatar_url === 'string' && meta.avatar_url.trim()) return meta.avatar_url.trim();
  if (typeof meta.picture === 'string' && meta.picture.trim()) return meta.picture.trim();
  if (Array.isArray(user.identities)) {
    const googleId = user.identities.find((i) => i.provider === 'google');
    const data = (googleId?.identity_data || {}) as Record<string, any>;
    if (typeof data.avatar_url === 'string' && data.avatar_url.trim()) return data.avatar_url.trim();
    if (typeof data.picture === 'string' && data.picture.trim()) return data.picture.trim();
  }
  return null;
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
        if (deviceId) {
          try {
            await (supabase as any).rpc('migrate_guest_data_to_user', {
              _device_id: deviceId,
              _user_id: sess.user.id,
            });
          } catch {}
        }
        const googleAvatar = extractGoogleAvatar(sess.user);
        const { data } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('user_id', sess.user.id)
          .maybeSingle();

        let prof = (data as Profile | null) ?? null;

        if (prof) {
          // Determine if avatar was customized vs using default Google avatar
          const isCustomized = !!(prof.avatar_url && prof.avatar_url !== googleAvatar);
          prof.avatar_customized = isCustomized;

          // If avatar is missing or empty and Google avatar is available, persist it
          if (!isCustomized && googleAvatar && (!prof.avatar_url || prof.avatar_url === '')) {
            prof = { ...prof, avatar_url: googleAvatar, avatar_customized: false };
            (supabase as any)
              .from('profiles')
              .update({ avatar_url: googleAvatar })
              .eq('user_id', sess.user.id)
              .then(() => {});
          }
        } else {
          // Synthesize profile if row doesn't exist yet
          const isGoogle = sess.user.app_metadata?.provider === 'google' || !!googleAvatar;
          const meta = (sess.user.user_metadata || {}) as Record<string, any>;
          const displayName = meta.full_name || meta.name || sess.user.email?.split('@')[0] || 'Aspirant';
          const newProf: Profile = {
            id: sess.user.id,
            user_id: sess.user.id,
            device_id: null,
            account_type: isGoogle ? 'google' : 'email',
            display_name: displayName,
            avatar_url: googleAvatar || null,
            avatar_customized: false,
            target_category: 'JEE 2027',
            onboarded_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          prof = newProf;

          // Safely persist to Supabase without invalid schema columns
          (supabase as any)
            .from('profiles')
            .upsert({
              user_id: sess.user.id,
              account_type: isGoogle ? 'google' : 'email',
              display_name: displayName,
              avatar_url: googleAvatar || null,
              target_category: 'JEE 2027',
            }, { onConflict: 'user_id' })
            .select()
            .maybeSingle()
            .then(({ data: createdRow }: any) => {
              if (createdRow) {
                const cp = createdRow as Profile;
                cp.avatar_customized = !!(cp.avatar_url && cp.avatar_url !== googleAvatar);
                setProfile(cp);
              }
            })
            .catch(() => {});
        }

        setProfile(prof);
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
    avatar_customized?: boolean;
  }) => {
    if (session?.user) {
      const googleAvatar = extractGoogleAvatar(session.user);
      const isGoogle = session.user.app_metadata?.provider === 'google' || !!googleAvatar;

      let customized = profile?.avatar_customized ?? false;
      if (input.avatar_customized !== undefined) {
        customized = input.avatar_customized;
      } else if (input.avatar_url !== undefined && input.avatar_url !== googleAvatar) {
        customized = true;
      }

      const avatar = input.avatar_url !== undefined
        ? input.avatar_url
        : (profile?.avatar_url ?? (!customized ? googleAvatar : null));

      const payload = {
        user_id: session.user.id,
        display_name: input.display_name,
        target_category: input.target_category,
        avatar_url: avatar,
        account_type: isGoogle ? 'google' : 'email',
        onboarded_at: new Date().toISOString(),
      };
      const { data, error } = await (supabase as any)
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();
      if (!error && data) {
        const p = data as Profile;
        p.avatar_customized = customized;
        setProfile(p);
      }
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
  }, [session, profile, deviceId, setProfile]);

  const updateAvatar = useCallback(async (avatar_url: string | null) => {
    if (!profile) return { error: new Error('no profile') } as any;
    if (session?.user) {
      const googleAvatar = extractGoogleAvatar(session.user);
      const isCustomized = avatar_url !== googleAvatar;
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url })
        .eq('user_id', session.user.id)
        .select()
        .single();
      if (!error && data) {
        const p = data as Profile;
        p.avatar_customized = isCustomized;
        setProfile(p);
      }
      return { data, error };
    } else {
      return saveProfile({
        display_name: profile.display_name,
        target_category: profile.target_category,
        avatar_url,
        avatar_customized: true,
      });
    }
  }, [profile, session, saveProfile, setProfile]);

  const resetToGoogleAvatar = useCallback(async () => {
    if (!session?.user) return { error: new Error('Not signed in') };
    const googleAvatar = extractGoogleAvatar(session.user);
    if (!googleAvatar) return { error: new Error('No Google avatar available') };
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ avatar_url: googleAvatar })
      .eq('user_id', session.user.id)
      .select()
      .single();
    if (!error && data) {
      const p = data as Profile;
      p.avatar_customized = false;
      setProfile(p);
    }
    return { data, error };
  }, [session, setProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, [setProfile]);

  const deleteAccount = useCallback(async () => {
    try {
      await (supabase as any).rpc('delete_my_account_and_data', { _device_id: deviceId });
    } catch (err) {
      console.warn('Error deleting account data:', err);
    }
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      localStorage.clear();
    } catch {}
    setProfile(null);
  }, [deviceId, setProfile]);

  const googleAvatar = useMemo(() => extractGoogleAvatar(user || session?.user), [user, session]);

  return {
    user,
    session,
    profile,
    loading,
    deviceId,
    googleAvatar,
    isOnboarded: !!profile?.onboarded_at,
    isAuthenticated: !!session,
    saveProfile,
    updateAvatar,
    resetToGoogleAvatar,
    signOut,
    deleteAccount,
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