import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Loader2, UserCircle2, Mail, Lock, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.6 2.4 2.2 6.8 2.2 12.1s4.4 9.7 9.8 9.7c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.5H12z"/>
  </svg>
);

export default function Welcome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithGoogle, signIn, signUp } = useAuth();
  const { profile, isOnboarded, loading, isAuthenticated } = useProfile();
  
  const [busy, setBusy] = useState<string | null>(null);
  const [mode, setMode] = useState<'main' | 'email-login' | 'email-register'>('main');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;
    if (profile && isOnboarded) navigate("/", { replace: true });
    else if (profile && !isOnboarded) navigate("/onboarding", { replace: true });
  }, [loading, profile, isOnboarded, isAuthenticated, navigate]);

  const handleGuest = () => navigate("/onboarding");

  const handleGoogle = async () => {
    setBusy("google");
    const r = await signInWithGoogle();
    if (r.error) {
      setBusy(null);
      toast({ variant: "destructive", title: "Google sign-in failed", description: String(r.error?.message || r.error) });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please enter both email and password." });
      return;
    }
    setBusy("email");
    
    if (mode === 'email-register') {
      const r = await signUp(email, password);
      if (r.error) {
        toast({ variant: "destructive", title: "Sign up failed", description: String(r.error?.message || r.error) });
      } else {
        toast({ title: "Check your email", description: "We sent you a confirmation link to complete your registration." });
        setMode('main');
        setEmail('');
        setPassword('');
      }
    } else {
      const r = await signIn(email, password);
      if (r.error) {
        toast({ variant: "destructive", title: "Sign in failed", description: String(r.error?.message || r.error) });
      }
    }
    setBusy(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10 bg-background text-foreground">
      <div className="relative w-full max-w-md z-10">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img
            src={logo}
            alt="BOOKIE"
            className="h-11 w-11 rounded-xl border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] object-cover"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <span className="font-display text-2xl font-black tracking-tight text-foreground">
            BOOKIE<span className="text-primary">.</span>
          </span>
        </Link>

        <div className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-[6px_6px_0px_var(--desk-border)] relative overflow-hidden">
          {mode === 'main' ? (
            <div className="animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border bg-muted text-[10px] font-mono uppercase tracking-wider font-bold text-foreground">
                  <Zap className="h-3 w-3 text-primary" /> ASPIRANT DISPATCH GATE
                </span>
                <h1 className="mt-3 font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Step into Bookie
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm font-sans text-muted-foreground">
                  Pick how you'd like to continue studying.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoogle}
                  disabled={busy === "google"}
                  className="w-full inline-flex items-center justify-center gap-3 px-5 h-12 rounded-xl border-2 border-border bg-card hover:bg-muted text-foreground font-sans font-bold text-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_var(--desk-border)] disabled:opacity-50 cursor-pointer"
                >
                  {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => setMode('email-login')}
                  className="w-full inline-flex items-center justify-center gap-2.5 h-12 rounded-xl border-2 border-border bg-card hover:bg-muted text-foreground font-sans font-bold text-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_var(--desk-border)]"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Continue with Email</span>
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="px-3 bg-card">or fast guest entry</span>
                  </div>
                </div>

                <button
                  onClick={handleGuest}
                  className="w-full inline-flex items-center justify-center gap-2.5 h-12 rounded-xl border-2 border-border bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-bold text-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_var(--desk-border)] cursor-pointer"
                >
                  <UserCircle2 className="h-4 w-4" />
                  <span>Enter as Guest Aspirant</span>
                </button>

                <p className="text-[11px] font-mono text-muted-foreground text-center pt-2 leading-relaxed">
                  By continuing you agree to Bookie's{" "}
                  <Link to="/privacy-policy" className="underline hover:text-foreground">
                    Privacy
                  </Link>{" "}
                  &{" "}
                  <Link to="/copyright-terms" className="underline hover:text-foreground">
                    Terms
                  </Link>.
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-200">
              <button 
                onClick={() => {
                  setMode('main');
                  setEmail('');
                  setPassword('');
                }}
                className="absolute top-5 left-5 h-8 w-8 rounded-lg border-2 border-border bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="text-center mb-6 mt-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border-2 border-border bg-muted shadow-[2px_2px_0px_var(--desk-border)] mb-3">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
                  {mode === 'email-login' ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="mt-1 text-xs font-sans text-muted-foreground">
                  {mode === 'email-login' ? 'Enter credentials to access your study carrel.' : 'Enter details to start tracking progress.'}
                </p>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      placeholder="Email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-border bg-background text-foreground text-xs font-sans focus:outline-none focus:border-primary shadow-[2px_2px_0px_var(--desk-border)] transition-all"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-border bg-background text-foreground text-xs font-sans focus:outline-none focus:border-primary shadow-[2px_2px_0px_var(--desk-border)] transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy === "email"}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-border bg-primary text-primary-foreground font-sans font-bold text-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_var(--desk-border)] disabled:opacity-50 mt-1"
                >
                  {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span>{mode === 'email-login' ? 'Sign in to Carrel' : 'Create Account'}</span>
                </button>
              </form>

              <div className="mt-6 text-center text-xs font-sans text-muted-foreground">
                <span>
                  {mode === 'email-login' ? "Don't have an account? " : "Already registered? "}
                </span>
                <button 
                  onClick={() => setMode(mode === 'email-login' ? 'email-register' : 'email-login')}
                  className="font-bold text-primary hover:underline ml-1"
                >
                  {mode === 'email-login' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}