import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  speed?: number; // in seconds
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  speed = 30,
  pauseOnHover = true,
  className,
  ...props
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "overflow-hidden whitespace-nowrap flex select-none group",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center justify-around gap-8 animate-marquee motion-reduce:animate-none",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex min-w-full shrink-0 items-center justify-around gap-8 animate-marquee motion-reduce:animate-none",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
}
