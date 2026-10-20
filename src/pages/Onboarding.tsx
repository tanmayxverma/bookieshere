import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useProfile, TARGET_CATEGORIES, type TargetCategory } from "@/hooks/useProfile";
import { AvatarUploader } from "@/components/Profile/AvatarUploader";
import { validateName } from "@/types/ypt";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, isAuthenticated, isOnboarded, saveProfile, deviceId, googleAvatar } = useProfile();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [target, setTarget] = useState<TargetCategory>("JEE 2027");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarCustomized, setAvatarCustomized] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile && !isOnboarded) {
      setName(profile.display_name && profile.display_name !== "Aspirant" ? profile.display_name : "");
      setTarget((profile.target_category as TargetCategory) || "JEE 2027");
      const defaultAvatar = profile.avatar_url || googleAvatar || null;
      setAvatarUrl(defaultAvatar);
      setAvatarCustomized(!!profile.avatar_customized);
    }
  }, [profile, isOnboarded, googleAvatar]);

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
      avatar_customized: avatarCustomized,
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background text-foreground">
      <div className="relative w-full max-w-lg">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <img
            src={logo}
            alt="BOOKIE"
            className="h-10 w-10 rounded-xl border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] object-cover"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <span className="font-display text-2xl font-black tracking-tight text-foreground">
            BOOKIE<span className="text-primary">.</span>
          </span>
        </div>

        <div className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-[6px_6px_0px_var(--desk-border)]">
          {/* Stepper */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-2 rounded-full border border-border transition-colors",
                  i <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-border bg-muted font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" /> Step {step} of 3
            </span>
            <h1 className="mt-3 font-display text-2xl font-black tracking-tight text-foreground">
              {step === 1 && "What should we call you?"}
              {step === 2 && "Pick your target exam"}
              {step === 3 && "Aspirant avatar photo"}
            </h1>
            <p className="mt-1 text-xs font-sans text-muted-foreground">
              {step === 1 && "This name shows up across study carrels and leaderboards."}
              {step === 2 && "Calibrates chapter syllabus and exam countdowns."}
              {step === 3 && "Optional — you can change or update this anytime."}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                maxLength={30}
                className="h-11 text-sm border-2 border-border font-sans"
                autoFocus
              />
              <Button
                onClick={next}
                disabled={!name.trim()}
                className="w-full h-11 btn-desk-primary"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {TARGET_CATEGORIES.map((cat) => {
                  const active = target === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTarget(cat)}
                      className={cn(
                        "relative h-11 px-3 rounded-xl border-2 text-xs font-mono font-bold transition-all flex items-center justify-center",
                        active
                          ? "border-foreground bg-foreground text-background shadow-[2px_2px_0px_var(--desk-border)]"
                          : "border-border bg-card hover:bg-muted text-foreground"
                      )}
                    >
                      {cat}
                      {active && <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={back} className="flex-1 h-11 border-border">
                  Back
                </Button>
                <Button onClick={next} className="flex-1 h-11 btn-desk-primary">
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex justify-center">
                <AvatarUploader
                  avatarUrl={avatarUrl}
                  displayName={name || profile?.display_name || "A"}
                  onChange={(url) => {
                    setAvatarUrl(url);
                    setAvatarCustomized(true);
                  }}
                  googleAvatar={googleAvatar}
                  onResetGoogle={() => {
                    setAvatarUrl(googleAvatar || null);
                    setAvatarCustomized(false);
                  }}
                  ownerId={isAuthenticated ? undefined : `guest/${deviceId}`}
                  showPresets={true}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={back} className="flex-1 h-11 border-border">
                  Back
                </Button>
                <Button onClick={finish} disabled={busy} className="flex-1 h-11 btn-desk-primary">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finish & Enter Bookie"}
                </Button>
              </div>
              <button
                onClick={finish}
                className="block mx-auto font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                Skip for now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}