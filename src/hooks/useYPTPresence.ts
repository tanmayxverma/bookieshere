import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ActiveStudyUser } from '@/types/ypt';

export function useYPTPresence() {
  const [activeUsers, setActiveUsers] = useState<ActiveStudyUser[]>([]);

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

  useEffect(() => {
    fetchActive();

    const channel = supabase
      .channel('ypt_sessions_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_sessions' },
        () => { fetchActive(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { activeUsers };
}
