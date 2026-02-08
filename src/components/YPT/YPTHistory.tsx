import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { formatTime, SUBJECTS } from '@/types/ypt';
import { BookOpen } from 'lucide-react';
import { YPTHistorySkeleton } from './YPTSkeletons';

interface Props {
  userId: string;
}

export function YPTHistory({ userId }: Props) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      // Only fetch last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let query = (supabase as any)
        .from('study_sessions')
        .select('*')
        .eq('ypt_user_id', userId)
        .eq('status', 'completed')
        .gte('started_at', sevenDaysAgo.toISOString())
        .order('started_at', { ascending: false });

      if (subjectFilter !== 'all') {
        query = query.eq('subject', subjectFilter);
      }

      const { data } = await query;
      setSessions(data || []);
      setLoading(false);
    };
    fetchHistory();
  }, [userId, subjectFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">Last 7 days only</span>
      </div>

      {loading ? (
        <YPTHistorySkeleton />
      ) : sessions.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No completed sessions in the last 7 days. Start studying to build your history!
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <Card key={s.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{s.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.started_at).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' · '}
                  {new Date(s.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {s.ended_at && ` – ${new Date(s.ended_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
              <p className="font-semibold text-sm tabular-nums shrink-0">
                {formatTime(s.duration_seconds || 0)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
