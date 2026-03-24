import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ActiveStudyUser } from '@/types/ypt';

export function useYPTPresence(userId?: string, userName?: string, jeeYear?: string) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState<ActiveStudyUser[]>([]);

  useEffect(() => {
    const presenceKey = userId || 'anon-' + Math.random().toString(36).slice(2);
    
    const presenceChannel = supabase.channel('ypt_online', {
      config: { presence: { key: presenceKey } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .on('presence', { event: 'join' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: userId || presenceKey,
            name: userName || 'Visitor',
            jee_year: jeeYear || '',
            online_at: new Date().toISOString(),
          });
        }
      });

    // Active study sessions (for rooms/other features)
    const fetchActive = async () => {
      const { data } = await (supabase as any)
        .from('study_sessions')
        .select('subject, ypt_users(name, jee_focus_year)')
        .eq('status', 'active');

      if (data) {
        setActiveUsers(
          data.map((s: any) => ({
            name: s.ypt_users?.name || 'Unknown',
            subject: s.subject,
            jee_focus_year: s.ypt_users?.jee_focus_year || '',
          }))
        );
      }
    };

    fetchActive();

    const sessionsChannel = supabase
      .channel('ypt_sessions_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_sessions' },
        () => { fetchActive(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, [userId, userName, jeeYear]);

  return { onlineCount, activeUsers };
}
