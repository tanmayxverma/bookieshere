import { useEffect, useState } from "react";
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
import { useProfile, TARGET_CATEGORIES, type TargetCategory } from "@/hooks/useProfile";
import { useUserStudyStats, formatStudyTime } from "@/hooks/useUserStudyStats";
import { useAuth } from "@/hooks/useAuth";
import { AvatarUploader } from "@/components/Profile/AvatarUploader";
import { validateName } from "@/types/ypt";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.6 2.4 2.2 6.8 2.2 12.1s4.4 9.7 9.8 9.7c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.5H12z"/>
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    profile, loading: profileLoading, isAuthenticated, isOnboarded,
    saveProfile, updateAvatar, signOut, deleteAccount, deviceId,
    user, googleAvatar, resetToGoogleAvatar
  } = useProfile();

  const {
    todaySeconds, totalSeconds, todaySessionsCount,
    streak, loading: statsLoading, refetch: refetchStats
  } = useUserStudyStats();

  const { signInWithGoogle, linkGoogleIdentity, signUp } = useAuth();

  const [name, setName] = useState("");
  const [target, setTarget] = useState<TargetCategory>("JEE 2027");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    if (!profileLoading && profile && !isOnboarded) navigate("/onboarding", { replace: true });
    if (profile) {
      setName(profile.display_name);
      setTarget((profile.target_category as TargetCategory) || "JEE 2027");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profileLoading, profile, isOnboarded, navigate]);

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

  const todayFormatted = formatStudyTime(todaySeconds);
  const totalFormatted = formatStudyTime(totalSeconds);
  // Daily target is standard 6 hours for aspirants
  const dailyTargetHours = 6;
  const dailyTargetSeconds = dailyTargetHours * 3600;
  const targetPercent = Math.min(100, Math.round((todaySeconds / dailyTargetSeconds) * 100));

  return (
    <Layout>
      <div className="w-full bg-background blueprint-grid text-on-surface min-h-screen py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ───── 1. HERO COCKPIT CARD ───── */}
          <Card className="relative overflow-hidden border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] rounded-3xl">
            <div className="relative flex flex-col md:flex-row gap-6 md:items-center justify-between">
              
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center min-w-0">
                <AvatarUploader
                  avatarUrl={avatarUrl}
                  displayName={name || profile.display_name}
                  onChange={async (url) => { setAvatarUrl(url); await updateAvatar(url); }}
                  googleAvatar={googleAvatar}
                  onResetGoogle={async () => {
                    if (googleAvatar) {
                      setAvatarUrl(googleAvatar);
                      await resetToGoogleAvatar();
                      toast({ title: "Restored Google profile photo" });
                    }
                  }}
                  ownerId={isAuthenticated ? undefined : `guest/${deviceId}`}
                />

                <div className="min-w-0 space-y-1.5">
                  {/* Account Type Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isGoogle && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/70 text-[11px] font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
                        <GoogleIcon /> Google Verified
                      </span>
                    )}
                    {isEmail && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/70 text-[11px] font-mono font-extrabold text-blue-700 dark:text-blue-300">
                        <Mail className="h-3 w-3" /> Email Account
                      </span>
                    )}
                    {isGuest && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/70 text-[11px] font-mono font-extrabold text-amber-800 dark:text-amber-300">
                        <Sparkles className="h-3 w-3" /> Guest Account
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      <Target className="h-3 w-3 text-primary" /> {profile.target_category}
                    </span>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 truncate">
                    {profile.display_name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-primary" /> Aspirant since {joinDate}
                    </span>
                    {user?.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3 text-primary" /> {user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    onClick={() => setShowSignOutModal(true)}
                    className="border-2 border-slate-900 text-slate-700 dark:text-slate-300 hover:text-red-600 font-bold text-xs h-10 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] active:translate-y-0.5"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* ───── 2. DAILY STUDY HOURS & METRICS (FOR EVERYONE) ───── */}
          <Card className="border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] rounded-3xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10.5px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Clock className="h-3 w-3" /> Daily Study Metric
                </div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                  Today's Study Performance
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Measured live across YPT study sessions and active timers
                </p>
              </div>

              <Link
                to="/ypt"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl border border-primary/20 transition-colors self-start sm:self-auto"
              >
                <span>Launch YPT Timer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Metric Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Box 1: Today Studied */}
              <div className="p-4 rounded-2xl border-2 border-slate-900 bg-brand-softYellow dark:bg-amber-950/30 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] space-y-1">
                <span className="text-[11px] font-mono font-bold text-amber-900 dark:text-amber-300 uppercase flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Today Studied
                </span>
                <div className="text-2xl sm:text-3xl font-display font-black text-amber-950 dark:text-amber-100">
                  {todayFormatted.formatted}
                </div>
                <p className="text-[10px] font-mono text-amber-800/80 dark:text-amber-300/80">
                  {todaySessionsCount} session{todaySessionsCount !== 1 ? 's' : ''} logged today
                </p>
              </div>

              {/* Box 2: Current Streak */}
              <div className="p-4 rounded-2xl border-2 border-slate-900 bg-orange-50 dark:bg-orange-950/30 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] space-y-1">
                <span className="text-[11px] font-mono font-bold text-orange-700 dark:text-orange-300 uppercase flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" /> Study Streak
                </span>
                <div className="text-2xl sm:text-3xl font-display font-black text-orange-950 dark:text-orange-100">
                  {streak} <span className="text-base font-bold">days</span>
                </div>
                <p className="text-[10px] font-mono text-orange-800/80 dark:text-orange-300/80">
                  {streak > 0 ? "🔥 Streak alive" : "Study today to ignite"}
                </p>
              </div>

              {/* Box 3: Daily Goal Target */}
              <div className="p-4 rounded-2xl border-2 border-slate-900 bg-blue-50 dark:bg-blue-950/30 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] space-y-1">
                <span className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300 uppercase flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-brand-blue" /> Daily Goal ({dailyTargetHours}h)
                </span>
                <div className="text-2xl sm:text-3xl font-display font-black text-blue-950 dark:text-blue-100">
                  {targetPercent}%
                </div>
                <p className="text-[10px] font-mono text-blue-800/80 dark:text-blue-300/80">
                  {todayFormatted.hours}h of {dailyTargetHours}h completed
                </p>
              </div>

              {/* Box 4: Total Lifetime Study */}
              <div className="p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-800 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] space-y-1">
                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" /> Total Hours
                </span>
                <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-slate-100">
                  {totalFormatted.formatted}
                </div>
                <p className="text-[10px] font-mono text-slate-500">
                  All-time Bookie focus time
                </p>
              </div>
            </div>

            {/* Daily Goal Visual Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                <span>Daily 6-Hour Target Progress</span>
                <span>{targetPercent}% ({todayFormatted.formatted} / {dailyTargetHours}h)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 p-0.5">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${targetPercent}%` }}
                />
              </div>
            </div>
          </Card>

          {/* ───── 3. ACCOUNT UPGRADATION CARD ───── */}
          {isGuest && (
            <Card className="border-2 border-slate-900 bg-gradient-to-br from-brand-softYellow/60 to-white dark:from-amber-950/20 dark:to-slate-900 p-6 sm:p-7 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] rounded-3xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-400 text-slate-900 border-2 border-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                    Upgrade Account (Zero Data Loss)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    You are currently using a guest device account. Upgrade to a permanent account with Google or email so your <strong>study sessions ({todayFormatted.formatted})</strong>, <strong>streak ({streak}d)</strong>, and syllabus bookmarks follow you across all your devices seamlessly.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={handleUpgradeToGoogle}
                  disabled={upgrading}
                  className="bg-slate-900 text-white hover:bg-slate-800 border-2 border-slate-900 font-bold text-xs h-11 px-5 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] active:translate-y-0.5"
                >
                  {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GoogleIcon />}
                  <span className="ml-2">Upgrade with Google</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailUpgrade(true)}
                  disabled={upgrading}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs h-11 px-5 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] active:translate-y-0.5"
                >
                  <Mail className="h-4 w-4 mr-2" /> Upgrade with Email
                </Button>
              </div>
            </Card>
          )}

          {isEmail && (
            <Card className="border-2 border-slate-900 bg-blue-50/70 dark:bg-blue-950/20 p-6 sm:p-7 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] rounded-3xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-brand-blue text-white border-2 border-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                    Upgrade to Google Account
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    You are signed in via Email. Link your Google account to enable instant one-click login and automated profile picture sync. Your study hours, streak, and history remain 100% intact.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleLinkGoogle}
                  disabled={upgrading}
                  className="bg-slate-900 text-white hover:bg-slate-800 border-2 border-slate-900 font-bold text-xs h-11 px-5 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] active:translate-y-0.5"
                >
                  {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GoogleIcon />}
                  <span className="ml-2">Link Google Account</span>
                </Button>
              </div>
            </Card>
          )}

          {/* ───── 4. EDIT PROFILE SETTINGS & SHORTCUTS ───── */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Edit form */}
            <Card className="md:col-span-2 border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] rounded-3xl space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  Profile Settings
                </h2>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Update your public name and exam focus
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Display Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={30}
                    className="mt-1.5 h-11 border-2 border-slate-300 focus-visible:border-slate-900 font-medium"
                    placeholder="Your Name"
                  />
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">
                    Visible across community discussions, doubts, and leaderboards.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Target Exam Category
                  </label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TARGET_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTarget(c)}
                        className={`h-10 px-2 rounded-xl border-2 text-xs font-mono font-bold transition-all ${
                          target === c
                            ? "border-slate-900 bg-brand-blue text-white shadow-xs"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-slate-400 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-11 px-6 bg-slate-900 text-white font-bold text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] hover:bg-slate-800 active:translate-y-0.5"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Nav Cards */}
            <div className="space-y-4">
              <StatCard
                icon={BookOpen}
                title="Study Tracker (YPT)"
                desc="Launch focus timer, track study sessions, and maintain streaks."
                cta="Open Tracker"
                onClick={() => navigate("/ypt")}
              />
              <StatCard
                icon={BarChart3}
                title="Syllabus Tracker"
                desc="Track chapter completions and revisions across Physics, Chem & Math."
                cta="View Syllabus"
                onClick={() => navigate("/ypt?tab=syllabus")}
              />
              <StatCard
                icon={Trophy}
                title="Aspirant Leaderboard"
                desc="See how your study hours compare with thousands of serious peers."
                cta="View Standings"
                onClick={() => navigate("/ypt?tab=leaderboard")}
              />
            </div>
          </div>

          {/* ───── 5. DANGER ZONE: PERMANENT DATA DELETION ───── */}
          <Card className="border-2 border-red-500 bg-red-50/50 dark:bg-red-950/20 p-6 sm:p-7 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)] rounded-3xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 border-2 border-red-500 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-red-950 dark:text-red-100">
                  Danger Zone: Permanent Account & Data Deletion
                </h3>
                <p className="text-xs sm:text-sm text-red-800/90 dark:text-red-300/90 leading-relaxed">
                  Permanently purge all data regarding your account from our database. This immediately wipes your <strong>study sessions</strong>, <strong>study streak</strong>, <strong>profile details</strong>, <strong>community questions & comments</strong>, and <strong>support conversations</strong>. This action is irreversible.
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
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs border-2 border-red-900 shadow-[2px_2px_0px_0px_rgba(153,27,27,1)] active:translate-y-0.5 h-10 px-4"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Permanently Delete All My Data
              </Button>
            </div>
          </Card>

        </div>
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