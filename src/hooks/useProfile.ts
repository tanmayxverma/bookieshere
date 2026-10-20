import { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo, type ReactNode, createElement } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { safeRandomUUID } from '@/lib/utils';

const DEVICE_ID_KEY = 'ypt_device_id';
const PROFILE_CACHE_KEY = 'bookie_profile_cache_v1';

export const TARGET_CATEGORIES = [
  'JEE 2026',
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
    id = safeRandomUUID();
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

function defaultGuestProfile(deviceId: string, displayName = 'Aspirant', target = 'JEE 2027'): Profile {
  return {
    id: `guest_${deviceId.replace(/-/g, '').substring(0, 16)}`,
    user_id: null,
    device_id: deviceId,
    account_type: 'guest',
    display_name: displayName,
    avatar_url: null,
    target_category: target,
    onboarded_at: displayName !== 'Aspirant' ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function isPlaceholderName(name?: string | null): boolean {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return n === '' || n === 'aspirant' || n === 'anonymous aspirant';
}

function useProfileInternal() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const deviceId = getOrCreateDeviceId();
  const cached = readCache();
  const [profile, setProfileState] = useState<Profile>(() => cached || defaultGuestProfile(deviceId));
  const [loading, setLoading] = useState(false);
  const [identityModalOpen, setIdentityModalOpen] = useState(false);

  const setProfile = useCallback((p: Profile | null) => {
    const next = p || defaultGuestProfile(deviceId);
    setProfileState(next);
    writeCache(next);
  }, [deviceId]);

  const lastLoadedSessionKeyRef = useRef<string | null>(null);

  const loadProfile = useCallback(async (sess: Session | null, force = false) => {
    const sessionKey = sess?.user?.id || `guest_${deviceId}`;
    if (!force && lastLoadedSessionKeyRef.current === sessionKey) {
      return;
    }
    lastLoadedSessionKeyRef.current = sessionKey;

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

        if (data) {
          const prof = data as Profile;
          // If Google avatar is available and no avatar set, auto-attach
          if (!prof.avatar_url && googleAvatar) {
            prof.avatar_url = googleAvatar;
          }
          setProfile(prof);
        } else {
          // If no profile found for auth user, check trigger or create
          const isGoogle = sess.user.app_metadata?.provider === 'google' || !!googleAvatar;
          const meta = (sess.user.user_metadata || {}) as Record<string, any>;
          const dName = meta.full_name || meta.name || sess.user.email?.split('@')[0] || 'Aspirant';
          const { data: created } = await (supabase as any)
            .from('profiles')
            .upsert({
              user_id: sess.user.id,
              account_type: isGoogle ? 'google' : 'email',
              display_name: dName,
              avatar_url: googleAvatar,
              target_category: 'JEE 2027',
              onboarded_at: dName !== 'Aspirant' ? new Date().toISOString() : null,
            }, { onConflict: 'user_id' })
            .select()
            .single();
          if (created) setProfile(created as Profile);
        }
      } else {
        // GUEST USER FLOW:
        // 1. First check if ypt_users table has a real saved name for this deviceId
        let yptName: string | null = null;
        let yptYear: string | null = null;
        try {
          const { data: yptRow } = await (supabase as any)
            .from('ypt_users')
            .select('name, jee_focus_year')
            .eq('device_id', deviceId)
            .maybeSingle();
          if (yptRow?.name && !isPlaceholderName(yptRow.name)) {
            yptName = yptRow.name.trim();
          }
          if (yptRow?.jee_focus_year) {
            yptYear = yptRow.jee_focus_year.trim();
          }
        } catch {}

        // 2. Query profiles table for guest device
        const { data } = await (supabase as any).rpc('get_guest_profile', { _device_id: deviceId });
        let row = Array.isArray(data) ? data[0] : data;

        if (row) {
          // If profile display_name is placeholder but ypt_users had a real name, recover it!
          if (isPlaceholderName(row.display_name) && yptName) {
            try {
              const { data: recovered } = await (supabase as any).rpc('upsert_guest_profile', {
                _device_id: deviceId,
                _display_name: yptName,
                _target_category: yptYear || row.target_category || 'JEE 2027',
                _avatar_url: row.avatar_url || null,
              });
              if (recovered) row = recovered;
            } catch {}
          }
          setProfile(row as Profile);
        } else {
          // If no profile row in DB yet:
          if (yptName) {
            // Recover from ypt_users immediately!
            try {
              const { data: created } = await (supabase as any).rpc('upsert_guest_profile', {
                _device_id: deviceId,
                _display_name: yptName,
                _target_category: yptYear || 'JEE 2027',
                _avatar_url: null,
              });
              if (created) {
                setProfile(created as Profile);
                return;
              }
            } catch {}
            setProfile(defaultGuestProfile(deviceId, yptName, yptYear || 'JEE 2027'));
          } else {
            // Brand new guest: don't force 'Aspirant' as final onboarded name
            setProfile(defaultGuestProfile(deviceId));
          }
        }
      }
    } catch (e) {
      console.warn('Profile load transient error:', e);
    } finally {
      setLoading(false);
    }
  }, [deviceId, setProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        lastLoadedSessionKeyRef.current = null;
        setProfile(null);
        setLoading(true);
        loadProfile(s, true);
      } else {
        loadProfile(s, false);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile, setProfile]);

  const refetch = useCallback(() => loadProfile(session, true), [loadProfile, session]);

  const saveProfile = useCallback(async (input: {
    display_name: string;
    target_category: string;
    avatar_url?: string | null;
    avatar_customized?: boolean;
  }) => {
    const trimmedName = input.display_name.trim();
    const cleanYear = input.target_category.trim() || 'JEE 2027';

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
        display_name: trimmedName,
        target_category: cleanYear,
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

      // Synchronize to ypt_users table
      try {
        await (supabase as any)
          .from('ypt_users')
          .upsert({
            user_id: session.user.id,
            device_id: deviceId,
            name: trimmedName,
            jee_focus_year: cleanYear,
          }, { onConflict: 'device_id' });
      } catch (err) {
        console.warn('ypt_users sync error:', err);
      }

      return { data: data as Profile | null, error };
    } else {
      // GUEST USER SAVE
      const avatar = input.avatar_url !== undefined ? input.avatar_url : (profile?.avatar_url ?? null);

      const { data, error } = await (supabase as any).rpc('upsert_guest_profile', {
        _device_id: deviceId,
        _display_name: trimmedName,
        _target_category: cleanYear,
        _avatar_url: avatar,
      });

      if (!error && data) {
        const p = data as Profile;
        p.avatar_customized = true;
        setProfile(p);
      } else {
        // Local-first fallback if RPC temporarily fails
        const fallback: Profile = {
          id: profile?.id || `guest_${deviceId.replace(/-/g, '').substring(0, 16)}`,
          user_id: null,
          device_id: deviceId,
          account_type: 'guest',
          display_name: trimmedName,
          avatar_url: avatar,
          avatar_customized: true,
          target_category: cleanYear,
          onboarded_at: new Date().toISOString(),
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(fallback);
      }

      // Synchronize to ypt_users table for guest as well
      try {
        await (supabase as any)
          .from('ypt_users')
          .upsert({
            device_id: deviceId,
            name: trimmedName,
            jee_focus_year: cleanYear,
          }, { onConflict: 'device_id' });
      } catch (err) {
        console.warn('Guest ypt_users sync error:', err);
      }

      return { data: (data as Profile) || profile, error: null };
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
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out transient error:", err);
    }
    writeCache(null);
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

  const isNamePlaceholder = useMemo(() => isPlaceholderName(profile?.display_name), [profile?.display_name]);

  // Needs identity setup if display_name is placeholder Aspirant or un-onboarded
  const needsIdentitySetup = useMemo(() => {
    return isNamePlaceholder || !profile?.onboarded_at;
  }, [isNamePlaceholder, profile?.onboarded_at]);

  const openIdentityModal = useCallback(() => {
    setIdentityModalOpen(true);
  }, []);

  return {
    user,
    session,
    profile,
    loading,
    deviceId,
    googleAvatar,
    isOnboarded: !needsIdentitySetup,
    isAuthenticated: !!session,
    isNamePlaceholder,
    needsIdentitySetup,
    identityModalOpen,
    setIdentityModalOpen,
    openIdentityModal,
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