import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Sparkles, Mail, Lock, Loader2, ArrowRight, UserCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import logo from "@/assets/logo.jfif";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type Mode = "choice" | "email" | "forgot";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.6 2.4 2.2 6.8 2.2 12.1s4.4 9.7 9.8 9.7c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.5H12z"/>
  </svg>
);

export default function Welcome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const { profile, isOnboarded, loading, isAuthenticated } = useProfile();

  const [mode, setMode] = useState<Mode>("choice");
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");

  // If already onboarded, leave the welcome page.
  useEffect(() => {
    if (loading) return;
    if (profile && isOnboarded) navigate("/", { replace: true });
    else if (profile && !isOnboarded) navigate("/onboarding", { replace: true });
  }, [loading, profile, isOnboarded, navigate]);

  const handleGuest = () => navigate("/onboarding");

  const handleGoogle = async () => {
    setBusy("google");
    setErr("");
    const r = await signInWithGoogle();
    if (r.error) {
      setBusy(null);
      toast({ variant: "destructive", title: "Google sign-in failed", description: String(r.error?.message || r.error) });
    }
    // if redirected, browser navigates away
  };

  const handleEmail = async () => {
    setErr("");
    const parsed = emailSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErr(parsed.error.errors[0].message);
      return;
    }
    setBusy(authTab);
    const fn = authTab === "signin" ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setBusy(null);
    if (error) {
      toast({ variant: "destructive", title: `${authTab === "signin" ? "Sign in" : "Sign up"} failed`, description: error.message });
      return;
    }
    if (authTab === "signup") {
      toast({ title: "Check your email", description: "Confirm your address to finish creating your account." });
    } else {
      toast({ title: "Welcome back!" });
    }
  };

  const handleForgot = async () => {
    if (!email) { setErr("Enter your email"); return; }
    setBusy("forgot");
    const { error } = await resetPassword(email.trim());
    setBusy(null);
    if (error) toast({ variant: "destructive", title: "Reset failed", description: error.message });
    else { toast({ title: "Reset link sent", description: "Check your inbox." }); setMode("email"); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Ambient */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(circle_at_85%_85%,hsl(var(--primary)/0.10),transparent_55%)]" />
      <div aria-hidden className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-primary/15 blur-[140px]" />
      <div aria-hidden className="absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary/10 blur-[140px]" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <img src={logo} alt="BOOKIE" className="h-10 w-10 rounded-xl ring-1 ring-border/60" />
          <span className="font-display text-2xl font-black tracking-tight">
            BOOKIE<span className="text-primary">.</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-2xl p-7 md:p-8 shadow-[0_40px_80px_-30px_hsl(var(--primary)/0.35)]">
          <div className="text-center mb-7">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-surface-2/60 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Welcome
            </span>
            <h1 className="mt-3 font-display text-2xl md:text-[28px] font-bold tracking-tight">
              {mode === "choice" && "Step into Bookie"}
              {mode === "email" && (authTab === "signin" ? "Sign in to Bookie" : "Create your account")}
              {mode === "forgot" && "Reset your password"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "choice" && "Pick how you'd like to continue."}
              {mode === "email" && "Use your email and password."}
              {mode === "forgot" && "We'll email you a reset link."}
            </p>
          </div>

          {mode === "choice" && (
            <div className="space-y-3">
              <button
                onClick={handleGoogle}
                disabled={busy === "google"}
                className="w-full inline-flex items-center justify-center gap-3 h-12 rounded-xl border border-border/60 bg-background hover:bg-surface-2 text-foreground font-semibold transition-all active:scale-[0.99]"
              >
                {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              <button
                onClick={() => setMode("email")}
                className="w-full inline-flex items-center justify-center gap-3 h-12 rounded-xl border border-border/60 bg-background hover:bg-surface-2 text-foreground font-semibold transition-all active:scale-[0.99]"
              >
                <Mail className="h-4 w-4" />
                Continue with Email
              </button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/40" /></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="px-2 bg-card/70">or</span>
                </div>
              </div>

              <button
                onClick={handleGuest}
                className="w-full inline-flex items-center justify-center gap-3 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold transition-all active:scale-[0.99]"
              >
                <UserCircle2 className="h-4 w-4" />
                Continue as Guest
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-[11px] text-muted-foreground/80 text-center pt-3 leading-relaxed">
                By continuing you agree to Bookie's <Link to="/privacy-policy" className="underline hover:text-foreground">Privacy</Link> & <Link to="/copyright-terms" className="underline hover:text-foreground">Terms</Link>.
              </p>
            </div>
          )}

          {mode === "email" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 rounded-lg border border-border/50 p-1 bg-surface-2/40">
                {(["signin", "signup"] as const).map((t) => (
                  <button key={t}
                    onClick={() => { setAuthTab(t); setErr(""); }}
                    className={`h-9 rounded-md text-sm font-semibold transition-colors ${authTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {t === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="pl-10 h-11" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10 h-11" />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {err && <p className="text-xs text-destructive">{err}</p>}
              </div>

              <Button onClick={handleEmail} disabled={!!busy} className="w-full h-11">
                {busy === authTab ? <Loader2 className="h-4 w-4 animate-spin" /> : (authTab === "signin" ? "Sign In" : "Create Account")}
              </Button>

              <div className="flex items-center justify-between text-xs">
                <button onClick={() => setMode("choice")} className="text-muted-foreground hover:text-foreground">← Back</button>
                <button onClick={() => setMode("forgot")} className="text-muted-foreground hover:text-foreground">Forgot password?</button>
              </div>
            </div>
          )}

          {mode === "forgot" && (
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="pl-10 h-11" />
              </div>
              {err && <p className="text-xs text-destructive">{err}</p>}
              <Button onClick={handleForgot} disabled={!!busy} className="w-full h-11">
                {busy === "forgot" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
              </Button>
              <button onClick={() => setMode("email")} className="block mx-auto text-xs text-muted-foreground hover:text-foreground">← Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}