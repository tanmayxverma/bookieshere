import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium font-sans ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-border bg-card text-foreground shadow-sm hover:bg-muted hover:text-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 active:scale-[0.98]",
        ghost:
          "text-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]",
        link:
          "text-primary underline-offset-4 hover:underline active:scale-100",
        crimson:
          "bg-[#904A43] dark:bg-[#EF4444] text-white shadow-sm hover:brightness-105 active:scale-[0.98]",
        tactile:
          "bg-[#B91C1C] text-white shadow-sm hover:bg-[#991B1B] active:scale-[0.98] font-semibold",
        amber:
          "border border-[#F59E0B] text-[#B45309] dark:text-[#FBBF24] bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98]",
        pill:
          "rounded-full border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-muted shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-10 w-10 rounded-xl",
        pill: "h-9 rounded-full px-4 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
