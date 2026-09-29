import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface InstituteLogoProps {
  id?: string;
  name: string;
  logo?: string;
  accent?: string;
  className?: string;
  size?: number | string;
  imgClassName?: string;
}

// Curated branding themes for popular JEE institutes & platforms
const INSTITUTE_BRANDS: Record<
  string,
  { acronym: string; bg: string; text: string; sub?: string }
> = {
  pw: { acronym: "PW", bg: "from-slate-900 to-black border-slate-700", text: "text-amber-400", sub: "PHYSICS" },
  allen: { acronym: "ALLEN", bg: "from-blue-700 to-blue-950 border-blue-500", text: "text-white", sub: "KOTA" },
  fiitjee: { acronym: "FIITJEE", bg: "from-red-600 to-red-950 border-red-500", text: "text-amber-300", sub: "AITS" },
  narayana: { acronym: "NARA", bg: "from-orange-600 to-blue-900 border-orange-500", text: "text-white", sub: "CO" },
  "sri-chaitanya": { acronym: "CHAIT", bg: "from-blue-600 to-indigo-950 border-blue-400", text: "text-white", sub: "INFINITY" },
  vmc: { acronym: "VMC", bg: "from-indigo-800 to-purple-950 border-indigo-500", text: "text-amber-300", sub: "DELHI" },
  ovibattle: { acronym: "1v1", bg: "from-violet-600 to-fuchsia-950 border-violet-400", text: "text-white", sub: "BATTLE" },
  pyq: { acronym: "PYQ", bg: "from-indigo-600 to-blue-900 border-indigo-400", text: "text-white", sub: "ARCHIVE" },
  eklavya: { acronym: "EK", bg: "from-amber-600 to-red-900 border-amber-500", text: "text-white", sub: "TESTS" },
  "all-live-hub": { acronym: "LIVE", bg: "from-blue-600 to-cyan-900 border-blue-400", text: "text-white", sub: "HUB" },
  collections: { acronym: "JEE", bg: "from-emerald-600 to-teal-950 border-emerald-400", text: "text-white", sub: "CURATED" },
  unacademy: { acronym: "UN", bg: "from-emerald-600 to-teal-950 border-emerald-400", text: "text-white", sub: "PLUS" },
  competishun: { acronym: "COMP", bg: "from-orange-600 to-amber-900 border-orange-400", text: "text-white", sub: "ABJ SIR" },
  vibrant: { acronym: "VIB", bg: "from-amber-500 to-rose-950 border-amber-400", text: "text-white", sub: "ACADEMY" },
  eduniti: { acronym: "ED", bg: "from-zinc-800 to-zinc-950 border-zinc-700", text: "text-emerald-400", sub: "PHYSICS" },
  esaral: { acronym: "ES", bg: "from-sky-500 to-indigo-950 border-sky-400", text: "text-white", sub: "SARAL" },
  careerwill: { acronym: "CW", bg: "from-cyan-600 to-rose-950 border-cyan-400", text: "text-white", sub: "JINDAL" },
  "apni-kaksha": { acronym: "AK", bg: "from-zinc-900 to-black border-zinc-700", text: "text-amber-400", sub: "KAKSHA" },
  "mission-jeet": { acronym: "JEET", bg: "from-red-600 to-black border-red-500", text: "text-white", sub: "MISSION" },
  "next-toppers": { acronym: "NT", bg: "from-blue-600 to-indigo-950 border-blue-500", text: "text-amber-400", sub: "TOPPERS" },
};

function getBrandKey(id?: string, name?: string): string {
  if (id && INSTITUTE_BRANDS[id.toLowerCase()]) return id.toLowerCase();
  const lower = (name || "").toLowerCase();
  for (const key of Object.keys(INSTITUTE_BRANDS)) {
    if (lower.includes(key)) return key;
  }
  return "";
}

export function InstituteLogo({
  id,
  name,
  logo,
  accent,
  className,
  size,
  imgClassName,
}: InstituteLogoProps) {
  const [hasError, setHasError] = useState(false);
  const brandKey = getBrandKey(id, name);
  const brand = brandKey ? INSTITUTE_BRANDS[brandKey] : null;

  const acronym =
    brand?.acronym ||
    (name || "")
      .split(" ")
      .slice(0, 2)
      .map(w => w[0])
      .join("")
      .toUpperCase() ||
    "JEE";

  // If logo URL is present and not broken, try to render image
  if (logo && !hasError) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl flex items-center justify-center bg-surface-container-lowest shrink-0",
          className
        )}
        style={size ? { width: size, height: size } : undefined}
      >
        <img
          src={logo}
          alt={`${name} logo`}
          onError={() => setHasError(true)}
          loading="lazy"
          className={cn("w-full h-full object-cover", imgClassName)}
        />
      </div>
    );
  }

  // Graceful, branded monogram emblem fallback
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl flex flex-col items-center justify-center bg-gradient-to-br border shadow-xs select-none shrink-0 font-display transition-transform",
        brand
          ? `${brand.bg} ${brand.text}`
          : "from-slate-800 to-slate-950 border-slate-700 text-white",
        className
      )}
      style={size ? { width: size, height: size } : undefined}
    >
      <span className="font-black tracking-wider leading-none text-center">
        {acronym}
      </span>
      {brand?.sub && (
        <span className="text-[7px] font-mono tracking-tighter opacity-80 uppercase leading-none mt-0.5">
          {brand.sub}
        </span>
      )}
    </div>
  );
}
