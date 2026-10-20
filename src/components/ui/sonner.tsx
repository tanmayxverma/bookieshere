import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-2 group-[.toaster]:border-[var(--desk-border)] group-[.toaster]:shadow-[4px_4px_0px_var(--desk-border)] group-[.toaster]:rounded-xl font-body",
          description: "group-[.toast]:text-muted-foreground font-body text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:border-2 group-[.toast]:border-[var(--desk-border)] group-[.toast]:shadow-[2px_2px_0px_var(--desk-border)] font-bold",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:border-2 group-[.toast]:border-[var(--desk-border)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
