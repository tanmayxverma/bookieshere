import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Loader2, UserCircle2, Mail, Lock, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { BookieEmblem } from "@/components/Brand/BookieEmblem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12 bg-academic-grid text-foreground">
      <div className="relative w-full max-w-md z-10">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <BookieEmblem size={38} className="transition-transform group-hover:scale-105" />
          <div className="flex items-baseline">
            <span className="font-serif tracking-tight text-3xl font-bold text-foreground">BOOKIE</span>
            <span className="text-[10px] font-mono text-primary font-bold ml-0.5">®</span>
          </div>
        </Link>

        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {mode === 'main' ? (
            <div className="animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[10px] font-mono uppercase tracking-wider font-semibold text-primary">
                  <Zap className="h-3 w-3 text-primary" /> ASPIRANT DISPATCH GATE
                </span>
                <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground">
                  Step into Bookie
                </h1>
                <p className="mt-1.5 text-xs font-sans text-muted-foreground">
                  Choose your scholar passport to enter focus carrels.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoogle}
                  disabled={busy === "google"}
                  className="w-full inline-flex items-center justify-center gap-3 px-5 h-12 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground font-sans font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => setMode('email-login')}
                  className="w-full inline-flex items-center justify-center gap-2.5 h-12 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground font-sans font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Continue with Email</span>
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/70" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span className="px-3 bg-card font-semibold">or instant guest entry</span>
                  </div>
                </div>

                <button
                  onClick={handleGuest}
                  className="w-full inline-flex items-center justify-center gap-2.5 h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-sans font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <UserCircle2 className="h-4 w-4 text-sky-400" />
                  <span>Enter as Guest Aspirant</span>
                </button>

                <p className="text-[11px] font-sans text-muted-foreground text-center pt-3 leading-relaxed">
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
                className="absolute top-5 left-5 h-8 w-8 rounded-lg border border-border/80 bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="text-center mb-6 mt-4">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-primary/20 bg-primary/10 shadow-xs mb-3">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                  {mode === 'email-login' ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p className="mt-1 text-xs font-sans text-muted-foreground">
                  {mode === 'email-login' ? 'Enter credentials to access your study carrel.' : 'Enter details to start tracking progress.'}
                </p>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="Email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border-border/80 text-xs font-sans"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border-border/80 text-xs font-sans"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={busy === "email"}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-sans font-semibold text-xs shadow-xs"
                >
                  {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  <span>{mode === 'email-login' ? 'Sign in to Carrel' : 'Create Account'}</span>
                </Button>
              </form>

              <div className="mt-6 text-center text-xs font-sans text-muted-foreground">
                <span>
                  {mode === 'email-login' ? "Don't have an account? " : "Already registered? "}
                </span>
                <button 
                  onClick={() => setMode(mode === 'email-login' ? 'email-register' : 'email-login')}
                  className="font-semibold text-primary hover:underline ml-1"
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