export interface TestSeriesResource {
  name: string;
  url: string;
  badge?: string;
}

export interface TestSeriesProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  accent: string; // tailwind gradient classes
  resources: TestSeriesResource[];
}

export const TEST_SERIES: TestSeriesProvider[] = [
  {
    id: "ovibattle",
    name: "1v1 Mock Test Battle",
    description: "NTA-style 1v1 mock test battles — challenge peers head-to-head.",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbwQ8XsaNkXg-IoOxsaLp-N2K2MTReL0NMogLp4-zaz9wECAxhbba3-Cgg&s=10",
    accent: "from-violet-500/25 to-fuchsia-500/20",
    resources: [
      { name: "Ovibattle — 1v1 NTA-Style Battle", url: "https://www.ovibattle.in/", badge: "New" },
    ],
  },
  {
    id: "all-live-hub",
    name: "All Live Test Series Hub",
    description: "Aggregated live test series across providers.",
    logo: "",
    accent: "from-primary/25 to-blue-500/20",
    resources: [
      { name: "Live Test Series Hub", url: "https://ophub-testseries-books-notes.pages.dev/", badge: "Featured" },
    ],
  },
  {
    id: "pw",
    name: "PW Tests",
    description: "Physics Wallah test portal — full coverage mirrors.",
    logo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Physics_wallah_logo.svg/960px-Physics_wallah_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20230304132210",
    accent: "from-slate-700/25 to-slate-900/40",
    resources: [
      { name: "PW Tests Portal", url: "https://www.sstudy.site/" },
    ],
  },
  {
    id: "pyq",
    name: "PYQ Practice",
    description: "Previous Year Question archive, year-wise.",
    logo: "https://novatra.in/static/images/icons/maskable/maskable_icon.png",
    accent: "from-indigo-500/20 to-blue-500/20",
    resources: [
      { name: "Novatra — JEE Main & Advanced PYQs", url: "https://novatra.in/exams/", badge: "Featured" },
      { name: "PrepJEE", url: "https://prepjee.lovable.app/", badge: "New" },
    ],
  },
  {
    id: "fiitjee",
    name: "FIITJEE",
    description: "AITS, Rank Booster, Rank Improvement & archives.",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSIgQXM1PppCyD-hbhiNaeVoA6EvCH4ngGvWGnV4V9Cw&s",
    accent: "from-yellow-400/25 to-red-500/20",
    resources: [
      { name: "All India Series", url: "https://drive.google.com/drive/folders/1HPzc0gQReeMpWvJpEEbumbtGn5oe7jJ7" },
      { name: "Rank Booster Series", url: "https://drive.google.com/drive/folders/1LvNfJx1KcRpwO6nmOuUiDu0djUCXPmto" },
      { name: "Rank Improvement Series", url: "https://drive.google.com/drive/folders/1MEV6os5hujn1RFgfs2VBagqiq0NIPvGI" },
      { name: "FIITJEE AITS 2024", url: "https://drive.google.com/drive/folders/135e-F3JV69BjEGwF76IYbqxUlckM_tzS?usp=sharing" },
      { name: "FIITJEE AITS 400+ Pages", url: "https://drive.google.com/drive/folders/16vPVUp848Id0gQX2tLvTtlsPii7PtUL4?usp=sharing" },
    ],
  },
  {
    id: "allen",
    name: "ALLEN",
    description: "Enthusiast, Leader, LN, Score series & online tests.",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSghD7C6kJjI8ZV0nJbgm4X_zdJbvt2KW2kdFM34Nr_HqLzBAWYyTk5gJQ&s=10",
    accent: "from-blue-600/25 to-amber-400/25",
    resources: [
      { name: "Test Series", url: "https://drive.google.com/drive/folders/106onfdejEpVrHs2409w4f013dLYJSczH" },
      { name: "Online Test Series", url: "https://drive.google.com/drive/folders/1I28AqanFcp3w-Eaw90KI9kiTIx36NXgU" },
      { name: "JEE Enthusiast Phase I, II, III", url: "https://drive.google.com/drive/folders/1PJZ5n6VqVoY0tutH02ki1L75RlMNUXIX" },
      { name: "JEE Leader Phase I, II, III", url: "https://drive.google.com/drive/folders/1mlh2H8-YSGsuN4q2yDfgVoWCIW6l5oNx" },
      { name: "LN Leader", url: "https://drive.google.com/drive/folders/1m9aFPxx3zhy4tnVzvMYbcFvtBB67bATV" },
      { name: "Score Advanced", url: "https://drive.google.com/drive/folders/1abREmXFzDPgRf9U0Loyht84aaODJrbOs" },
      { name: "Score 1", url: "https://drive.google.com/drive/folders/1abREmXFzDPgRf9U0Loyht84aaODJrbOs" },
      { name: "Score 2", url: "https://drive.google.com/drive/folders/1KEAtyrr_8N4RRCqJ1zKWKtAhxoXiZR_Q" },
      { name: "Score 2 Star", url: "https://drive.google.com/drive/folders/1QtDcSxfjXHuZZmiSkRZl6qCai5_Eeauv" },
    ],
  },
  {
    id: "narayana",
    name: "Narayana",
    description: "Full syllabus, Grand Test Series & GTM (Main).",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIEfh3DW9ClQlBuxn19DWeWXM_Jw483BRzyl-s8LOXlQ&s",
    accent: "from-orange-500/25 to-blue-600/25",
    resources: [
      { name: "Full Syllabus Tests", url: "https://drive.google.com/drive/folders/1wB6LoAQcSyrlU_qMi-1KXNm8QPdjmwht" },
      { name: "Grand Test Series JEE Main", url: "https://drive.google.com/drive/folders/1Wlq_XncPFd2jc6M6-B4ayrqWfMue8Kuu" },
      { name: "Grand Test Series JEE Advanced", url: "https://drive.google.com/drive/folders/1Wbq4_YY9--AZJb_g6vja3Mgt6xrEjrIJ" },
      { name: "GTM JEE Main April", url: "https://drive.google.com/drive/folders/15Odk5xuFc2ewEEUqsJr1yPJyD57d3JwS" },
      { name: "GTM JEE Main January", url: "https://drive.google.com/drive/folders/1WZbS4DHBqxijbJgQeYPhW8qo9_PvtOVl" },
    ],
  },
  {
    id: "sri-chaitanya",
    name: "Sri Chaitanya",
    description: "Full test series & GTM bank.",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj2Qnuu1L-148vC64239xaWSVVN5HGjfKuLE5yvS-mlA&s",
    accent: "from-blue-500/25 to-rose-500/20",
    resources: [
      { name: "Test Series", url: "https://drive.google.com/drive/folders/15VDRRpuWZ8_qbNemKm_il78N0jrj4l8s" },
      { name: "GTM", url: "https://drive.google.com/drive/folders/1GT3SMcR6YAmKYndte2bGTjbDSAhSDS6q" },
    ],
  },
  {
    id: "vmc",
    name: "VMC",
    description: "Vidyamandir Classes test series.",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlwfudYrS554vkWrzGgfOae7Lr9ME2dWBDyRvQ3G2wiQ&s",
    accent: "from-indigo-700/25 to-amber-400/25",
    resources: [
      { name: "Test Series", url: "https://drive.google.com/drive/folders/1WJUyCtziCrsEYmY2XJikki0eVDDx1xme" },
    ],
  },
  {
    id: "collections",
    name: "Curated Collections",
    description: "Latest JEE test series & wrapped sets.",
    logo: "",
    accent: "from-emerald-500/20 to-teal-500/20",
    resources: [
      { name: "Latest JEE Test Series", url: "https://drive.google.com/drive/folders/10KX-pWLXNmES1EMzR3uHIHhfojmZqVBP" },
      { name: "Test Series Ended May 2026", url: "https://drive.google.com/drive/folders/1R4oSsOdm6vs4pPOM4bLxteGp3lnNve_F" },
      { name: "Other Test Series", url: "https://muthalongo.pages.dev/" },
    ],
  },
  {
    id: "eklavya",
    name: "Vedantu (Eklavya)",
    description: "Vedantu Eklavya test series & advanced tests.",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiyZbR2coMBC8ECBIZZZdIAXN6Gr1POHDaLGZJuNdw8w&s",
    accent: "from-orange-500/25 to-rose-500/25",
    resources: [
      { name: "Test Series", url: "https://t.me/bookiestorageBot?start=BQADAQADjw4AAiuQSUR-M87K-IfIAhYE" },
      { name: "Advanced Tests", url: "https://drive.google.com/file/d/1GLMHXbLoxsTP7iaVD8y6jDDnFXld9m85/view" },
    ],
  },
];