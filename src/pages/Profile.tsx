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
import { BookieEmblem } from "@/components/Brand/BookieEmblem";
import { cn } from "@/lib/utils";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
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
          <span className="text-xs font-mono text-muted-foreground">Cataloging Aspirant Dossier...</span>
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
  const todayHoursNumeric = (todaySeconds / 3600).toFixed(1);
  const totalHoursNumeric = (totalSeconds / 3600).toFixed(1);

  return (
    <Layout>
      <div className="w-full bg-academic-grid text-foreground min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ───── 1. HERO PROFILE DOSSIER (Stitch Screen 13) ───── */}
          <section className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            {/* Watermark Background Seal */}
            <div className="absolute -right-8 -top-8 opacity-[0.04] pointer-events-none select-none">
              <BookieEmblem size={240} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
              {/* Left Column: Portrait Frame & Preset Picker */}
              <div className="md:col-span-4 flex flex-col items-center text-center">
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
              </div>

              {/* Right Column: Aspirant Dossier Metadata */}
              <div className="md:col-span-8 flex flex-col justify-between h-full space-y-5">
                <div>
                  {/* Status Badges & Quick Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {isGuest && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          Guest Account
                        </span>
                      )}
                      {isGoogle && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-muted border border-border/80 text-foreground font-semibold">
                          <GoogleIcon /> Google Verified
                        </span>
                      )}
                      {isEmail && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-muted border border-border/80 text-foreground font-semibold">
                          <Mail className="h-3.5 w-3.5 text-primary" /> Email Account
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold">
                        <Target className="h-3 w-3" /> {profile.target_category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-muted/60 border border-border/80 text-muted-foreground font-semibold">
                        🔥 {streak}d streak
                      </span>
                    </div>

                    {/* Top Action: Link Cloud or Sign Out */}
                    <div>
                      {isGuest ? (
                        <Button
                          onClick={() => setUpgradeModalOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold tracking-wide shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-sky-400" />
                          <span>Link Cloud</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setShowSignOutModal(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-border/80 text-xs font-mono font-semibold hover:text-destructive"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Aspirant Name */}
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight mb-1">
                    {profile.display_name}
                    <span className="font-serif italic font-normal text-muted-foreground text-xl sm:text-2xl ml-2 block sm:inline">
                      — Academic Candidate
                    </span>
                  </h1>

                  {/* Candidate Cataloging Date */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-muted-foreground mt-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>Aspirant cataloged since <strong className="text-foreground font-semibold">{joinDate}</strong></span>
                    </span>
                    {user?.email && (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{user.email}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Academic Tip / Focus Banner */}
                <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-serif font-bold">Bookie Codex:</span>
                    <span>Daily reset activates strictly at 3:00 AM IST to safeguard midnight study sprints.</span>
                  </div>
                  <Link to="/ypt" className="text-primary hover:underline font-mono text-[11px] shrink-0 hidden sm:inline">
                    Carrel Desk →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ───── 2. PERFORMANCE LEDGER (Stitch Screen 13) ───── */}
          <section className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/80 gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-[10px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-300 font-semibold mb-2">
                  <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>DAILY STUDY METRIC // CANDIDATE TELEMETRY</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
                  Today’s Study Performance
                </h2>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Measured live across YPT study sessions, desk stopwatches, and active timers
                </p>
              </div>
              <Link
                to="/ypt?tab=stats"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 border border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 px-3.5 py-2 rounded-xl transition self-start sm:self-auto"
              >
                <span>View Full Stats</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4 Telemetry Metrics Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
              {/* Tile 1: Today Studied */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 transition hover:border-amber-500/35">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-300 font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>TODAY STUDIED</span>
                </div>
                <div className="text-3xl font-mono font-bold text-foreground mt-2">
                  {todayHoursNumeric}<span className="text-lg font-serif italic font-normal text-muted-foreground">h</span>
                </div>
                <div className="text-xs text-muted-foreground font-sans mt-1">
                  {todaySessionsCount} session{todaySessionsCount !== 1 ? "s" : ""} logged today
                </div>
              </div>

              {/* Tile 2: Study Streak */}
              <div className="bg-card border border-border/80 rounded-xl p-4 transition hover:border-border">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  <span>🔥</span>
                  <span>STUDY STREAK</span>
                </div>
                <div className="text-3xl font-mono font-bold text-foreground mt-2">
                  {streak} <span className="text-lg font-serif italic font-normal text-muted-foreground">days</span>
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-sans font-medium mt-1 flex items-center gap-1">
                  <span>🔥</span> {streak > 0 ? "Active streak recorded" : "Start streak today"}
                </div>
              </div>

              {/* Tile 3: Daily Goal */}
              <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4 transition hover:border-sky-500/35">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-sky-800 dark:text-sky-300 font-semibold mb-1">
                  <Target className="w-3.5 h-3.5 text-sky-600" />
                  <span>DAILY GOAL ({dailyTargetHours}H)</span>
                </div>
                <div className="text-3xl font-mono font-bold text-foreground mt-2">
                  {targetPercent}<span className="text-lg font-mono font-normal text-muted-foreground">%</span>
                </div>
                <div className="text-xs text-muted-foreground font-sans mt-1">
                  {todayHoursNumeric}h of {dailyTargetHours}h completed
                </div>
              </div>

              {/* Tile 4: Total Hours */}
              <div className="bg-card border border-border/80 rounded-xl p-4 transition hover:border-border">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  <span>⏳</span>
                  <span>TOTAL HOURS</span>
                </div>
                <div className="text-3xl font-mono font-bold text-foreground mt-2">
                  {totalHoursNumeric}<span className="text-lg font-serif italic font-normal text-muted-foreground">h</span>
                </div>
                <div className="text-xs text-muted-foreground font-sans mt-1">
                  All-time Bookie focus time
                </div>
              </div>
            </div>

            {/* Daily 6-Hour Target Progress Gauge */}
            <div className="pt-4 border-t border-border/70">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                  <span className="font-semibold text-foreground">Daily 6-Hour Target Progress</span>
                  <span className="font-normal">
                    • {targetPercent >= 100 ? "Goal Fulfilled" : `${Math.max(0, dailyTargetHours - (todaySeconds / 3600)).toFixed(1)}h remaining`}
                  </span>
                </div>
                <div className="font-bold text-foreground">
                  {targetPercent}% <span className="font-normal text-muted-foreground">({todayHoursNumeric}h / {dailyTargetHours}h)</span>
                </div>
              </div>
              <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-border/80">
                <div
                  className="bg-gradient-to-r from-primary to-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, Math.min(100, targetPercent))}%` }}
                />
              </div>
            </div>
          </section>

          {/* ───── 3. UPGRADE BANNER (FOR GUESTS) (Stitch Screen 13) ───── */}
          {isGuest && (
            <section className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-primary to-slate-900"></div>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex-shrink-0 flex items-center justify-center text-amber-600 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold">
                      ⚡ GUEST MODE ACTIVE
                    </span>
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      100% Free • Saved Data is Safe
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-serif font-bold text-foreground tracking-tight">
                      Upgrade Account <span className="font-serif italic font-normal text-primary">(Zero Data Loss)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      You are currently using a guest device account. Everything is saved locally. Upgrade to a permanent account with Google or email so your study sessions <strong className="text-foreground font-mono">({todayFormatted.formatted})</strong>, streak <strong className="text-foreground font-mono">({streak}d)</strong>, and syllabus bookmarks follow you across all your devices seamlessly.
                    </p>
                  </div>

                  {/* 4 Pillars Checkmarks Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground pt-1 font-sans">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong className="text-foreground font-semibold">100% Free:</strong> Timers, tests, notes & stats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong className="text-foreground font-semibold">Custom Identity:</strong> Free avatar photo & name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong className="text-foreground font-semibold">Zero Data Loss:</strong> Streaks & sessions saved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong className="text-foreground font-semibold">Optional Cloud:</strong> Sync phone, tab & laptop</span>
                    </div>
                  </div>

                  {/* Upgrade Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      onClick={handleUpgradeToGoogle}
                      disabled={upgrading}
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold tracking-wide shadow-xs transition"
                    >
                      {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                      <span>Upgrade with Google</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEmailUpgrade(true)}
                      disabled={upgrading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-border/80 text-foreground text-xs font-semibold tracking-wide shadow-xs"
                    >
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>Upgrade with Email</span>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {isEmail && (
            <section className="bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-muted border border-border/80 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Link Google Account
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    You are signed in via Email. Link your Google account to enable instant one-click login and automated profile picture sync. Your study hours, streak, and history remain 100% intact.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <Button
                  onClick={handleLinkGoogle}
                  disabled={upgrading}
                  className="bg-slate-900 hover:bg-black text-white font-sans font-semibold text-xs h-10 px-5 rounded-xl shadow-xs"
                >
                  {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GoogleIcon />}
                  <span className="ml-2">Link Google Account</span>
                </Button>
              </div>
            </section>
          )}

          {/* ───── 4. PROFILE SETTINGS & NAVIGATION (Stitch Screen 13) ───── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Profile Dossier Settings (7 Cols) */}
            <section className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Profile Settings</h3>
                  <p className="text-xs text-muted-foreground">Update your public aspirant identity and target focus</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-muted/60 border border-border/80 px-2 py-0.5 rounded text-muted-foreground font-semibold">
                  Editable
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {/* Display Name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    DISPLAY NAME
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={30}
                    placeholder="Candidate Name"
                    className="h-10 border-border/80 text-sm rounded-xl focus:border-primary"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Visible to cohort peers in carrels and leaderboard telemetry.
                  </span>
                </div>

                {/* Target Exam Category */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    TARGET EXAM & YEAR
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TARGET_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTarget(c)}
                        className={cn(
                          "h-10 px-2 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center",
                          target === c
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : "border-border/80 bg-background hover:bg-muted/60 text-foreground"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save CTA */}
                <div className="pt-3 flex flex-wrap gap-2.5">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-10 px-5 bg-primary text-primary-foreground font-sans font-semibold text-xs rounded-xl shadow-xs hover:bg-primary/90"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                  {!isAuthenticated && (
                    <Button
                      variant="outline"
                      onClick={() => setUpgradeModalOpen(true)}
                      className="h-10 px-4 font-sans font-semibold text-xs border-border/80 rounded-xl"
                    >
                      <Zap className="h-4 w-4 mr-1.5 text-primary" /> Upgrade with Google
                    </Button>
                  )}
                </div>
              </div>
            </section>

            {/* Right: Quick Portals & Trackers (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
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

          {/* ───── 5. DANGER ZONE: DATA DELETION (Screen 13) ───── */}
          <section className="border border-destructive/30 bg-destructive/5 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-destructive/15 text-destructive border border-destructive/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-foreground">
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
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-sans font-semibold text-xs h-10 px-5 rounded-xl shadow-xs cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Permanently Delete All My Data
              </Button>
            </div>
          </section>
        </div>

        <UpgradeModal
          isOpen={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          feature="profile"
        />
      </div>

      {/* ───── MODAL: UPGRADE WITH EMAIL ───── */}
      <Dialog open={showEmailUpgrade} onOpenChange={setShowEmailUpgrade}>
        <DialogContent className="max-w-md border border-border/80 bg-card rounded-2xl shadow-floating p-6">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl flex items-center gap-2 text-foreground">
              <Mail className="h-5 w-5 text-primary" /> Upgrade with Email
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-muted-foreground">
              Your existing guest study hours ({todayFormatted.formatted}), streak ({streak}d), and settings will be preserved completely.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpgradeToEmail} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="name@example.com"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                className="mt-1 h-10 border-border/80 text-sm rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Create Password
              </label>
              <Input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={upgradePassword}
                onChange={(e) => setUpgradePassword(e.target.value)}
                className="mt-1 h-10 border-border/80 text-sm rounded-xl"
              />
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-border/80">
              <Button type="button" variant="outline" onClick={() => setShowEmailUpgrade(false)} className="h-10 rounded-xl border-border/80">
                Cancel
              </Button>
              <Button type="submit" disabled={upgrading} className="h-10 bg-primary text-primary-foreground font-semibold rounded-xl shadow-xs">
                {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Upgrade Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───── MODAL: SIGN OUT CONFIRMATION ───── */}
      <AlertDialog open={showSignOutModal} onOpenChange={setShowSignOutModal}>
        <AlertDialogContent className="border border-border/80 rounded-2xl bg-card shadow-floating max-w-md p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-1 text-foreground">
              <LogOut className="h-5 w-5 text-primary" />
              <AlertDialogTitle className="font-serif font-bold text-xl">
                Log Out of Bookie?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs font-mono text-muted-foreground leading-relaxed">
              You will be signed out of your account on this device. Your study streak ({streak}d), logs, and progress are saved in the cloud and will be available whenever you log back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-3 border-t border-border/80">
            <AlertDialogCancel className="h-10 font-mono font-medium rounded-xl border-border/80">Stay Logged In</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="h-10 font-mono font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ───── MODAL: PERMANENT DATA DELETION ───── */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="border border-destructive/40 rounded-2xl bg-card shadow-floating max-w-lg p-6 sm:p-7">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-destructive mb-1">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <AlertDialogTitle className="font-serif font-bold text-xl sm:text-2xl text-destructive">
                Permanent Data Deletion Warning
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3 pt-2 text-xs font-mono text-foreground leading-relaxed">
              <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-foreground space-y-1">
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
                  className="h-10 border-destructive/60 font-mono text-sm tracking-wider uppercase rounded-xl"
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 pt-3 border-t border-border/80">
            <AlertDialogCancel disabled={deleting} className="h-10 font-mono font-medium rounded-xl border-border/80">
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteEverything}
              disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || deleting}
              className="h-10 font-mono font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50 rounded-xl shadow-xs"
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
    <Card className="border border-border/80 bg-card p-5 shadow-xs rounded-xl hover:border-primary/40 transition-colors">
      <div className="h-9 w-9 rounded-lg border border-border/80 bg-muted/60 text-primary flex items-center justify-center mb-2.5">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-serif font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-sans">{desc}</p>
      <button onClick={onClick} className="mt-3 text-xs font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
        <span>{cta}</span> →
      </button>
    </Card>
  );
}