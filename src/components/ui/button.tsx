import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold font-body ring-offset-background transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-2 border-[var(--desk-border)] shadow-[3px_3px_0px_var(--desk-border)] hover:brightness-105",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-[var(--desk-border)] shadow-[3px_3px_0px_var(--desk-border)] hover:brightness-105",
        outline:
          "border-2 border-[var(--desk-border)] bg-card text-foreground shadow-[3px_3px_0px_var(--desk-border)] hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-[var(--desk-border)] shadow-[3px_3px_0px_var(--desk-border)] hover:bg-secondary/80",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground active:translate-x-0 active:translate-y-0 active:shadow-none",
        link:
          "text-primary underline-offset-4 hover:underline active:translate-x-0 active:translate-y-0 active:shadow-none",
        tactile:
          "bg-[var(--sunflower)] text-[#0F172A] border-2 border-[var(--desk-border)] shadow-[3px_3px_0px_var(--desk-border)] font-bold hover:brightness-105",
        volt:
          "bg-[var(--mint-dark)] text-white border-2 border-[var(--desk-border)] shadow-[3px_3px_0px_var(--desk-border)] font-bold hover:brightness-105",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3.5 text-xs shadow-[2px_2px_0px_var(--desk-border)]",
        lg: "h-12 rounded-xl px-8 text-base shadow-[4px_4px_0px_var(--desk-border)]",
        icon: "h-11 w-11 shadow-[2px_2px_0px_var(--desk-border)]",
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
