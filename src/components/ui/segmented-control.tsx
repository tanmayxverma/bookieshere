import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center rounded-xl border-2 border-[var(--desk-border)] bg-muted/40 p-1 shadow-[2px_2px_0px_var(--desk-border)] select-none",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              size === "sm" && "px-2.5 py-1 text-[11px]",
              size === "md" && "px-3.5 py-1.5 text-xs",
              size === "lg" && "px-4 py-2 text-sm",
              isSelected
                ? "bg-primary text-primary-foreground border-2 border-[var(--desk-border)] shadow-[1.5px_1.5px_0px_var(--desk-border)]"
                : "text-muted-foreground hover:text-foreground border-2 border-transparent"
            )}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
