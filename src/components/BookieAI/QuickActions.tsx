import { HelpCircle, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    label: "Find Study Material",
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
    <div className="flex flex-wrap gap-2 p-3 border-t border-border/50">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.message)}
          disabled={disabled}
          className="gap-1.5 text-xs bg-background/50 hover:bg-accent/50 border-border/50 hover:border-pink-500/30 transition-all duration-200 hover:shadow-[0_0_10px_rgba(236,72,153,0.1)]"
        >
          <action.icon className="h-3.5 w-3.5 text-pink-400" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
