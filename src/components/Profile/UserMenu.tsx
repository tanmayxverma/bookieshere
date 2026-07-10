import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Settings, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/useProfile";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { profile, loading, isAuthenticated, signOut } = useProfile();
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

  if (!profile) {
    return (
      <Link
        to="/welcome"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-background/60 backdrop-blur-xl text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Sign in
      </Link>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open profile menu"
          className="group inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-border/50 bg-background/60 backdrop-blur-xl hover:border-primary/40 transition-all"
        >
          <span className="h-7 w-7 rounded-full overflow-hidden ring-1 ring-border/60 bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-[11px] font-bold text-foreground/80">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
              : <span>{initials(profile.display_name)}</span>}
          </span>
          {!compact && (
            <span className="text-xs font-semibold text-foreground max-w-[90px] truncate">{profile.display_name}</span>
          )}
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
          <DropdownMenuItem onClick={() => navigate("/welcome")} className="cursor-pointer">
            <Sparkles className="h-4 w-4 mr-2 text-primary" /> Upgrade account
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
          <DropdownMenuItem onClick={() => navigate("/welcome")} className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" /> Switch account
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}