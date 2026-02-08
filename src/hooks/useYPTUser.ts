import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { YPTUser } from '@/types/ypt';

const DEVICE_ID_KEY = 'ypt_device_id';

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function useYPTUser() {
  const [user, setUser] = useState<YPTUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const deviceId = getOrCreateDeviceId();

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    const { data } = await (supabase as any)
      .from('ypt_users')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();
    setUser(data);
    setIsLoading(false);
  }, [deviceId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const createUser = async (name: string, jeeYear: string) => {
    const { data, error } = await (supabase as any)
      .from('ypt_users')
      .insert({ device_id: deviceId, name, jee_focus_year: jeeYear })
      .select()
      .single();
    if (!error && data) setUser(data);
    return { data, error };
  };

  return { user, isLoading, isOnboarded: !!user, createUser, deviceId, refetch: fetchUser };
}
