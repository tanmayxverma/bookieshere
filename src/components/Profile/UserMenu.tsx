import { Link, useNavigate } from "react-router-dom";
import { LogOut, Sparkles, Zap, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useUserStreak";
import { UpgradeModal } from "@/components/Auth/UpgradeModal";

function initials(name?: string | null): string {
  if (!name || typeof name !== "string") return "A";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { profile, loading, isAuthenticated, signOut, user, googleAvatar } = useProfile();
  const { streak } = useUserStreak();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [lite, setLite] = useState<boolean>(() => {
    try { return localStorage.getItem("bookie_lite_mode") === "true"; } catch { return false; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (lite) root.classList.add("lite-mode");
    else root.classList.remove("lite-mode");
    try { localStorage.setItem("bookie_lite_mode", lite ? "true" : "false"); } catch { /* ignore */ }
  }, [lite]);

  if (loading) return null;

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split("@")[0] : null) || (isAuthenticated ? "Aspirant" : "Guest");
  const avatarInitial = initials(displayName);
  const avatarUrl = profile?.avatar_url || googleAvatar || null;

  const accountTypeLabel = profile?.account_type === "guest" || !isAuthenticated
    ? "Guest"
    : profile?.account_type === "google"
    ? "Google"
    : profile?.account_type === "email"
    ? "Email"
    : "Account";

  const targetCategoryLabel = profile?.target_category || "JEE 2027";
  const streakCount = typeof streak === "number" && !isNaN(streak) ? streak : 0;
  const subtitle = `${accountTypeLabel} · ${targetCategoryLabel} · ${streakCount}d streak`;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    navigate("/welcome", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open profile menu"
          className="group relative flex flex-col items-center justify-center hover:opacity-95 transition-all focus:outline-none cursor-pointer pt-0.5 px-0.5"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900 overflow-hidden shrink-0 group-hover:ring-primary transition-all shadow-xs">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span>{avatarInitial}</span>
            )}
          </div>
          <span className="text-[9px] font-mono font-extrabold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/90 px-1 py-0 rounded-full border border-amber-300/80 dark:border-amber-700 leading-tight -mt-1.5 shadow-xs z-10 whitespace-nowrap select-none">
            🔥 {streakCount}d
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-lg border-2 border-slate-900/10 dark:border-slate-800">
        {/* Clickable Profile & Stats Header Button */}
        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 focus:bg-slate-100 dark:focus:bg-slate-800/80 group"
        >
          <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-primary/40 group-hover:ring-primary bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-xs font-bold text-foreground/80 shrink-0 transition-all shadow-xs">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : (
              <span>{avatarInitial}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="block text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                {displayName}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-mono truncate mt-0.5">
              {subtitle}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5" />

        {!isAuthenticated && (
          <>
            <DropdownMenuItem
              onClick={() => setUpgradeOpen(true)}
              className="cursor-pointer font-semibold text-primary focus:text-primary focus:bg-primary/10 rounded-lg py-2"
            >
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              <span>Upgrade account</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />
          </>
        )}

        <div
          className="flex items-center justify-between gap-3 px-2 py-2 text-sm cursor-pointer rounded-lg hover:bg-accent"
          onClick={(e) => { e.preventDefault(); setLite(v => !v); }}
        >
          <span className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${lite ? "text-primary" : "text-muted-foreground"}`} />
            <span className="flex flex-col">
              <span className="font-medium leading-tight">Lite mode</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Faster on slow devices</span>
            </span>
          </span>
          <Switch checked={lite} onCheckedChange={setLite} onClick={(e) => e.stopPropagation()} />
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg py-2 font-medium"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>{isAuthenticated ? "Sign out" : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <UpgradeModal
        isOpen={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        feature="general"
      />
    </DropdownMenu>
  );
}