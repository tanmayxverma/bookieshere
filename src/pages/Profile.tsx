import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Mail, Sparkles, Save, LogOut, Loader2, Target, BookOpen, Trophy, BarChart3 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useProfile, TARGET_CATEGORIES, type TargetCategory } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useUserStreak";
import { AvatarUploader } from "@/components/Profile/AvatarUploader";
import { validateName } from "@/types/ypt";
import { UpgradeModal } from "@/components/Auth/UpgradeModal";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, isAuthenticated, isOnboarded, saveProfile, updateAvatar, signOut, deviceId, user } = useProfile();
  const { streak, longestStreak } = useUserStreak();

  const [name, setName] = useState("");
  const [target, setTarget] = useState<TargetCategory>("JEE 2027");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !profile) navigate("/welcome", { replace: true });
    if (!loading && profile && !isOnboarded) navigate("/onboarding", { replace: true });
    if (profile) {
      setName(profile.display_name);
      setTarget((profile.target_category as TargetCategory) || "JEE 2027");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [loading, profile, isOnboarded, navigate]);

  if (loading || !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </Layout>
    );
  }

  const handleSave = async () => {
    const err = validateName(name);
    if (err) { toast({ variant: "destructive", title: err }); return; }
    setSaving(true);
    const { error } = await saveProfile({ display_name: name.trim(), target_category: target, avatar_url: avatarUrl });
    setSaving(false);
    if (error) toast({ variant: "destructive", title: "Save failed", description: String((error as any).message ?? error) });
    else toast({ title: "Profile saved" });
  };

  const handleSignOut = async () => { await signOut(); navigate("/welcome"); };

  const joinDate = new Date(profile.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const accountLabel = profile.account_type === "guest" ? "Guest" : profile.account_type === "google" ? "Google" : "Email";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Header card */}
        <Card className="relative overflow-hidden border-border/60 p-7 md:p-8 mb-6">
          <div aria-hidden className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
          <div aria-hidden className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row gap-6 md:items-center">
            <AvatarUploader
              avatarUrl={avatarUrl}
              displayName={name || profile.display_name}
              onChange={async (url) => { setAvatarUrl(url); await updateAvatar(url); }}
              ownerId={isAuthenticated ? undefined : `guest/${deviceId}`}
              streak={streak}
            />
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border/60 bg-surface-2/60 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" /> {accountLabel} account
              </span>
              <h1 className="mt-2 font-display text-3xl md:text-4xl font-black tracking-tight truncate">{profile.display_name}</h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Target className="h-3 w-3 text-primary" /> {profile.target_category}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> Joined {joinDate}</span>
                {user?.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3 text-primary" /> {user.email}</span>}
              </div>
            </div>
          </div>
        </Card>

        {/* Guest Account Upgrade Box */}
        {!isAuthenticated && (
          <Card className="relative overflow-hidden border-2 border-slate-900 dark:border-slate-700 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-primary/10 p-6 md:p-7 mb-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[10px] font-mono font-black uppercase tracking-wider">
                    ⚡ Guest Mode Active
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">· Local Browser Storage Only</span>
                </div>
                <h3 className="text-lg font-black font-display text-slate-900 dark:text-white">
                  Upgrade to Google to Unlock Full Aspirant Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>UI Unlocked:</strong> Custom avatar &amp; profile stats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Community:</strong> Post doubts, strategies &amp; memes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Cloud Backup:</strong> Never lose progress on cache clear</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Multi-device:</strong> Sync across phone, tab &amp; PC</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setUpgradeModalOpen(true)}
                className="rounded-2xl h-12 px-6 font-display font-bold text-sm bg-primary text-primary-foreground border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shrink-0"
              >
                <Sparkles className="w-4 h-4 mr-2 text-amber-300" />
                Upgrade with Google
              </Button>
            </div>
          </Card>
        )}

        {/* Email Account Pro-Tip Banner */}
        {isAuthenticated && profile.account_type === "email" && (
          <div className="flex items-center justify-between gap-3 p-4 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <span className="text-base">💡</span>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Signed in with Email Account</span>
                <span>You can also sign in using Google anytime with this email for instant 1-tap login across all your devices without passwords.</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Edit form */}
          <Card className="md:col-span-2 border-border/60 p-6">
            <h2 className="font-display text-lg font-bold mb-4">Edit profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} className="mt-1.5 h-11" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target category</label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TARGET_CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setTarget(c)}
                      className={`h-10 px-2 rounded-lg border text-xs font-semibold transition-all ${target === c ? "border-primary bg-primary/10 text-foreground" : "border-border/60 bg-background hover:border-primary/40 text-muted-foreground"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save changes</>}
                </Button>
                {!isAuthenticated && (
                  <Button variant="outline" onClick={() => setUpgradeModalOpen(true)}>
                    <Sparkles className="h-4 w-4 mr-2 text-primary" /> Upgrade with Google
                  </Button>
                )}
                {isAuthenticated && (
                  <Button variant="outline" onClick={handleSignOut} className="text-destructive hover:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Right cards */}
          <div className="space-y-4">
            <StatCard icon={BookOpen} title="Saved progress" desc="Your study activity and bookmarks live in YPT." cta="Open YPT" onClick={() => navigate("/ypt")} />
            <StatCard
              icon={BarChart3}
              title="Study stats"
              desc={`Active streak: ${streak} day${streak === 1 ? '' : 's'} (Best: ${longestStreak}d). Resets daily at 3:00 AM IST.`}
              cta="View stats"
              onClick={() => navigate("/ypt")}
            />
            <StatCard icon={Trophy} title="Leaderboards" desc="See where you rank today." cta="View board" onClick={() => navigate("/ypt")} />
          </div>
        </div>

        <UpgradeModal
          isOpen={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          feature="profile"
        />
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, title, desc, cta, onClick }: { icon: any; title: string; desc: string; cta: string; onClick: () => void }) {
  return (
    <Card className="border-border/60 p-5">
      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2.5">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
      <button onClick={onClick} className="mt-3 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80">{cta} →</button>
    </Card>
  );
}