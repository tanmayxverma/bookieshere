import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookieEmblem } from "@/components/Brand/BookieEmblem";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-academic-grid text-foreground">
      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <BookieEmblem size={34} />
          <div className="flex items-baseline">
            <span className="font-serif tracking-tight text-2xl font-bold text-foreground">BOOKIE</span>
            <span className="text-[10px] font-mono text-primary font-bold ml-0.5">®</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-center text-foreground">
            Set New Password
          </h1>
          <p className="text-xs text-muted-foreground text-center mt-1 font-sans">
            {recovery ? "Choose a strong password to secure your aspirant account." : "Open the reset link from your email to continue."}
          </p>
          <div className="space-y-3 mt-6">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="pl-10 h-10 border-border/80 text-xs rounded-xl"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="Confirm password"
                className="pl-10 h-10 border-border/80 text-xs rounded-xl"
              />
            </div>
            <Button
              onClick={submit}
              disabled={busy || !recovery}
              className="w-full h-11 bg-primary text-primary-foreground font-sans font-semibold text-xs rounded-xl shadow-xs mt-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              <span>Update Password</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}