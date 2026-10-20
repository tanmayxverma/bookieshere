import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash || "";
    setRecovery(hash.includes("type=recovery") || hash.includes("access_token"));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async () => {
    if (pw.length < 8) { toast({ variant: "destructive", title: "Password must be at least 8 characters" }); return; }
    if (pw !== pw2) { toast({ variant: "destructive", title: "Passwords don't match" }); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast({ variant: "destructive", title: "Reset failed", description: error.message }); return; }
    toast({ title: "Password updated" });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div aria-hidden className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-primary/15 blur-[140px]" />
      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <img
            src={logo}
            alt="BOOKIE"
            className="h-9 w-9 rounded-xl ring-1 ring-border/60 object-cover"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <span className="font-display text-xl font-black tracking-tight">BOOKIE<span className="text-primary">.</span></span>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-2xl p-7 md:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-center">Set a new password</h1>
          <p className="text-sm text-muted-foreground text-center mt-1.5">
            {recovery ? "Choose a strong password to keep your account safe." : "Open the reset link from your email to continue."}
          </p>
          <div className="space-y-3 mt-6">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="pl-10 h-11" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Confirm password" className="pl-10 h-11" />
            </div>
            <Button onClick={submit} disabled={busy || !recovery} className="w-full h-11">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}