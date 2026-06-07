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

export function useNotifications() {
  const { profile, deviceId, isAuthenticated } = useProfile();
  const [items, setItems] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
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
    setItems((notifs as Notification[]) ?? []);

    if (profile) {
      if (isAuthenticated) {
        const { data: reads } = await supabase
          .from('notification_reads')
          .select('notification_id')
          .eq('profile_id', profile.id);
        setReadIds(new Set((reads ?? []).map((r: any) => r.notification_id)));
      } else {
        const { data: reads } = await (supabase as any).rpc('guest_list_notification_reads', { _device_id: deviceId });
        setReadIds(new Set((reads ?? []).map((r: any) => r.notification_id)));
      }
    } else {
      setReadIds(new Set());
    }
    setLoading(false);
  }, [profile, isAuthenticated, deviceId]);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    const ch = supabase.channel('notifications-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_reads' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const unreadCount = useMemo(() => items.filter(n => !readIds.has(n.id)).length, [items, readIds]);

  const markRead = useCallback(async (id: string) => {
    if (!profile) return;
    setReadIds(prev => { const s = new Set(prev); s.add(id); return s; });
    if (isAuthenticated) {
      await supabase.from('notification_reads').upsert({ notification_id: id, profile_id: profile.id }, { onConflict: 'notification_id,profile_id' });
    } else {
      await (supabase as any).rpc('guest_mark_notification_read', { _device_id: deviceId, _notification_id: id });
    }
  }, [profile, isAuthenticated, deviceId]);

  const markAllRead = useCallback(async () => {
    const unread = items.filter(n => !readIds.has(n.id));
    await Promise.all(unread.map(n => markRead(n.id)));
  }, [items, readIds, markRead]);

  return { items, readIds, unreadCount, loading, markRead, markAllRead, refetch: load };
}
