import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar, Mail, Sparkles, Save, LogOut, Loader2, Target,
  BookOpen, Trophy, BarChart3, Clock, Flame, ShieldCheck,
  AlertTriangle, Trash2, CheckCircle2, ArrowRight, X
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, TARGET_CATEGORIES, type TargetCategory } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useUserStreak";
import { useUserStudyStats, formatStudyTime } from "@/hooks/useUserStudyStats";
import { AvatarUploader } from "@/components/Profile/AvatarUploader";
import { validateName } from "@/types/ypt";
import { UpgradeModal } from "@/components/Auth/UpgradeModal";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.6 2.4 2.2 6.8 2.2 12.1s4.4 9.7 9.8 9.7c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.5H12z"/>
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading: profileLoading, isAuthenticated, isOnboarded, saveProfile, updateAvatar, signOut, deleteAccount, deviceId, user } = useProfile();
  const { signInWithGoogle, linkGoogleIdentity, signUp } = useAuth();
  const { todaySeconds, totalSeconds } = useUserStudyStats();
  const { streak, longestStreak } = useUserStreak();

  const [name, setName] = useState("");
  const [target, setTarget] = useState<TargetCategory>("JEE 2027");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Upgrade modals state
  const [showEmailUpgrade, setShowEmailUpgrade] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState("");
  const [upgradePassword, setUpgradePassword] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  // Sign out modal
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!profileLoading && !profile) navigate("/welcome", { replace: true });
    if (profile) {
      setName(profile.display_name && profile.display_name !== "Aspirant" ? profile.display_name : (profile.display_name || ""));
      setTarget((profile.target_category as TargetCategory) || "JEE 2027");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profileLoading, profile, navigate]);

  if (profileLoading || !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs font-mono text-muted-foreground">Loading Cockpit Profile...</span>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    const err = validateName(name);
    if (err) { toast({ variant: "destructive", title: err }); return; }
    setSaving(true);
    const { error } = await saveProfile({
      display_name: name.trim(),
      target_category: target,
      avatar_url: avatarUrl,
    });
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Save failed", description: String((error as any).message ?? error) });
    } else {
      toast({ title: "Profile updated successfully" });
    }
  };

  const handleSignOut = async () => {
    setShowSignOutModal(false);
    await signOut();
    navigate("/welcome", { replace: true });
  };

  // 1. Upgrade Guest to Google
  const handleUpgradeToGoogle = async () => {
    setUpgrading(true);
    const r = await signInWithGoogle(`${window.location.origin}/profile`);
    if (r.error) {
      setUpgrading(false);
      toast({ variant: "destructive", title: "Google upgrade failed", description: r.error.message });
    }
  };

  // 2. Upgrade Email user to Google (Link identity)
  const handleLinkGoogle = async () => {
    setUpgrading(true);
    const { error } = await linkGoogleIdentity();
    setUpgrading(false);
    if (error) {
      toast({ variant: "destructive", title: "Could not link Google account", description: error.message });
    } else {
      toast({ title: "Redirecting to Google for account linking..." });
    }
  };

  // 3. Upgrade Guest to Email
  const handleUpgradeToEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradeEmail || !upgradePassword) {
      toast({ variant: "destructive", title: "Please provide email and password" });
      return;
    }
    if (upgradePassword.length < 6) {
      toast({ variant: "destructive", title: "Password must be at least 6 characters" });
      return;
    }
    setUpgrading(true);
    const { error } = await signUp(upgradeEmail.trim(), upgradePassword, `${window.location.origin}/profile`);
    setUpgrading(false);
    if (error) {
      toast({ variant: "destructive", title: "Email upgrade failed", description: error.message });
    } else {
      setShowEmailUpgrade(false);
      toast({ title: "Account created!", description: "All your study history and streaks are preserved." });
    }
  };

  // 4. Permanent Account and Data Deletion
  const handleDeleteEverything = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      toast({ variant: "destructive", title: "Please type DELETE to confirm" });
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      toast({ title: "Account & all data deleted", description: "Your study logs, streaks, and account have been permanently erased." });
      navigate("/welcome", { replace: true });
    } catch (err: any) {
      setDeleting(false);
      toast({ variant: "destructive", title: "Deletion failed", description: err?.message || String(err) });
    }
  };

  const joinDate = new Date(profile.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const isGuest = profile.account_type === "guest" || !isAuthenticated;
  const isEmail = profile.account_type === "email" && isAuthenticated;
  const isGoogle = profile.account_type === "google" && isAuthenticated;
  const accountLabel = profile.account_type === "guest" ? "Guest" : profile.account_type === "google" ? "Google" : "Email";

  const todayFormatted = formatStudyTime(todaySeconds);
  const totalFormatted = formatStudyTime(totalSeconds);
  // Daily target is standard 6 hours for aspirants
  const dailyTargetHours = 6;
  const dailyTargetSeconds = dailyTargetHours * 3600;
  const targetPercent = Math.min(100, Math.round((todaySeconds / dailyTargetSeconds) * 100));

  return (
    <Layout>
      <div className="w-full bg-background blueprint-grid text-on-surface min-h-screen py-4 sm:py-8 px-3 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          <Card className="relative overflow-hidden border-border/60 p-4 sm:p-7 md:p-8 mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl">
            <div aria-hidden className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
            <div aria-hidden className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row gap-5 sm:gap-6 items-center md:items-center text-center md:text-left">
              <AvatarUploader
                avatarUrl={avatarUrl}
                displayName={name || profile.display_name}
                onChange={async (url) => { setAvatarUrl(url); await updateAvatar(url); }}
                ownerId={isAuthenticated ? undefined : `guest/${deviceId}`}
                streak={streak}
                showPresets={true}
              />
              <div className="min-w-0 flex-1 w-full">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border/60 bg-surface-2/60 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" /> {accountLabel} account
                </span>
                <h1 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight break-words">{profile.display_name}</h1>
                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Target className="h-3 w-3 text-primary" /> {profile.target_category}</span>
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> Joined {joinDate}</span>
                  {user?.email && <span className="inline-flex items-center gap-1.5 break-all"><Mail className="h-3 w-3 text-primary shrink-0" /> {user.email}</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Guest Mode Notice & Cloud Backup Option */}
          {!isAuthenticated && (
            <Card className="relative overflow-hidden border-2 border-slate-900 dark:border-slate-700 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-primary/10 p-4 sm:p-6 md:p-7 mb-4 sm:mb-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-2xl sm:rounded-3xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-xl w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[10px] font-mono font-black uppercase tracking-wider">
                      ⚡ Guest Mode Active
                    </span>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Free · Saved Data is Safe
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black font-display text-slate-900 dark:text-white">
                    Your Guest Profile &amp; Stats Are Fully Functional
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    You can set your custom name, avatar photo, and JEE target year for free. Optionally link Google or Email for multi-device sync and community posting.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>100% Free:</strong> Timers, tests, notes &amp; stats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Custom Identity:</strong> Free avatar photo &amp; name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Zero Data Loss:</strong> Streaks &amp; sessions saved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Optional Cloud:</strong> Sync phone, tab &amp; PC</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                  <Button
                    onClick={() => setUpgradeModalOpen(true)}
                    className="w-full sm:w-auto rounded-xl sm:rounded-2xl h-11 px-5 font-display font-bold text-xs bg-primary text-primary-foreground border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none justify-center"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />
                    Link Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailUpgrade(true)}
                    className="w-full sm:w-auto rounded-xl sm:rounded-2xl h-11 px-4 font-display font-bold text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none justify-center"
                  >
                    <Mail className="w-4 h-4 mr-1.5 text-primary" />
                    Link Email
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Email Account Pro-Tip Banner */}
          {isAuthenticated && profile.account_type === "email" && (
            <div className="flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 mb-4 sm:mb-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start sm:items-center gap-2.5">
                <span className="text-base shrink-0 mt-0.5 sm:mt-0">💡</span>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Signed in with Email Account</span>
                  <span>You can also sign in using Google anytime with this email for instant 1-tap login across all your devices without passwords.</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {/* Edit form */}
            <Card className="md:col-span-2 border-border/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
              <h2 className="font-display text-base sm:text-lg font-bold mb-3 sm:mb-4">Edit profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={30}
                    placeholder="Enter your name"
                    className="mt-1.5 h-11 text-base sm:text-sm rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target category</label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TARGET_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTarget(c)}
                        className={`h-11 sm:h-10 px-2 rounded-xl border text-xs font-semibold transition-all min-h-[44px] sm:min-h-0 flex items-center justify-center cursor-pointer ${
                          target === c
                            ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs"
                            : "border-border/60 bg-background hover:border-primary/40 text-muted-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <Button onClick={handleSave} disabled={saving} className="h-11 w-full sm:w-auto font-bold justify-center rounded-xl">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save changes
                  </Button>
                  {!isAuthenticated && (
                    <Button variant="outline" onClick={() => setUpgradeModalOpen(true)} className="h-11 w-full sm:w-auto font-bold justify-center rounded-xl">
                      <Sparkles className="h-4 w-4 mr-2 text-primary" /> Upgrade with Google
                    </Button>
                  )}
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      onClick={() => setShowSignOutModal(true)}
                      className="border-2 border-slate-900 text-slate-700 dark:text-slate-300 hover:text-red-600 font-bold text-xs h-11 w-full sm:w-auto rounded-xl shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] active:translate-y-0.5 justify-center"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Right cards */}
            <div className="space-y-3 sm:space-y-4">
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

          {/* ───── 5. DANGER ZONE: PERMANENT DATA DELETION ───── */}
          <Card className="border-2 border-red-500 bg-red-50/50 dark:bg-red-950/20 p-4 sm:p-6 md:p-7 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)] rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 border-2 border-red-500 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base sm:text-lg font-bold text-red-950 dark:text-red-100">
                  Danger Zone: Permanent Account &amp; Data Deletion
                </h3>
                <p className="text-xs sm:text-sm text-red-800/90 dark:text-red-300/90 leading-relaxed">
                  Permanently purge all data regarding your account from our database. This immediately wipes your <strong>study sessions</strong>, <strong>study streak</strong>, <strong>profile details</strong>, <strong>community questions &amp; comments</strong>, and <strong>support conversations</strong>. This action is irreversible.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteConfirmText("");
                  setShowDeleteModal(true);
                }}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs border-2 border-red-900 shadow-[2px_2px_0px_0px_rgba(153,27,27,1)] active:translate-y-0.5 h-11 sm:h-10 px-4 rounded-xl justify-center"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Permanently Delete All My Data
              </Button>
            </div>
          </Card>
        </div>

        <UpgradeModal
          isOpen={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          feature="profile"
        />
      </div>

      {/* ───── MODAL: UPGRADE WITH EMAIL ───── */}
      <Dialog open={showEmailUpgrade} onOpenChange={setShowEmailUpgrade}>
        <DialogContent className="max-w-md border-2 border-slate-900 bg-white dark:bg-slate-900 rounded-3xl shadow-[6px_6px_0px_0px_rgba(19,27,46,1)] p-6">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Upgrade with Email
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-slate-500">
              Your existing guest study hours ({todayFormatted.formatted}), streak ({streak}d), and settings will be preserved completely.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpgradeToEmail} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="name@example.com"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                className="mt-1 h-11 border-2 border-slate-300 focus-visible:border-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Create Password
              </label>
              <Input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={upgradePassword}
                onChange={(e) => setUpgradePassword(e.target.value)}
                className="mt-1 h-11 border-2 border-slate-300 focus-visible:border-slate-900 text-sm"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEmailUpgrade(false)} className="h-11">
                Cancel
              </Button>
              <Button type="submit" disabled={upgrading} className="h-11 bg-slate-900 text-white font-bold">
                {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Upgrade Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───── MODAL: SIGN OUT CONFIRMATION ───── */}
      <AlertDialog open={showSignOutModal} onOpenChange={setShowSignOutModal}>
        <AlertDialogContent className="border-2 border-slate-900 rounded-3xl bg-white dark:bg-slate-900 shadow-[6px_6px_0px_0px_rgba(19,27,46,1)] max-w-md p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-slate-100">
              <LogOut className="h-5 w-5 text-primary" />
              <AlertDialogTitle className="font-display font-black text-xl">
                Log Out of Bookie?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
              You will be signed out of your account on this device. Your study streak ({streak}d), logs, and progress are saved in the cloud and will be available whenever you log back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-3">
            <AlertDialogCancel className="h-11 font-mono font-bold">Stay Logged In</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="h-11 font-mono font-bold bg-slate-900 hover:bg-slate-800 text-white"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ───── MODAL: PERMANENT DATA DELETION WITH WARNING ───── */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="border-2 border-red-600 rounded-3xl bg-white dark:bg-slate-900 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] max-w-lg p-6 sm:p-7">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-red-600 mb-1">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <AlertDialogTitle className="font-display font-black text-xl sm:text-2xl text-red-600">
                Permanent Data Deletion Warning
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3 pt-2 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 space-y-1">
                <div className="font-bold text-sm">⚠️ This action is permanent and irreversible.</div>
                <p>All data connected to this account ({isGuest ? "Guest Device" : isGoogle ? "Google Account" : "Email Account"}) will be immediately purged from our database:</p>
                <ul className="list-disc list-inside space-y-0.5 pt-1 text-[11px]">
                  <li>All study timers and completed study sessions ({totalFormatted.formatted})</li>
                  <li>Active study streak ({streak} days)</li>
                  <li>Syllabus progress, bookmarks, and room records</li>
                  <li>Community posts, comments, reactions, and doubts</li>
                  <li>Support conversations and ticket history</li>
                </ul>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 block">
                  To confirm, type <span className="text-red-600 font-black">DELETE</span> below:
                </label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="h-11 border-2 border-red-300 focus-visible:border-red-600 font-mono text-sm tracking-wider uppercase"
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 pt-3">
            <AlertDialogCancel disabled={deleting} className="h-11 font-mono font-bold">
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteEverything}
              disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || deleting}
              className="h-11 font-mono font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Permanently Purge All Data
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Layout>
  );
}

function StatCard({ icon: Icon, title, desc, cta, onClick }: { icon: any; title: string; desc: string; cta: string; onClick: () => void }) {
  return (
    <Card className="border-2 border-slate-900 bg-white dark:bg-slate-900 p-5 shadow-[3px_3px_0px_0px_rgba(19,27,46,1)] rounded-2xl">
      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-2.5">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-mono">{desc}</p>
      <button onClick={onClick} className="mt-3 text-xs font-mono font-bold text-primary hover:underline inline-flex items-center gap-1">
        <span>{cta}</span> →
      </button>
    </Card>
  );
}