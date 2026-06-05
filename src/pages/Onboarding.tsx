import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useProfile, TARGET_CATEGORIES, type TargetCategory } from "@/hooks/useProfile";
import { AvatarUploader } from "@/components/Profile/AvatarUploader";
import { validateName } from "@/types/ypt";
import logo from "@/assets/logo.jfif";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, isAuthenticated, isOnboarded, saveProfile, deviceId } = useProfile();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [target, setTarget] = useState<TargetCategory>("JEE 2027");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Hydrate from existing profile (Google etc.)
  useEffect(() => {
    if (profile && !isOnboarded) {
      setName(profile.display_name && profile.display_name !== "Aspirant" ? profile.display_name : "");
      setTarget((profile.target_category as TargetCategory) || "JEE 2027");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile, isOnboarded]);

  // If already onboarded, bounce home
  useEffect(() => {
    if (!loading && profile && isOnboarded) navigate("/", { replace: true });
  }, [loading, profile, isOnboarded, navigate]);

  const next = () => {
    if (step === 1) {
      const err = validateName(name);
      if (err) { toast({ variant: "destructive", title: err }); return; }
    }
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const finish = async () => {
    const err = validateName(name);
    if (err) { toast({ variant: "destructive", title: err }); setStep(1); return; }
    setBusy(true);
    const { error } = await saveProfile({
      display_name: name.trim(),
      target_category: target,
      avatar_url: avatarUrl,
    });
    setBusy(false);
    if (error) {
      toast({ variant: "destructive", title: "Could not save", description: String((error as any).message ?? error) });
      return;
    }
    toast({ title: `Welcome, ${name.trim().split(" ")[0]}` });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div aria-hidden className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-primary/15 blur-[140px]" />
      <div aria-hidden className="absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary/10 blur-[140px]" />

      <div className="relative w-full max-w-lg">
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <img src={logo} alt="BOOKIE" className="h-9 w-9 rounded-xl ring-1 ring-border/60" />
          <span className="font-display text-xl font-black tracking-tight">BOOKIE<span className="text-primary">.</span></span>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-2xl p-7 md:p-8 shadow-[0_40px_80px_-30px_hsl(var(--primary)/0.35)]">
          {/* Stepper */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border/50"}`} />
            ))}
          </div>

          <div className="text-center mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-surface-2/60 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Step {step} of 3
            </span>
            <h1 className="mt-3 font-display text-[26px] font-bold tracking-tight">
              {step === 1 && "What should we call you?"}
              {step === 2 && "Pick your target"}
              {step === 3 && "Add a profile picture"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {step === 1 && "This name shows up across Bookie and on leaderboards."}
              {step === 2 && "Helps us tailor your study experience."}
              {step === 3 && "Optional — you can change this anytime."}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun Sharma" maxLength={30} className="h-12 text-base" autoFocus />
              <Button onClick={next} disabled={!name.trim()} className="w-full h-11">Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {TARGET_CATEGORIES.map((cat) => {
                  const active = target === cat;
                  return (
                    <button key={cat} onClick={() => setTarget(cat)}
                      className={`relative h-12 px-3 rounded-xl border text-sm font-semibold transition-all ${active ? "border-primary bg-primary/10 text-foreground" : "border-border/60 bg-background hover:border-primary/40"}`}>
                      {cat}
                      {active && <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={back} className="flex-1 h-11">Back</Button>
                <Button onClick={next} className="flex-1 h-11">Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex justify-center">
                <AvatarUploader
                  avatarUrl={avatarUrl}
                  displayName={name || profile?.display_name || "A"}
                  onChange={setAvatarUrl}
                  ownerId={isAuthenticated ? undefined : `guest/${deviceId}`}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={back} className="flex-1 h-11">Back</Button>
                <Button onClick={finish} disabled={busy} className="flex-1 h-11">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finish & Enter Bookie"}
                </Button>
              </div>
              <button onClick={finish} className="block mx-auto text-xs text-muted-foreground hover:text-foreground">Skip for now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}