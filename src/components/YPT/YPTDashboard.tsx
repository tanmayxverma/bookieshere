import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatHours, getISTDate, getISTDateString, getISTTodayStartUTC } from '@/types/ypt';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Flame, TrendingUp, Calendar } from 'lucide-react';
import { YPTContentSkeleton } from './YPTSkeletons';

interface Props {
  userId: string;
  liveElapsed?: number;
}

export function YPTDashboard({ userId, liveElapsed = 0 }: Props) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data } = await (supabase as any)
        .from('study_sessions')
        .select('*')
        .eq('ypt_user_id', userId)
        .in('status', ['completed', 'active'])
        .gte('started_at', thirtyDaysAgo.toISOString())
        .order('started_at', { ascending: false });
      setSessions(data || []);
      setLoading(false);
    };
    fetchSessions();
  }, [userId]);

  if (loading) {
    return <YPTContentSkeleton />;
  }

  // Use IST date strings for grouping
  const istToday = getISTDate().toDateString();
  
  // Group seconds by IST date
  const dayMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const dateStr = getISTDateString(s.started_at);
    dayMap[dateStr] = (dayMap[dateStr] || 0) + (s.duration_seconds || 0);
  });

  // Today in IST
  const istTodayStr = getISTDate().toISOString().split('T')[0];
  const todaySeconds = (dayMap[istTodayStr] || 0) + liveElapsed;

  // Week total (last 7 IST days)
  let weekSeconds = 0;
  for (let i = 0; i < 7; i++) {
    const d = getISTDate();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    weekSeconds += dayMap[key] || 0;
  }
  weekSeconds += liveElapsed;

  // Daily chart data (last 7 IST days)
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = getISTDate();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    let secs = dayMap[key] || 0;
    if (i === 0) secs += liveElapsed; // Add live time to today
    dailyData.push({
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      hours: +(secs / 3600).toFixed(1),
    });
  }

  // Streak (minimum 15 min / day)
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = getISTDate();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    let daySecs = dayMap[key] || 0;
    if (i === 0) daySecs += liveElapsed;
    if (daySecs >= 900) streak++;
    else break;
  }

  // Best day
  const allDayValues = Object.entries(dayMap).map(([k, v]) => {
    if (k === istTodayStr) return v + liveElapsed;
    return v;
  });
  const bestDaySeconds = Math.max(0, ...allDayValues);

  // Calendar heatmap — current month's actual days
  const istNow = getISTDate();
  const currentMonth = istNow.getMonth();
  const currentYear = istNow.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayDay = istNow.getDate(); // 1-indexed

  const calendarData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(currentYear, currentMonth, day);
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let secs = dayMap[key] || 0;
    if (day === todayDay) secs += liveElapsed;
    calendarData.push({ date: d, day, seconds: secs, isFuture: day > todayDay, isToday: day === todayDay });
  }

  const monthName = istNow.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="h-5 w-5" />} label="Today" value={formatHours(todaySeconds)} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="This Week" value={formatHours(weekSeconds)} />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} />
        <StatCard icon={<Calendar className="h-5 w-5" />} label="Best Day" value={formatHours(bestDaySeconds)} />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyData}>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" unit="h" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">{monthName}</h3>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1.5 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] text-muted-foreground text-center font-medium">{d}</span>
          ))}
        </div>
        {/* Calendar grid — offset first day */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells for offset */}
          {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {calendarData.map((d) => {
            const intensity = d.isFuture ? -1
              : d.seconds === 0 ? 0
              : d.seconds < 1800 ? 1
              : d.seconds < 3600 ? 2
              : d.seconds < 7200 ? 3
              : 4;
            const bgClass = intensity === -1
              ? 'bg-muted/30'
              : intensity === 0 ? 'bg-muted'
              : intensity === 1 ? 'bg-primary/20'
              : intensity === 2 ? 'bg-primary/40'
              : intensity === 3 ? 'bg-primary/60'
              : 'bg-primary/80';
            return (
              <div
                key={d.day}
                className={`aspect-square rounded-md flex flex-col items-center justify-center relative transition-colors ${bgClass} ${d.isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                title={d.isFuture ? '' : `${d.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${formatHours(d.seconds)}`}
              >
                <span className={`text-[10px] leading-none font-medium ${d.isFuture ? 'text-muted-foreground/40' : intensity >= 2 ? 'text-primary-foreground' : 'text-foreground/70'}`}>
                  {d.day}
                </span>
                {!d.isFuture && d.seconds > 0 && (
                  <span className={`text-[8px] leading-none mt-0.5 ${intensity >= 2 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {(d.seconds / 3600).toFixed(1)}h
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </Card>
  );
}
