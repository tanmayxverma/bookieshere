import { useRef, useState } from "react";
import { Camera, X, Loader2, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  avatarUrl: string | null;
  displayName: string;
  onChange: (url: string | null) => void;
  /** Owner folder prefix in storage. Defaults to auth.uid() (signed-in). For guests, pass `guest/<deviceId>`. */
  ownerId?: string;
  streak?: number;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export function AvatarUploader({ avatarUrl, displayName, onChange, ownerId, streak }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const handlePick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Only image files allowed" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Image must be under 2MB" });
      return;
    }
    setBusy(true);
    try {
      let prefix = ownerId;
      if (!prefix) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sign in required to upload");
        prefix = user.id;
      }
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${prefix}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage.from("avatars").createSignedUrl(path, TEN_YEARS);
      if (sErr || !signed?.signedUrl) throw sErr || new Error("Could not sign URL");
      onChange(signed.signedUrl);
      toast({ title: "Photo updated" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err?.message || String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="h-28 w-28 rounded-full overflow-hidden ring-2 ring-border/60 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl font-display font-black text-foreground/80">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span>{initials(displayName)}</span>
          )}
          {busy && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handlePick}
          disabled={busy}
          className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
          aria-label="Upload photo"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {/* Streak counter under profile logo */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 text-amber-800 dark:text-amber-200 text-xs font-mono font-black shadow-xs select-none"
        title="Streak updates based on 3:00 AM IST daily rollover"
      >
        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>{streak ?? 0}d streak</span>
        <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-normal">· 3AM IST</span>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={handlePick} disabled={busy}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          {avatarUrl ? "Change photo" : "Upload photo"}
        </button>
        {avatarUrl && (
          <>
            <span className="text-muted-foreground/30">·</span>
            <button type="button" onClick={() => onChange(null)} disabled={busy}
              className="text-xs font-semibold text-destructive/80 hover:text-destructive inline-flex items-center gap-1">
              <X className="h-3 w-3" /> Remove
            </button>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </div>
  );
}