import { formatTime } from '@/types/ypt';

interface Props {
  seconds: number;
  paused?: boolean;
  size?: number;
  label?: string;
  sublabel?: string;
}

/**
 * Open-ended stopwatch display.
 *
 * Deliberately NOT a fill-based progress ring: a stopwatch has no total to
 * divide by, so a fill would visibly "complete" and snap back to empty.
 * Instead a short sweep arc rotates continuously around the dial, like a
 * clock's second hand — it never reads as progress toward a goal.
 */
export function StopwatchDial({ seconds, paused, size = 260, label = 'Stopwatch', sublabel }: Props) {
  const stroke = Math.max(8, Math.round(size * 0.038));
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  // 12% of the circumference — a comet-like sweep segment.
  const arc = c * 0.12;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="stopwatchSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>

        {/* Static track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.16)"
          strokeWidth={stroke}
        />

        {/* Rotating sweep — one full revolution per minute */}
        <g
          style={{
            transformOrigin: '50% 50%',
            animation: 'stopwatch-sweep 60s linear infinite',
            animationPlayState: paused ? 'paused' : 'running',
            opacity: paused ? 0.4 : 1,
            transition: 'opacity 300ms ease',
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#stopwatchSweepGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${c - arc}`}
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
          {label}
        </span>
        <span
          className={`font-mono font-bold tabular-nums tracking-tight select-none ${paused ? '' : 'stopwatch-breathe'}`}
          style={{ fontSize: size * 0.17 }}
        >
          {formatTime(seconds)}
        </span>
        <span className="text-xs text-muted-foreground">
          {sublabel ?? (paused ? 'Paused' : 'Counting up')}
        </span>
      </div>
    </div>
  );
}
