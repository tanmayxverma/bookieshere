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
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.message)}
          disabled={disabled}
          className={cn(
            "gap-1.5 text-xs font-medium",
            "bg-background/60 hover:bg-purple-500/10",
            "border-border/50 hover:border-purple-500/40",
            "text-muted-foreground hover:text-purple-400",
            "transition-all duration-200",
            "hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]",
            "rounded-xl"
          )}
        >
          <action.icon className="h-3.5 w-3.5" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
