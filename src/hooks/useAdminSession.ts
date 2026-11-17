import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const KEY = 'bookie_admin_token_v1';

function getToken() {
  try { return sessionStorage.getItem(KEY); } catch { return null; }
}
function setToken(t: string | null) {
  try { if (t) sessionStorage.setItem(KEY, t); else sessionStorage.removeItem(KEY); } catch { /* noop */ }
}

async function invoke<T = any>(fn: string, body: any): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    try {
      if ((error as any)?.context && typeof (error as any).context.json === 'function') {
        const bodyJson = await (error as any).context.json();
        if (bodyJson?.error) throw new Error(bodyJson.error);
      }
    } catch (inner) {
      if (inner instanceof Error && inner !== error) throw inner;
    }
    throw error;
  }
  return data as T;
}

export function useAdminSession() {
  const [token, setTok] = useState<string | null>(() => getToken());
  const [validating, setValidating] = useState<boolean>(!!getToken());
  const [valid, setValid] = useState<boolean>(false);

  const validate = useCallback(async () => {
    const t = getToken();
    if (!t) { setValid(false); setValidating(false); return; }
    try {
      const res = await invoke<{ valid: boolean }>('admin-session', { token: t });
      setValid(!!res.valid);
      if (!res.valid) { setToken(null); setTok(null); }
    } catch { setValid(false); }
    finally { setValidating(false); }
  }, []);

  useEffect(() => { validate(); }, [validate]);

  // 5-minute keepalive when valid
  useEffect(() => {
    if (!valid) return;
    const id = setInterval(() => { validate(); }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [valid, validate]);

  const login = useCallback(async (username: string, password: string) => {
    const deviceId = localStorage.getItem('ypt_device_id') ?? 'unknown';
    // The admin-login edge function still expects the legacy password1/password2
    // keys: password1 is the admin username, password2 is the admin password.
    const res = await invoke<{ token?: string; error?: string }>('admin-login', { password1: username, password2: password, device_id: deviceId });
    if (!res.token) throw new Error(res.error || 'login failed');
    setToken(res.token); setTok(res.token); setValid(true); setValidating(false);
    return res.token;
  }, []);

  const logout = useCallback(async () => {
    const t = getToken();
    if (t) { try { await invoke('admin-logout', { token: t }); } catch { /* noop */ } }
    setToken(null); setTok(null); setValid(false);
  }, []);

  const call = useCallback(async <T = any>(op: string, payload: any = {}): Promise<T> => {
    const t = getToken();
    if (!t) throw new Error('no admin session');
    const res: any = await invoke('admin-action', { token: t, op, payload });
    if (res?.error) throw new Error(res.error);
    return res as T;
  }, []);

  return { token, valid, validating, login, logout, call };
}