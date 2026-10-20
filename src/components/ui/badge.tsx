import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border-2 border-[var(--desk-border)] px-2.5 py-0.5 text-xs font-bold font-mono shadow-[2px_2px_0px_var(--desk-border)] transition-transform select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "bg-card text-foreground",
        mint: "bg-[var(--mint-light)] text-[var(--mint-dark)]",
        sunflower: "bg-[var(--sunflower)] text-[#0F172A]",
        washi: "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-dashed rounded -rotate-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
