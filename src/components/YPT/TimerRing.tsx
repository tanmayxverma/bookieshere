import { formatTime } from '@/types/ypt';

interface Props {
  /** 0 → 1 fill of the ring */
  progress: number;
  seconds: number;
  label?: string;
  sublabel?: string;
  paused?: boolean;
  size?: number;
}

/**
 * Circular clock face — animated SVG progress ring with the time centered.
 * Uses only semantic tokens so it themes with light/dark automatically.
 */
export function TimerRing({ progress, seconds, label, sublabel, paused, size = 260 }: Props) {
  const stroke = Math.max(8, Math.round(size * 0.038));
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = c * (1 - clamped);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="timerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--foreground))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#timerRingGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          opacity={paused ? 0.45 : 1}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {label && (
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">{label}</span>
        )}
        <span
          className="font-mono font-bold tabular-nums tracking-tight select-none"
          style={{ fontSize: size * 0.17 }}
        >
          {formatTime(seconds)}
        </span>
        {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}
