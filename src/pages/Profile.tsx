import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar, Mail, Save, LogOut, Loader2, Target,
  BookOpen, Trophy, BarChart3, Clock, Flame, ShieldCheck,
  AlertTriangle, Trash2, ArrowRight, Zap, CheckCircle2, User,
  Check
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
import { cn } from "@/lib/utils";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.6 2.4 2.2 6.8 2.2 12.1s4.4 9.7 9.8 9.7c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.5H12z"/>
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    profile,
    loading: profileLoading,
    isAuthenticated,
    saveProfile,
    updateAvatar,
    signOut,
    deleteAccount,
    deviceId,
    user,
    googleAvatar,
    resetToGoogleAvatar
  } = useProfile();

  const { signInWithGoogle, linkGoogleIdentity, signUp } = useAuth();
  const { todaySeconds, totalSeconds, todaySessionsCount, streak: statsStreak } = useUserStudyStats();
  const { streak: streakFromHook } = useUserStreak();

  const streak = Math.max(statsStreak || 0, streakFromHook || 0);

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

  const handleUpgradeToGoogle = async () => {
    setUpgrading(true);
    const r = await signInWithGoogle(`${window.location.origin}/profile`);
    if (r.error) {
      setUpgrading(false);
      toast({ variant: "destructive", title: "Google upgrade failed", description: r.error.message });
    }
  };

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
  const dailyTargetHours = 6;
  const dailyTargetSeconds = dailyTargetHours * 3600;
  const targetPercent = Math.min(100, Math.round((todaySeconds / dailyTargetSeconds) * 100));
  const todayHoursNumeric = `${(todaySeconds / 3600).toFixed(1)}h`;
  const totalHoursNumeric = `${(totalSeconds / 3600).toFixed(1)}h`;

  return (
    <Layout>
      <div className="w-full bg-background text-foreground min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ───── 1. HERO COCKPIT CARD ───── */}
          <Card className="relative overflow-hidden border-2 border-border bg-card p-6 sm:p-8 shadow-[4px_4px_0px_var(--desk-border)] rounded-2xl">
            <div className="relative flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center min-w-0 flex-1">
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
                  streak={streak}
                  showPresets={true}
                />

                <div className="min-w-0 space-y-2 flex-1">
                  {/* Account Type Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isGoogle && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border bg-muted text-[11px] font-mono font-bold text-foreground">
                        <GoogleIcon /> Google Verified
                      </span>
                    )}
                    {isEmail && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border bg-muted text-[11px] font-mono font-bold text-foreground">
                        <Mail className="h-3 w-3" /> Email Account
                      </span>
                    )}
                    {isGuest && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-primary/30 bg-primary/10 text-[11px] font-mono font-bold text-primary">
                        <Zap className="h-3 w-3" /> Guest Dossier
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border bg-background text-[11px] font-mono font-bold text-foreground">
                      <Target className="h-3.5 w-3.5 text-primary" /> {profile.target_category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-primary/30 bg-primary/10 text-[11px] font-mono font-bold text-primary">
                      <Flame className="h-3.5 w-3.5 text-primary" /> {streak}d streak
                    </span>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground break-words">
                    {profile.display_name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Aspirant since {joinDate}
                    </span>
                    {user?.email && (
                      <span className="inline-flex items-center gap-1.5 break-all">
                        <Mail className="h-3.5 w-3.5 text-primary shrink-0" /> {user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
                {isGuest && (
                  <Button
                    onClick={() => setUpgradeModalOpen(true)}
                    className="border-2 border-border bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-xs font-bold h-10 px-4 rounded-xl shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <Zap className="h-3.5 w-3.5 mr-1.5" /> Link Cloud
                  </Button>
                )}
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    onClick={() => setShowSignOutModal(true)}
                    className="border-2 border-border bg-card text-foreground hover:text-destructive font-mono text-xs font-bold h-10 px-4 rounded-xl shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* ───── 2. DAILY STUDY HOURS & METRICS ───── */}
          <Card className="border-2 border-border bg-card p-6 sm:p-7 shadow-[4px_4px_0px_var(--desk-border)] rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-border bg-muted text-muted-foreground text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Clock className="h-3 w-3 text-primary" /> DAILY FOCUS DISPATCH
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Study Performance Ledger
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Logged across YPT study carrels and active session timers
                </p>
              </div>

              <Link
                to="/ypt"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-foreground bg-muted hover:bg-card px-4 py-2 rounded-xl border border-border shadow-[2px_2px_0px_var(--desk-border)] transition-all self-start sm:self-auto active:translate-x-0.5 active:translate-y-0.5 shrink-0"
              >
                <span>Launch YPT Carrel</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Metric Highlights Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Box 1: Today Studied */}
              <div className="p-4 sm:p-5 rounded-xl border-2 border-border bg-background shadow-[3px_3px_0px_var(--desk-border)] space-y-1">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> TODAY STUDIED
                </span>
                <div className="text-2xl sm:text-3xl font-display font-black text-foreground">
                  {todayHoursNumeric}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {todaySessionsCount} session{todaySessionsCount !== 1 ? "s" : ""} logged today
                </p>
              </div>

              {/* Box 2: Study Streak */}
              <div className="p-4 sm:p-5 rounded-xl border-2 border-border bg-background shadow-[3px_3px_0px_var(--desk-border)] space-y-1">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-primary" /> STUDY STREAK
                </span>
                <div className="text-2xl sm:text-3xl font-display font-black text-foreground">
                  {streak} <span className="text-sm font-mono text-muted-foreground">days</span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {streak > 0 ? "Active streak recorded" : "Begin streak today"}
                </p>
              </div>

              {/* Box 3: Daily Goal Target */}
              <div className="p-4 sm:p-5 rounded-xl border-2 border-border bg-background shadow-[3px_3px_0px_var(--desk-border)] space-y-1">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" /> DAILY GOAL ({dailyTargetHours}H)
                </span>
                <div className="text-2xl sm:text-3xl font-display font-black text-foreground">
                  {targetPercent}%
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {(todaySeconds / 3600).toFixed(1)}h of {dailyTargetHours}h completed
                </p>
              </div>

              {/* Box 4: Total Lifetime Study */}
              <div className="p-4 sm:p-5 rounded-xl border-2 border-border bg-background shadow-[3px_3px_0px_var(--desk-border)] space-y-1">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-primary" /> TOTAL HOURS
                </span>
                <div className="text-2xl sm:text-3xl font-display font-black text-foreground">
                  {totalHoursNumeric}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  All-time Bookie focus time
                </p>
              </div>
            </div>

            {/* Daily Goal Visual Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <span>Daily 6-Hour Target Progress</span>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                    {targetPercent >= 100 ? "Goal Fulfilled" : `${Math.max(0, dailyTargetHours - (todaySeconds / 3600)).toFixed(1)}h remaining`}
                  </span>
                </span>
                <span>{targetPercent}% ({todayFormatted.formatted} / {dailyTargetHours}h)</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden border-2 border-border p-0.5">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, targetPercent)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* ───── 3. ACCOUNT UPGRADATION CARD ───── */}
          {isGuest && (
            <Card className="border-2 border-border bg-card p-6 sm:p-7 shadow-[4px_4px_0px_var(--desk-border)] rounded-2xl space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-muted border-2 border-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_var(--desk-border)]">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                      Guest Mode Active
                    </span>
                    <span className="text-xs font-mono text-muted-foreground font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Free & Local Session
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-black text-foreground">
                    Upgrade Account (Zero Data Loss)
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    You are currently using a guest device dossier. Everything is saved locally. Upgrade to a permanent account with Google or email so your <strong>study sessions ({todayFormatted.formatted})</strong>, <strong>streak ({streak}d)</strong>, and syllabus bookmarks follow you across all your devices seamlessly.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span><strong>100% Free:</strong> Timers, tests, notes & stats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span><strong>Custom Identity:</strong> Free avatar photo & name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span><strong>Zero Data Loss:</strong> Streaks & sessions preserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span><strong>Multi-Device:</strong> Sync phone, tablet & laptop</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={handleUpgradeToGoogle}
                  disabled={upgrading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-border font-sans font-bold text-xs h-10 px-5 rounded-xl shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GoogleIcon />}
                  <span className="ml-2">Upgrade with Google</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailUpgrade(true)}
                  disabled={upgrading}
                  className="bg-card border-2 border-border text-foreground font-sans font-bold text-xs h-10 px-5 rounded-xl shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <Mail className="h-4 w-4 mr-2" /> Upgrade with Email
                </Button>
              </div>
            </Card>
          )}

          {isEmail && (
            <Card className="border-2 border-border bg-card p-6 sm:p-7 shadow-[4px_4px_0px_var(--desk-border)] rounded-2xl space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-muted border-2 border-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_var(--desk-border)]">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Link Google Account
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    You are signed in via Email. Link your Google account to enable instant one-click login and automated profile picture sync. Your study hours, streak, and history remain 100% intact.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleLinkGoogle}
                  disabled={upgrading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-border font-sans font-bold text-xs h-10 px-5 rounded-xl shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GoogleIcon />}
                  <span className="ml-2">Link Google Account</span>
                </Button>
              </div>
            </Card>
          )}

          {/* ───── 4. EDIT PROFILE SETTINGS & SHORTCUTS ───── */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-2 border-border bg-card p-6 sm:p-7 shadow-[4px_4px_0px_var(--desk-border)] rounded-2xl space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Profile Settings
                </h2>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Update your public aspirant identity and target examination
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                    Display Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={30}
                    className="mt-1.5 h-10 border-2 border-border font-sans text-sm rounded-lg"
                    placeholder="Your Name"
                  />
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">
                    Visible across community discussions, doubts, and study carrels.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                    Target Exam Category
                  </label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TARGET_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTarget(c)}
                        className={cn(
                          "h-10 px-2 rounded-lg border-2 text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center",
                          target === c
                            ? "border-foreground bg-foreground text-background shadow-[2px_2px_0px_var(--desk-border)]"
                            : "border-border bg-muted/50 hover:bg-muted text-foreground"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-10 px-5 bg-primary text-primary-foreground font-sans font-bold text-xs border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-lg cursor-pointer"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                  {!isAuthenticated && (
                    <Button
                      variant="outline"
                      onClick={() => setUpgradeModalOpen(true)}
                      className="h-10 px-4 font-sans font-bold text-xs border-2 border-border bg-card text-foreground rounded-lg shadow-[2px_2px_0px_var(--desk-border)] cursor-pointer"
                    >
                      <Zap className="h-4 w-4 mr-1.5 text-primary" /> Upgrade with Google
                    </Button>
                  )}
                </div>
              </div>
            </Card>

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
          <Card className="border-2 border-destructive bg-card p-6 sm:p-7 shadow-[4px_4px_0px_var(--desk-border)] rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive border-2 border-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-foreground">
                  Danger Zone: Permanent Account & Data Deletion
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
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
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-sans font-bold text-xs border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none h-10 px-5 rounded-lg cursor-pointer"
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
        <DialogContent className="max-w-md border-2 border-border bg-card rounded-2xl shadow-[6px_6px_0px_var(--desk-border)] p-6">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-xl flex items-center gap-2 text-foreground">
              <Mail className="h-5 w-5 text-primary" /> Upgrade with Email
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-muted-foreground">
              Your existing guest study hours ({todayFormatted.formatted}), streak ({streak}d), and settings will be preserved completely.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpgradeToEmail} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="name@example.com"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                className="mt-1 h-10 border-2 border-border text-sm rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Create Password
              </label>
              <Input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={upgradePassword}
                onChange={(e) => setUpgradePassword(e.target.value)}
                className="mt-1 h-10 border-2 border-border text-sm rounded-lg"
              />
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowEmailUpgrade(false)} className="h-10 rounded-lg border-border">
                Cancel
              </Button>
              <Button type="submit" disabled={upgrading} className="h-10 bg-primary text-primary-foreground font-bold rounded-lg border-2 border-border shadow-[2px_2px_0px_var(--desk-border)]">
                {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Upgrade Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───── MODAL: SIGN OUT CONFIRMATION ───── */}
      <AlertDialog open={showSignOutModal} onOpenChange={setShowSignOutModal}>
        <AlertDialogContent className="border-2 border-border rounded-2xl bg-card shadow-[6px_6px_0px_var(--desk-border)] max-w-md p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-1 text-foreground">
              <LogOut className="h-5 w-5 text-primary" />
              <AlertDialogTitle className="font-display font-black text-xl">
                Log Out of Bookie?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs font-mono text-muted-foreground leading-relaxed">
              You will be signed out of your account on this device. Your study streak ({streak}d), logs, and progress are saved in the cloud and will be available whenever you log back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-3 border-t border-border">
            <AlertDialogCancel className="h-10 font-mono font-bold rounded-lg border-border">Stay Logged In</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="h-10 font-mono font-bold bg-foreground text-background hover:bg-foreground/90 rounded-lg"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ───── MODAL: PERMANENT DATA DELETION WITH WARNING ───── */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="border-2 border-destructive rounded-2xl bg-card shadow-[6px_6px_0px_var(--desk-border)] max-w-lg p-6 sm:p-7">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-destructive mb-1">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <AlertDialogTitle className="font-display font-black text-xl sm:text-2xl text-destructive">
                Permanent Data Deletion Warning
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3 pt-2 text-xs font-mono text-foreground leading-relaxed">
              <div className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-foreground space-y-1">
                <div className="font-bold text-sm text-destructive">This action is permanent and irreversible.</div>
                <p>All data connected to this account ({isGuest ? "Guest Device" : isGoogle ? "Google Account" : "Email Account"}) will be immediately purged from our database:</p>
                <ul className="list-disc list-inside space-y-0.5 pt-1 text-[11px] text-muted-foreground">
                  <li>All study timers and completed study sessions ({totalFormatted.formatted})</li>
                  <li>Active study streak ({streak} days)</li>
                  <li>Syllabus progress, bookmarks, and room records</li>
                  <li>Community posts, comments, reactions, and doubts</li>
                  <li>Support conversations and ticket history</li>
                </ul>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-xs uppercase tracking-wider text-foreground block">
                  To confirm, type <span className="text-destructive font-black">DELETE</span> below:
                </label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="h-10 border-2 border-destructive font-mono text-sm tracking-wider uppercase rounded-lg"
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 pt-3 border-t border-border">
            <AlertDialogCancel disabled={deleting} className="h-10 font-mono font-bold rounded-lg border-border">
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteEverything}
              disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || deleting}
              className="h-10 font-mono font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50 rounded-lg border-2 border-border shadow-[2px_2px_0px_var(--desk-border)]"
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
    <Card className="border-2 border-border bg-card p-5 shadow-[3px_3px_0px_var(--desk-border)] rounded-xl hover:-translate-y-0.5 transition-transform">
      <div className="h-9 w-9 rounded-lg border border-border bg-muted text-primary flex items-center justify-center mb-2.5">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-display font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-sans">{desc}</p>
      <button onClick={onClick} className="mt-3 text-xs font-mono font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
        <span>{cta}</span> →
      </button>
    </Card>
  );
}