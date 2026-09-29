import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "./UpgradeModal";
import { cn } from "@/lib/utils";

interface GuestUpgradeBannerProps {
  className?: string;
  feature?: "community" | "profile" | "cloud" | "general";
  compact?: boolean;
}

export function GuestUpgradeBanner({
  className,
  feature = "general",
  compact = false,
}: GuestUpgradeBannerProps) {
  const { profile, isAuthenticated } = useProfile();
  const [modalOpen, setModalOpen] = useState(false);

  // If already authenticated with Google or Email, do not render guest banner
  if (isAuthenticated && profile?.account_type !== "guest") {
    return null;
  }

  const message =
    feature === "community"
      ? "Guest accounts can browse & react. Connect Google or Email to post doubts & solutions."
      : "Guest data lives in this browser. Link Google or Email for multi-device cloud backup & community posting.";

  if (compact) {
    return (
      <>
        <div
          onClick={() => setModalOpen(true)}
          className={cn(
            "cursor-pointer flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-primary/10 border border-blue-500/30 hover:border-blue-500/60 transition-all text-xs group",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {message}
            </span>
          </div>
          <span className="font-bold text-primary shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-mono text-[11px]">
            <span>Link Account</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
        <UpgradeModal
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
          feature={feature}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-slate-900 dark:border-slate-700 bg-surface-container-lowest p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5",
          className
        )}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 border border-slate-900 shadow-sm font-bold text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                Guest Mode Active
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                · 100% Free · Saved Data Safe
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mt-1">
              Optionally link Google or Email to unlock discussions, replies, and cloud sync across all devices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto h-9 text-xs font-bold rounded-xl border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
            <span>Link Account</span>
          </Button>
        </div>
      </div>

      <UpgradeModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        feature={feature}
      />
    </>
  );
}
