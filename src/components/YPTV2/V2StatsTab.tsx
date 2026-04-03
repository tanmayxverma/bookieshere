import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatHours, getISTDate, getISTDateString } from '@/types/ypt';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Flame, TrendingUp, Calendar, BarChart3, Brain } from 'lucide-react';
import { YPTContentSkeleton } from '@/components/YPT/YPTSkeletons';

interface Props {
  userId: string;
  liveElapsed?: number;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Physics': 'hsl(210, 80%, 55%)',
  'Chemistry': 'hsl(160, 65%, 45%)',
  'Mathematics': 'hsl(35, 90%, 55%)',
  'Self Study': 'hsl(190, 70%, 50%)',
};

export function V2StatsTab({ userId, liveElapsed = 0 }: Props) {
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

  if (loading) return <YPTContentSkeleton />;

  const istTodayStr = getISTDate().toISOString().split('T')[0];

  const dayMap: Record<string, number> = {};
  const subjectMap: Record<string, number> = {};
  const hourMap: Record<number, number> = {};

  sessions.forEach((s) => {
    const dateStr = getISTDateString(s.started_at);
    dayMap[dateStr] = (dayMap[dateStr] || 0) + (s.duration_seconds || 0);
    const subject = s.subject || 'Other';
    subjectMap[subject] = (subjectMap[subject] || 0) + (s.duration_seconds || 0);
    const ist = getISTDate(new Date(s.started_at));
    const hour = ist.getHours();
    hourMap[hour] = (hourMap[hour] || 0) + (s.duration_seconds || 0);
  });

  const todaySeconds = (dayMap[istTodayStr] || 0) + liveElapsed;

  let weekSeconds = 0;
  for (let i = 0; i < 7; i++) {
    const d = getISTDate();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    weekSeconds += dayMap[key] || 0;
  }
  weekSeconds += liveElapsed;

  let monthSeconds = Object.values(dayMap).reduce((a, b) => a + b, 0) + liveElapsed;

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

  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = getISTDate();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    let secs = dayMap[key] || 0;
    if (i === 0) secs += liveElapsed;
    dailyData.push({
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      hours: +(secs / 3600).toFixed(1),
    });
  }

  const subjectData = Object.entries(subjectMap).map(([name, secs]) => ({
    name,
    hours: +(secs / 3600).toFixed(1),
    color: SUBJECT_COLORS[name] || 'hsl(var(--muted))',
  }));

  const dayEntries = Object.entries(dayMap).map(([k, v]) => ({
    date: k,
    seconds: k === istTodayStr ? v + liveElapsed : v,
  }));
  const bestDay = dayEntries.sort((a, b) => b.seconds - a.seconds)[0];
  const bestDayName = bestDay
    ? new Date(bestDay.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'long' })
    : 'N/A';

  const peakHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];
  const peakHourStr = peakHour ? `${parseInt(peakHour[0])}:00 – ${parseInt(peakHour[0]) + 1}:00` : 'N/A';

  const activeDays = Object.keys(dayMap).length || 1;
  const avgDaily = monthSeconds / activeDays;

  const heatmapData = [];
  for (let h = 0; h < 24; h++) {
    heatmapData.push({ hour: h, seconds: hourMap[h] || 0 });
  }
  const maxHourSecs = Math.max(...heatmapData.map(d => d.seconds), 1);

  const istNow = getISTDate();
  const currentMonth = istNow.getMonth();
  const currentYear = istNow.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayDay = istNow.getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const calendarData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let secs = dayMap[key] || 0;
    if (day === todayDay) secs += liveElapsed;
    calendarData.push({ day, seconds: secs, isFuture: day > todayDay, isToday: day === todayDay });
  }
  const monthName = istNow.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pop-in">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={<Clock className="h-5 w-5" />} label="Today" value={formatHours(todaySeconds)} />
        <MiniStat icon={<TrendingUp className="h-5 w-5" />} label="This Week" value={formatHours(weekSeconds)} />
        <MiniStat icon={<Flame className="h-5 w-5" />} label="Streak" value={`${streak} 🔥`} />
        <MiniStat icon={<Calendar className="h-5 w-5" />} label="This Month" value={formatHours(monthSeconds)} />
      </div>

      {/* Weekly Study Graph */}
      <Card className="p-5 border-border/50">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Weekly Overview
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyData}>
            <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 600 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" unit="h" axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InsightCard icon={<Flame className="h-5 w-5 text-primary" />} title="Best Day" value={bestDay ? `${bestDayName} (${formatHours(bestDay.seconds)})` : 'N/A'} />
        <InsightCard icon={<Brain className="h-5 w-5 text-primary" />} title="Peak Hour" value={peakHourStr} />
        <InsightCard icon={<TrendingUp className="h-5 w-5 text-primary" />} title="Avg Daily" value={formatHours(avgDaily)} />
      </div>

      {/* Subject Distribution */}
      {subjectData.length > 0 && (
        <Card className="p-5 border-border/50">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Subject Distribution</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={subjectData}
                  dataKey="hours"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={3}
                  stroke="hsl(var(--card))"
                >
                  {subjectData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(val: number) => [`${val}h`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4">
              {subjectData.map((s) => (
                <div key={s.name} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/30">
                  <div
                    className="w-4 h-4 rounded-md shrink-0 ring-1 ring-border/20"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm text-foreground font-medium">{s.name}</span>
                  <span className="text-sm font-bold text-foreground">{s.hours}h</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Peak Hours Heatmap */}
      <Card className="p-5 border-border/50">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Peak Study Hours</h3>
        <div className="grid grid-cols-12 gap-1.5">
          {heatmapData.map((d) => {
            const intensity = d.seconds / maxHourSecs;
            const opacity = d.seconds === 0 ? 0.08 : 0.15 + intensity * 0.7;
            return (
              <div
                key={d.hour}
                className="aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-colors"
                style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
                title={`${d.hour}:00 – ${formatHours(d.seconds)}`}
              >
                <span className={`${d.seconds > 0 ? 'text-foreground/80' : 'text-muted-foreground/50'}`}>
                  {d.hour}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Hours 0–23 IST · Darker = more study time</p>
      </Card>

      {/* Monthly Calendar */}
      <Card className="p-5 border-border/50">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{monthName}</h3>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d} className="text-xs text-muted-foreground text-center font-bold uppercase">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}
          {calendarData.map((d) => {
            const intensity = d.isFuture ? -1
              : d.seconds === 0 ? 0
              : d.seconds < 1800 ? 1
              : d.seconds < 3600 ? 2
              : d.seconds < 7200 ? 3
              : 4;
            const bgClass = intensity === -1
              ? 'bg-muted/20'
              : intensity === 0 ? 'bg-muted/40'
              : intensity === 1 ? 'bg-primary/20'
              : intensity === 2 ? 'bg-primary/40'
              : intensity === 3 ? 'bg-primary/60'
              : 'bg-primary/80';
            return (
              <div
                key={d.day}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-colors ${bgClass} ${d.isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                title={d.isFuture ? '' : `Day ${d.day}: ${formatHours(d.seconds)}`}
              >
                <span className={`text-xs leading-none font-bold ${d.isFuture ? 'text-muted-foreground/30' : intensity >= 2 ? 'text-primary-foreground' : 'text-foreground/70'}`}>
                  {d.day}
                </span>
                {!d.isFuture && d.seconds > 0 && (
                  <span className={`text-[9px] leading-none mt-0.5 font-medium ${intensity >= 2 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
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

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4 card-glow liquid-glass-subtle">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </Card>
  );
}

function InsightCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <Card className="p-5 border-border/50 card-glow">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-bold text-muted-foreground">{title}</span>
      </div>
      <p className="text-base font-bold">{value}</p>
    </Card>
  );
}
