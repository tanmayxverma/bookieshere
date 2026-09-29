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

    // Check profiles table for display_name or target_category to avoid overwriting real names
    let profName: string | null = null;
    let profYear: string | null = null;
    try {
      const { data: prof } = await (supabase as any)
        .from('profiles')
        .select('display_name, target_category')
        .eq('device_id', deviceId)
        .maybeSingle();
      if (prof?.display_name && prof.display_name.trim().toLowerCase() !== 'aspirant') {
        profName = prof.display_name.trim();
      }
      if (prof?.target_category) {
        profYear = prof.target_category.trim();
      }
    } catch {}

    if (!data) {
      try {
        const initialName = profName || 'Aspirant';
        const initialYear = profYear || 'JEE 2027';
        const { data: created } = await (supabase as any)
          .from('ypt_users')
          .insert({ device_id: deviceId, name: initialName, jee_focus_year: initialYear, name_change_history: [] })
          .select()
          .single();
        if (created) data = created;
      } catch {}
    } else if (profName && (!data.name || data.name.trim().toLowerCase() === 'aspirant')) {
      // Recover real name from profiles if ypt_users had placeholder
      try {
        const updatedYear = profYear || data.jee_focus_year || 'JEE 2027';
        await (supabase as any)
          .from('ypt_users')
          .update({ name: profName, jee_focus_year: updatedYear })
          .eq('id', data.id);
        data.name = profName;
        data.jee_focus_year = updatedYear;
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
    const trimmed = name.trim();
    const cleanYear = jeeYear.trim() || 'JEE 2027';
    const { data, error } = await (supabase as any)
      .from('ypt_users')
      .insert({ device_id: deviceId, name: trimmed, jee_focus_year: cleanYear, name_change_history: [] })
      .select()
      .single();
    if (!error && data) {
      data.name_change_history = [];
      setUser(data);
      // Sync to profiles
      try {
        await (supabase as any).rpc('upsert_guest_profile', {
          _device_id: deviceId,
          _display_name: trimmed,
          _target_category: cleanYear,
          _avatar_url: null,
        });
      } catch {}
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

    const trimmed = newName.trim();
    const newEntry: NameChangeEntry = {
      oldName: user.name,
      newName: trimmed,
      changedAt: new Date().toISOString(),
    };

    const updatedHistory = [...history, newEntry];

    const { error } = await (supabase as any)
      .from('ypt_users')
      .update({ name: trimmed, name_change_history: updatedHistory })
      .eq('id', user.id);

    if (error) return { success: false, error: 'Failed to update name' };

    // Sync to profiles table as well
    try {
      await (supabase as any).rpc('upsert_guest_profile', {
        _device_id: deviceId,
        _display_name: trimmed,
        _target_category: user.jee_focus_year || 'JEE 2027',
        _avatar_url: null,
      });
    } catch {}

    setUser({ ...user, name: trimmed, name_change_history: updatedHistory });
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

    // Sync to profiles table
    try {
      await (supabase as any).rpc('upsert_guest_profile', {
        _device_id: deviceId,
        _display_name: user.name || 'Aspirant',
        _target_category: year,
        _avatar_url: null,
      });
    } catch {}

    setUser({ ...user, jee_focus_year: year });
    return { success: true };
  };

  return { user, isLoading, isOnboarded: !!user && user.name !== 'Aspirant', createUser, changeName, changeJeeYear, deviceId, refetch: fetchUser };
}
