import * as React from "react";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delayMs?: number;
  direction?: "up" | "down" | "fade";
}

export function Reveal({
  children,
  delayMs = 0,
  direction = "up",
  className,
  ...props
}: RevealProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return "translateY(0)";
    if (direction === "up") return "translateY(16px)";
    if (direction === "down") return "translateY(-16px)";
    return "none";
  };

  return (
    <div
      ref={ref}
      className={cn("transition-all duration-500 ease-out", className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDelay: `${delayMs}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
