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
          "relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5",
          className
        )}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900 whitespace-nowrap">
                Guest Mode Active
              </span>
              <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-2 whitespace-nowrap">
                <span>100% Free</span>
                <span aria-hidden="true">·</span>
                <span>Saved Data Safe</span>
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
            className="w-full sm:w-auto h-9 text-xs font-bold rounded-xl"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
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
