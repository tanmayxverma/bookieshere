import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  Loader2,
  Mail,
  ShieldCheck,
  Cloud,
} from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.39 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

interface UpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: "community" | "profile" | "cloud" | "general";
}

export function UpgradeModal({
  isOpen,
  onOpenChange,
  feature = "general",
}: UpgradeModalProps) {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleGoogleUpgrade = async () => {
    setBusy(true);
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        toast({
          variant: "destructive",
          title: "Sign-in failed",
          description: String((res.error as any)?.message || res.error),
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Sign-in failed",
        description: e.message || "Failed to launch Google sign-in.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleEmailFlow = () => {
    onOpenChange(false);
    navigate("/welcome");
  };

  const isCommunity = feature === "community";
  const isProfile = feature === "profile";

  const headline = isCommunity
    ? "Sign in to Reply"
    : isProfile
    ? "Upgrade Profile"
    : "Sign in with Google";

  const description = isCommunity
    ? "Sign in with Google to post replies, ask doubts, and share solutions with fellow aspirants."
    : isProfile
    ? "Link Google to customize your profile, sync timers, and back up all study data in the cloud."
    : "Link your Google account to unlock community discussions and multi-device cloud backup.";

  const Icon = isCommunity ? MessageSquare : Sparkles;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-sm:fixed max-sm:bottom-3 max-sm:top-auto max-sm:translate-y-0 max-sm:left-1/2 max-sm:-translate-x-1/2 max-w-[390px] sm:max-w-[420px] w-[94vw] p-5 sm:p-6 rounded-3xl border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]">
        {/* Mobile Grab Pill for bottom sheet feel */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1.5 mb-3 sm:hidden" />

        {/* Compact Popup Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <DialogTitle className="text-base sm:text-lg font-black font-display tracking-tight text-slate-900 dark:text-white">
              {headline}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            1-Click Google
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-brand-blue dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
            <Cloud className="w-3 h-3 text-brand-blue" />
            Cloud Backup
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80">
            ⚡ Zero Data Loss
          </span>
        </div>

        {/* CTAs */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleGoogleUpgrade}
            disabled={busy}
            className="w-full h-11 sm:h-12 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-display font-bold text-sm shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs px-1">
            <button
              type="button"
              onClick={handleEmailFlow}
              className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Use email instead</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              Stay as guest
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
