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
  if (error) throw error;
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

  const login = useCallback(async (password1: string, password2: string) => {
    const deviceId = localStorage.getItem('ypt_device_id') ?? 'unknown';
    const res = await invoke<{ token?: string; error?: string }>('admin-login', { password1, password2, device_id: deviceId });
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