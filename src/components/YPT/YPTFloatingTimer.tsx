import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTime, TIMER_STORAGE_KEY } from '@/types/ypt';
import { Timer } from 'lucide-react';

export function YPTFloatingTimer() {
  const [visible, setVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const tick = () => {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!raw) {
        setVisible(false);
        return;
      }
      try {
        const state = JSON.parse(raw);
        const now = state.pausedAt || Date.now();
        const secs = Math.max(0, Math.floor((now - state.startedAt - state.totalPausedMs) / 1000));
        setElapsed(secs);
        setSubject(state.subject);
        setVisible(true);
      } catch {
        setVisible(false);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hide on YPT page since full timer is visible there
  if (!visible || location.pathname.startsWith('/ypt')) return null;

  return (
    <button
      onClick={() => navigate('/ypt')}
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
    >
      <Timer className="h-4 w-4" />
      <span className="text-sm font-medium">{subject}</span>
      <span className="text-sm font-mono font-semibold">{formatTime(elapsed)}</span>
    </button>
  );
}
