import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateName, canChangeName, type YPTUser, type NameChangeEntry } from '@/types/ypt';
import { safeRandomUUID } from '@/lib/utils';

const DEVICE_ID_KEY = 'ypt_device_id';

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = safeRandomUUID();
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
    let { data } = await (supabase as any)
      .from('ypt_users')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (!data) {
      try {
        const { data: created } = await (supabase as any)
          .from('ypt_users')
          .insert({ device_id: deviceId, name: 'Aspirant', jee_focus_year: 'JEE 2026', name_change_history: [] })
          .select()
          .single();
        if (created) data = created;
      } catch {}
    }

    if (data) {
      data.name_change_history = Array.isArray(data.name_change_history) ? data.name_change_history : [];
    }
    setUser(data);
    setIsLoading(false);
  }, [deviceId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const createUser = async (name: string, jeeYear: string) => {
    const { data, error } = await (supabase as any)
      .from('ypt_users')
      .insert({ device_id: deviceId, name, jee_focus_year: jeeYear, name_change_history: [] })
      .select()
      .single();
    if (!error && data) {
      data.name_change_history = [];
      setUser(data);
    }
    return { data, error };
  };

  const changeName = async (newName: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user found' };
    
    const nameError = validateName(newName);
    if (nameError) return { success: false, error: nameError };

    const history: NameChangeEntry[] = user.name_change_history || [];
    const { allowed, nextAvailableDate } = canChangeName(history);
    
    if (!allowed) {
      return { success: false, error: `Name change limit reached. Try again after ${nextAvailableDate}` };
    }

    const newEntry: NameChangeEntry = {
      oldName: user.name,
      newName: newName.trim(),
      changedAt: new Date().toISOString(),
    };

    const updatedHistory = [...history, newEntry];

    const { error } = await (supabase as any)
      .from('ypt_users')
      .update({ name: newName.trim(), name_change_history: updatedHistory })
      .eq('id', user.id);

    if (error) return { success: false, error: 'Failed to update name' };

    setUser({ ...user, name: newName.trim(), name_change_history: updatedHistory });
    return { success: true };
  };

  const changeJeeYear = async (newYear: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user found' };
    const year = newYear.trim();
    if (!year) return { success: false, error: 'Pick a target year' };
    if (year === user.jee_focus_year) return { success: true };

    const { error } = await (supabase as any)
      .from('ypt_users')
      .update({ jee_focus_year: year })
      .eq('id', user.id);

    if (error) return { success: false, error: 'Failed to update target year' };

    setUser({ ...user, jee_focus_year: year });
    return { success: true };
  };

  return { user, isLoading, isOnboarded: !!user, createUser, changeName, changeJeeYear, deviceId, refetch: fetchUser };
}
