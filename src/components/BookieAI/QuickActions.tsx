import { HelpCircle, BookOpen, CalendarClock, BarChart3 } from "lucide-react";
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
    message: "I have a doubt — I'll paste the question. Explain the core idea simply, then solve it.",
  },
  {
    icon: BookOpen,
    label: "Pick a Book",
    message: "Which book should I use for organic chemistry if my basics are weak? Pick from what's on Bookie and tell me why.",
  },
  {
    icon: CalendarClock,
    label: "Plan My Day",
    message: "Plan my study day today — I have about 6 hours. Ask me anything you need first.",
  },
  {
    icon: BarChart3,
    label: "Mock Analysis",
    message: "I just gave a mock test. Help me analyse it — ask me my score and where I lost marks.",
  },
];

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="px-4 py-3 border-t border-border/30">
      <p className="text-xs text-muted-foreground mb-2.5">Quick actions</p>
      <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hidden">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => onAction(action.message)}
            disabled={disabled}
            className={cn(
              "flex-shrink-0 gap-1.5 text-xs font-medium h-9",
              "bg-surface-2 hover:bg-primary/5",
              "border-border/40 hover:border-primary/30",
              "text-muted-foreground hover:text-primary",
              "transition-all duration-200",
              "rounded-lg"
            )}
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
