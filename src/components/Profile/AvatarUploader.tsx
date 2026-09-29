import { useRef, useState } from "react";
import { Camera, X, Loader2, Flame, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  avatarUrl: string | null;
  displayName: string;
  onChange: (url: string | null) => void;
  googleAvatar?: string | null;
  onResetGoogle?: () => void;
  /** Owner folder prefix in storage. Defaults to auth.uid() (signed-in). For guests, pass `guest/<deviceId>`. */
  ownerId?: string;
  streak?: number;
  showPresets?: boolean;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}

// Curated avatar presets designed for JEE Aspirants
export const ASPIRANT_AVATAR_PRESETS = [
  { id: "rocket", emoji: "🚀", label: "Quantum" },
  { id: "zap", emoji: "⚡", label: "Hyperfocus" },
  { id: "target", emoji: "🎯", label: "JEE Ranker" },
  { id: "owl", emoji: "🦉", label: "Night Owl" },
  { id: "flask", emoji: "🔬", label: "Chemist" },
  { id: "math", emoji: "📐", label: "Math Geek" },
  { id: "trophy", emoji: "🏆", label: "Topper" },
  { id: "chai", emoji: "☕", label: "Chai Grind" },
] as const;

// Helper to generate a sleek SVG Data URI from an emoji preset
export function createEmojiAvatarDataUrl(emoji: string, bgGradient = "linear-gradient(135deg, #2563eb, #7c3aed)"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="100" fill="url(#g)" />
    <text x="50%" y="54%" font-size="95" text-anchor="middle" dominant-baseline="central">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Client-side downscale and compress image to keep data fast and lightweight
async function compressImageFile(file: File, maxDim = 400, quality = 0.85): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error("Canvas blob conversion failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AvatarUploader({
  avatarUrl,
  displayName,
  onChange,
  ownerId,
  streak,
  googleAvatar,
  onResetGoogle,
  showPresets = true,
}: Props) {
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
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Image must be under 5MB" });
      return;
    }

    setBusy(true);
    try {
      // 1. Client-side compress first
      const { blob, dataUrl } = await compressImageFile(file, 400, 0.85);

      let uploadedUrl: string | null = null;
      try {
        const prefix = ownerId || `guest/${Date.now()}`;
        const path = `${prefix}/avatar-${Date.now()}.jpg`;

        const { error: upErr } = await supabase.storage.from("avatars").upload(path, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });

        if (!upErr) {
          const { data: pubData } = supabase.storage.from("avatars").getPublicUrl(path);
          if (pubData?.publicUrl) {
            uploadedUrl = pubData.publicUrl;
          }
        }
      } catch (uploadErr) {
        console.warn("Storage upload fallback to base64 dataUrl:", uploadErr);
      }

      // If storage upload succeeded use public URL, otherwise fallback to compressed base64 dataUrl!
      const finalUrl = uploadedUrl || dataUrl;
      onChange(finalUrl);
      toast({ title: "Custom photo updated successfully!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Photo upload failed", description: err?.message || String(err) });
    } finally {
      setBusy(false);
    }
  };

  const handleSelectPreset = (emoji: string) => {
    const dataUrl = createEmojiAvatarDataUrl(emoji);
    onChange(dataUrl);
    toast({ title: "Avatar updated!" });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="h-28 w-28 rounded-full overflow-hidden ring-4 ring-primary/20 bg-gradient-to-br from-primary/20 via-indigo-500/10 to-primary/5 flex items-center justify-center text-3xl font-display font-black text-foreground/80 shadow-md">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <span>{initials(displayName)}</span>
          )}
          {busy && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handlePick}
          disabled={busy}
          className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          aria-label="Upload custom photo"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {/* Streak badge if available */}
      {streak !== undefined && (
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 text-amber-800 dark:text-amber-200 text-xs font-mono font-black shadow-xs select-none"
          title="Streak updates based on 3:00 AM IST daily rollover"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{streak ?? 0}d streak</span>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-normal">· 3AM IST</span>
        </div>
      )}

      {/* Actions row */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
        <button
          type="button"
          onClick={handlePick}
          disabled={busy}
          className="font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{avatarUrl ? "Change Photo" : "Upload Custom Photo"}</span>
        </button>
        {avatarUrl && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={busy}
              className="font-semibold text-destructive hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          </>
        )}
        {googleAvatar && avatarUrl !== googleAvatar && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <button
              type="button"
              onClick={onResetGoogle ? onResetGoogle : () => onChange(googleAvatar)}
              disabled={busy}
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Use Google photo
            </button>
          </>
        )}
      </div>

      {/* Preset avatar selector pills */}
      {showPresets && (
        <div className="w-full pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5 px-1">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick Aspirant Avatars
            </span>
            <span>or upload above</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {ASPIRANT_AVATAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.emoji)}
                title={preset.label}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary/20 dark:hover:bg-primary/30 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <span>{preset.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </div>
  );
}