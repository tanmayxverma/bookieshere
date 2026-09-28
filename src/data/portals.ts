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
    logo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Physics_wallah_logo.svg/960px-Physics_wallah_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20230304132210",
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
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSX4f1Dt3c1s961BEllw9mlI8V7koJsj55obrkHjPi_w&s=10",
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
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUc6TqGXi1WhhtqqX7U5IhN97Xl4CY7xJhufDHr-Kjmg&s=10",
    accent: "from-red-500/25 to-zinc-900/40",
    links: [
      { label: "Mission JEET Portal", url: "https://missionjeet.thescholarverse.site" },
    ],
  },
  {
    id: "unacademy",
    name: "Unacademy",
    tagline: "Mirrors & lecture access",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKQqr0HP9nIuwoxD0NNLpGTDuLzt4b9lTFA8_UVdYx3MIDweFlhRULgNQ&s=10",
    accent: "from-blue-500/20 to-emerald-500/20",
    links: [
      { label: "Pikachu X", url: "https://pikachux.netlify.app" },
      { label: "It's Pikachu", url: "https://itspikachu.netlify.app/" },
      { label: "Study UK", url: "https://studyuk.online/" },
      { label: "UC Web", url: "https://uc-web.uc27.workers.dev" },
      { label: "Unacademy Scholarverse", url: "https://unacademy.thescholarverse.site" },
    ],
  },
  {
    id: "careerwill",
    name: "Careerwill (Jindal)",
    tagline: "Jindal sir lectures",
    logo: "https://play-lh.googleusercontent.com/GuXFo6caz9vT2xBqMrPNQ7pB3KOk9qE9dxrbz42VAjjl8EywFlmJD0-NXAcvvr7Br1Va_NtXuwiztlkxpK5KVA=s0-br30",
    accent: "from-cyan-500/20 to-red-500/20",
    links: [
      { label: "Jindal Prep4Free", url: "https://jindal.prep4free.com/" },
    ],
  },
  {
    id: "apni-kaksha",
    name: "Apni Kaksha",
    tagline: "Telegram channel",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKb2hbVD2kKcTXrZCbGhIsKi5jtEY7X3d9BLGWADdUqg&s=10",
    accent: "from-zinc-700/30 to-zinc-900/40",
    links: [
      { label: "Apni Kaksha Telegram", url: "https://t.me/+eg31kwGzzyoxNmU1" },
    ],
  },
  {
    id: "competishun",
    name: "Competishun",
    tagline: "ABJ Sir Physics lectures",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWTth6Z5nT_cHXcET632V1Wy84czfaNIG506gNMXAqii50vyD2sNuOhHbe&s=10",
    accent: "from-blue-500/20 to-orange-500/20",
    links: [
      { label: "ABJ Sir Physics (Telegram)", url: "https://t.me/ABJ_SIR_PHYSICS_JEE_LECTURE_ZB" },
      { label: "Kompetishun Portal", url: "https://kompetishun.pages.dev/" },
    ],
  },
  {
    id: "allen",
    name: "ALLEN",
    tagline: "Lectures via Telegram bot",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSghD7C6kJjI8ZV0nJbgm4X_zdJbvt2KW2kdFM34Nr_HqLzBAWYyTk5gJQ&s=10",
    accent: "from-amber-500/25 to-blue-500/20",
    instructions:
      "To get lectures → click the link → Start the Telegram bot → Select 'Important Books and Lectures for 11th and 12th' → Select 'ALLEN Lectures for 11 and 12' → Pick your preferred subject and enjoy.",
    links: [
      { label: "ALLEN Study Materials Bot", url: "https://t.me/StudyMaterials223_bot" },
      { label: "Allen Portal Mirror", url: "https://aliens-op.pages.dev/" },
    ],
  },
  {
    id: "esaral",
    name: "eSaral",
    tagline: "eSaral lecture portal",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYGIL0hPtYuXXGRS8ELQWMsA9g4U6KHsrerwQA5e4fDg&s=10",
    accent: "from-sky-500/25 to-fuchsia-500/20",
    links: [
      { label: "eSaral Lectures Portal", url: "https://op-saral.pages.dev/" },
    ],
  },
  {
    id: "eduniti",
    name: "Eduniti",
    tagline: "Advance courses (PhysicsNiti)",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB4OwnH2lmU1zaaGcp-X9Xcg1hOfz4hgoFGub1Jngx8w&s=10",
    accent: "from-zinc-800/40 to-zinc-950/50",
    links: [
      { label: "Eduniti Advance Courses", url: "https://physicsniti-op.pages.dev/" },
    ],
  },
  {
    id: "vedantu",
    name: "Vedantu",
    tagline: "Eklavya & JEE Prep",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiyZbR2coMBC8ECBIZZZdIAXN6Gr1POHDaLGZJuNdw8w&s",
    accent: "from-orange-500/20 to-amber-500/20",
    links: [
      { label: "Vedantu Eklavya Tests", url: "https://t.me/bookiestorageBot?start=BQADAQADjw4AAiuQSUR-M87K-IfIAhYE" },
    ],
  },
];
