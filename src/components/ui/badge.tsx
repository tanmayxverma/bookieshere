import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium font-mono select-none tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 border-primary/20 text-primary",
        secondary: "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300",
        destructive: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400",
        outline: "border-border bg-card text-foreground",
        mint: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
        live: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold",
        sunflower: "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300",
        washi: "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200/80 dark:border-amber-900/60",
        streak: "bg-[#0F172A] dark:bg-slate-800 text-white border-transparent shadow-sm",
        dossier: "border-dashed border-border bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold",
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
