import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'announcement'|'update'|'material'|'maintenance'|'feature'|'alert';
  priority: 'low'|'normal'|'high'|'critical';
  is_pinned: boolean;
  is_active: boolean;
  publish_at: string;
  expires_at: string | null;
  created_at: string;
}

const LOCAL_STORAGE_READ_KEY = 'bookies_read_notification_ids';

function getLocalReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLocalReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_READ_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    /* ignore */
  }
}

export function useNotifications() {
  const { profile, deviceId, isAuthenticated } = useProfile();
  const [items, setItems] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => getLocalReadIds());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const nowIso = new Date().toISOString();
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_active', true)
      .lte('publish_at', nowIso)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('is_pinned', { ascending: false })
      .order('publish_at', { ascending: false })
      .limit(100);
    const list = (notifs as Notification[]) ?? [];
    const validNotifs = list.filter((n) => {
      if (!n || !n.is_active) return false;
      if (n.expires_at) {
        try {
          if (new Date(n.expires_at).getTime() <= Date.now()) return false;
        } catch {
          // ignore parsing error
        }
      }
      return true;
    });
    setItems(validNotifs);

    const localReads = getLocalReadIds();
    let serverReadIds: string[] = [];

    if (profile) {
      if (isAuthenticated) {
        const { data: reads } = await supabase
          .from('notification_reads')
          .select('notification_id')
          .eq('profile_id', profile.id);
        serverReadIds = (reads ?? []).map((r: any) => r.notification_id);
      } else {
        const { data: reads } = await (supabase as any).rpc('guest_list_notification_reads', { _device_id: deviceId });
        serverReadIds = (reads ?? []).map((r: any) => r.notification_id);
      }
    }

    const merged = new Set([...localReads, ...serverReadIds]);
    setReadIds(merged);
    saveLocalReadIds(merged);
    setLoading(false);
  }, [profile, isAuthenticated, deviceId]);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    const chName = `notifications-feed-${Math.random().toString(36).substring(2, 9)}`;
    const ch = supabase.channel(chName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_reads' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const unreadCount = useMemo(() => items.filter(n => !readIds.has(n.id)).length, [items, readIds]);

  const markRead = useCallback(async (id: string) => {
    setReadIds(prev => {
      const s = new Set(prev);
      s.add(id);
      saveLocalReadIds(s);
      return s;
    });

    try {
      if (isAuthenticated && profile) {
        await supabase
          .from('notification_reads')
          .upsert({ notification_id: id, profile_id: profile.id }, { onConflict: 'notification_id,profile_id' });
      } else if (deviceId) {
        await (supabase as any).rpc('guest_mark_notification_read', { _device_id: deviceId, _notification_id: id });
      }
    } catch (e) {
      console.warn('Sync notification read failed:', e);
    }
  }, [profile, isAuthenticated, deviceId]);

  const markAllRead = useCallback(async () => {
    const allIds = items.map(n => n.id);
    setReadIds(prev => {
      const s = new Set([...prev, ...allIds]);
      saveLocalReadIds(s);
      return s;
    });

    const unread = items.filter(n => !readIds.has(n.id));
    await Promise.all(unread.map(n => markRead(n.id)));
  }, [items, readIds, markRead]);

  return { items, readIds, unreadCount, loading, markRead, markAllRead, refetch: load };
}
