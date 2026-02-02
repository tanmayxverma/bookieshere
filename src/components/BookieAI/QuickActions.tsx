import { HelpCircle, BookOpen, GraduationCap } from "lucide-react";
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
    message: "I have a doubt about a concept. Can you help me understand it?",
  },
  {
    icon: BookOpen,
    label: "Find Material",
    message: "I'm looking for study materials. What books and resources are available on BOOKIE?",
  },
  {
    icon: GraduationCap,
    label: "Exam Help",
    message: "I need help with JEE preparation strategy and tips.",
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
