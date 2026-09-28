import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ArrowRight, UserCircle2, Mail, Lock, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import logo from "@/assets/logo.jfif";
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

  // Only auto-redirect authenticated users away from /welcome.
  // Guests stay so they can upgrade to a real account, and signed-out users see sign-in options.
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
      } else {
        // Successful login will be handled by the useEffect above
      }
    }
    setBusy(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10 bg-background blueprint-grid text-on-surface">
      <div className="relative w-full max-w-md z-10">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="BOOKIE" className="h-12 w-12 rounded-xl border-2 border-on-surface shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]" />
          <span className="font-headline-xl text-3xl font-black tracking-tight text-on-surface">
            BOOKIE<span className="text-primary">.</span>
          </span>
        </Link>

        <div className="rounded-2xl border-2 border-on-surface bg-surface-container-lowest p-7 md:p-8 shadow-[8px_8px_0px_0px_rgba(19,27,46,1)] relative overflow-hidden transition-all duration-300">
          {mode === 'main' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-on-surface bg-secondary-container text-[11px] font-label-code-sm uppercase tracking-wider font-bold text-on-secondary-container shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                  <Sparkles className="h-3 w-3" /> Welcome
                </span>
                <h1 className="mt-4 font-headline-xl text-3xl font-black tracking-tight text-on-surface">
                  Step into Bookie
                </h1>
                <p className="mt-2 text-sm font-body-md font-medium text-on-surface-variant">
                  Pick how you'd like to continue.
                </p>
              </div>

              <div className="space-y-4">
                  <div className="relative">
                    <button
                      onClick={handleGoogle}
                      disabled={busy === "google"}
                      className="w-full inline-flex items-center justify-center gap-3 px-5 h-14 rounded-xl border-2 border-on-surface bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-md font-bold text-base transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] disabled:opacity-50 disabled:shadow-none cursor-pointer"
                    >
                      {busy === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                      <span>Continue with Google</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setMode('email-login')}
                    className="w-full inline-flex items-center justify-center gap-3 h-12 rounded-xl border-2 border-on-surface bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-md font-bold text-sm transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]"
                  >
                    <Mail className="h-4 w-4" />
                    Continue with Email
                  </button>

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-on-surface border-dashed" /></div>
                    <div className="relative flex justify-center text-[10px] font-label-code-sm font-bold uppercase tracking-wider text-on-surface-variant">
                      <span className="px-3 bg-surface-container-lowest">or quick test</span>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleGuest}
                      className="w-full inline-flex items-center justify-center gap-3 h-12 rounded-xl border-2 border-on-surface bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface font-headline-md font-bold text-sm transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      Continue as Guest (Local Only)
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </button>
                    <p className="text-[10px] text-on-surface-variant/80 font-mono text-center mt-1.5 leading-snug">
                      🔒 Guest: Local browser data only. Community posting &amp; multi-device sync require Google.
                    </p>
                  </div>

                  <p className="text-[11px] font-body-sm font-medium text-on-surface-variant text-center pt-1 leading-relaxed">
                    By continuing you agree to Bookie's <Link to="/privacy-policy" className="underline hover:text-on-surface font-bold">Privacy</Link> & <Link to="/copyright-terms" className="underline hover:text-on-surface font-bold">Terms</Link>.
                  </p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <button 
                onClick={() => {
                  setMode('main');
                  setEmail('');
                  setPassword('');
                }}
                className="absolute top-5 left-5 h-8 w-8 rounded-full border-2 border-on-surface bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="text-center mb-8 mt-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl border-2 border-on-surface bg-primary-container shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] mb-4">
                  <Mail className="h-6 w-6 text-on-primary-container" />
                </div>
                <h2 className="font-headline-xl text-2xl font-black tracking-tight text-on-surface">
                  {mode === 'email-login' ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="mt-2 text-sm font-body-md font-medium text-on-surface-variant">
                  {mode === 'email-login' ? 'Enter your details to sign in.' : 'Enter your details to get started.'}
                </p>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                    <input 
                      type="email" 
                      placeholder="Email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-on-surface bg-surface-container-low text-on-surface text-sm font-body-md font-medium focus:outline-none focus:border-primary shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] transition-all"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-on-surface bg-surface-container-low text-on-surface text-sm font-body-md font-medium focus:outline-none focus:border-primary shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy === "email"}
                  className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-on-surface bg-primary text-on-primary font-headline-md font-bold text-base transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] disabled:opacity-50 disabled:shadow-none mt-2"
                >
                  {busy === "email" ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {mode === 'email-login' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <div className="mt-8 text-center text-sm font-body-md font-medium">
                <span className="text-on-surface-variant">
                  {mode === 'email-login' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  onClick={() => setMode(mode === 'email-login' ? 'email-register' : 'email-login')}
                  className="font-bold text-primary hover:text-primary-hover underline decoration-2 underline-offset-2 transition-colors ml-1"
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