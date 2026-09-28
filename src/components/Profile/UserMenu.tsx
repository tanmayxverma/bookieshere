import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Settings, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useUserStreak";
import { UpgradeModal } from "@/components/Auth/UpgradeModal";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { profile, loading, isAuthenticated, signOut } = useProfile();
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

  const displayName = profile?.display_name || "Tanmay";
  const avatarInitial = initials(displayName);

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome");
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
            🔥 {streak}d
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <span className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-border/60 bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-xs font-bold text-foreground/80">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
              : <span>{initials(profile.display_name)}</span>}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold truncate">{profile.display_name}</span>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              {profile.account_type === "guest" ? "Guest" : profile.account_type === "google" ? "Google" : "Email"} · {profile.target_category}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
          <User className="h-4 w-4 mr-2" /> Profile
        </DropdownMenuItem>
        {!isAuthenticated && (
          <DropdownMenuItem
            onClick={() => setUpgradeOpen(true)}
            className="cursor-pointer bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-primary/15 text-primary font-bold focus:bg-primary/20"
          >
            <Sparkles className="h-4 w-4 mr-2 text-amber-500 animate-pulse" />
            <span>Upgrade to Google</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <div
          className="flex items-center justify-between gap-3 px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-accent"
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
        <DropdownMenuSeparator />
        {isAuthenticated ? (
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => setUpgradeOpen(true)} className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" /> Switch account
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
      <UpgradeModal
        isOpen={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        feature="general"
      />
    </DropdownMenu>
  );
}