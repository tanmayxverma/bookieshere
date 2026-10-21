import { HelpCircle, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const actions = [
  {
    icon: HelpCircle,
    label: "Ask a Doubt",
    desc: "Physics / Chem / Math",
    message: "I have a doubt about a concept. Can you help me understand it step-by-step?",
  },
  {
    icon: BookOpen,
    label: "Find Material",
    desc: "PYQs & Kota Notes",
    message: "I'm looking for study materials and notes. What resources are available on BOOKIE?",
  },
  {
    icon: GraduationCap,
    label: "Exam Strategy",
    desc: "Schedules & Mocks",
    message: "I need help with JEE preparation strategy and mock test revision plan.",
  },
  {
    icon: Sparkles,
    label: "Quick Revision",
    desc: "Formula Flashcards",
    message: "Can you quiz me or help me revise the most important formulas for JEE?",
  },
];

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="px-4 py-3 border-t border-border/30 bg-surface-1/60">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Recommended Topics
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction(action.message)}
            disabled={disabled}
            className={cn(
              "p-2.5 bg-surface-2 hover:bg-primary/5 active:bg-primary/10",
              "border border-border/40 hover:border-primary/30",
              "rounded-xl text-left transition-all duration-150",
              "flex items-center gap-2 group shadow-2xs",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <action.icon className="h-3.5 w-3.5" />
            </span>
            <div className="truncate min-w-0">
              <div className="font-heading font-bold text-xs text-foreground group-hover:text-primary leading-tight truncate">
                {action.label}
              </div>
              <span className="text-[10px] text-muted-foreground font-body truncate block mt-0.5">
                {action.desc}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
