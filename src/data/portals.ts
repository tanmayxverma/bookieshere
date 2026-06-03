import pwLogo from "@/assets/portals/pw.png.asset.json";
import vibrantLogo from "@/assets/portals/vibrant.png.asset.json";
import missionJeetLogo from "@/assets/portals/mission-jeet.png.asset.json";
import unacademyLogo from "@/assets/portals/unacademy.png.asset.json";
import apniKakshaLogo from "@/assets/portals/apni-kaksha.png.asset.json";
import competishunLogo from "@/assets/portals/competishun.png.asset.json";
import allenLogo from "@/assets/portals/allen.jpg.asset.json";

export interface PortalLink {
  label: string;
  url: string;
  note?: string;
}

export interface Portal {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  accent: string; // tailwind gradient
  links: PortalLink[];
  instructions?: string;
}

export const PORTALS: Portal[] = [
  {
    id: "pw",
    name: "PW (Physics Wallah)",
    tagline: "Lectures, notes & mirrors",
    logo: pwLogo.url,
    accent: "from-slate-700/30 to-slate-900/40",
    links: [
      { label: "PW Thor", url: "https://pwthor.live/study" },
      { label: "PW4Free", url: "https://pw4free.in/" },
      { label: "TestUK Stream", url: "https://stream.testuk.org/" },
      { label: "PW4Free Lite", url: "https://lite.pw4free.in/" },
      { label: "SStudy", url: "https://www.sstudy.site/" },
      { label: "SquidStudy", url: "https://www.squidstudy.eu.org/login" },
    ],
  },
  {
    id: "vibrant",
    name: "Vibrant Academy",
    tagline: "Believe in excellence",
    logo: vibrantLogo.url,
    accent: "from-amber-500/20 to-rose-500/20",
    links: [
      { label: "Vibrant Prep4Free", url: "https://vibrant.prep4free.com/" },
      { label: "SquidStudy Vibrant", url: "https://www.squidstudy.eu.org/vibrant/dashboard" },
      { label: "Vibrunway", url: "https://vibrunway.lovable.app/" },
    ],
  },
  {
    id: "mission-jeet",
    name: "Mission JEET",
    tagline: "Targeted JEE coverage",
    logo: missionJeetLogo.url,
    accent: "from-red-500/25 to-zinc-900/40",
    links: [
      { label: "Mission JEET Portal", url: "https://missionjeet.thescholarverse.site" },
    ],
  },
  {
    id: "unacademy",
    name: "Unacademy",
    tagline: "Mirrors & lecture access",
    logo: unacademyLogo.url,
    accent: "from-blue-500/20 to-emerald-500/20",
    links: [
      { label: "Pikachu X", url: "https://pikachux.netlify.app" },
      { label: "It's Pikachu", url: "https://itspikachu.netlify.app/" },
    ],
  },
  {
    id: "careerwill",
    name: "Careerwill (Jindal)",
    tagline: "Jindal sir lectures",
    logo: vibrantLogo.url, // fallback — no logo provided
    accent: "from-orange-500/20 to-yellow-500/20",
    links: [
      { label: "Jindal Prep4Free", url: "https://jindal.prep4free.com/" },
    ],
  },
  {
    id: "apni-kaksha",
    name: "Apni Kaksha",
    tagline: "Telegram channel",
    logo: apniKakshaLogo.url,
    accent: "from-zinc-700/30 to-zinc-900/40",
    links: [
      { label: "Apni Kaksha Telegram", url: "https://t.me/+eg31kwGzzyoxNmU1" },
    ],
  },
  {
    id: "competishun",
    name: "Competishun",
    tagline: "ABJ Sir Physics lectures",
    logo: competishunLogo.url,
    accent: "from-blue-500/20 to-orange-500/20",
    links: [
      { label: "ABJ Sir Physics (Telegram)", url: "https://t.me/ABJ_SIR_PHYSICS_JEE_LECTURE_ZB" },
    ],
  },
  {
    id: "allen",
    name: "ALLEN",
    tagline: "Lectures via Telegram bot",
    logo: allenLogo.url,
    accent: "from-amber-500/25 to-blue-500/20",
    instructions:
      "To get lectures → click the link → Start the Telegram bot → Select 'Important Books and Lectures for 11th and 12th' → Select 'ALLEN Lectures for 11 and 12' → Pick your preferred subject and enjoy.",
    links: [
      { label: "ALLEN Study Materials Bot", url: "https://t.me/StudyMaterials223_bot" },
    ],
  },
];

// Remove careerwill duplicate logo fallback note: keep simple letter monogram instead
PORTALS.find((p) => p.id === "careerwill")!.logo = "";