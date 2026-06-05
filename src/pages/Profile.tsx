import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Mail, Sparkles, Save, LogOut, Loader2, Target, BookOpen, Trophy, BarChart3 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useProfile, TARGET_CATEGORIES, type TargetCategory } from "@/hooks/useProfile";
import { AvatarUploader } from "@/components/Profile/AvatarUploader";
import { validateName } from "@/types/ypt";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, isAuthenticated, isOnboarded, saveProfile, updateAvatar, signOut, deviceId, user } = useProfile();

  const [name, setName] = useState("");
  const [target, setTarget] = useState<TargetCategory>("JEE 2027");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
                  <Button variant="outline" onClick={() => navigate("/welcome")}>
                    <Sparkles className="h-4 w-4 mr-2 text-primary" /> Upgrade to full account
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
            <StatCard icon={BarChart3} title="Study stats" desc="Time, streaks, and goals." cta="View stats" onClick={() => navigate("/ypt")} />
            <StatCard icon={Trophy} title="Leaderboards" desc="See where you rank today." cta="View board" onClick={() => navigate("/ypt")} />
          </div>
        </div>
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