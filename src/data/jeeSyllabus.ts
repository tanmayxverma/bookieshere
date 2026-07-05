// JEE syllabus tree — used by the Study Tracker.
// Chapter keys are stable slugs (subject:class:chapter) so localStorage keys survive edits.

export type ClassKey = "11" | "12";

export interface Chapter {
  key: string;
  name: string;
}

export interface SyllabusGroup {
  label: string; // e.g. "Class 11", or for chemistry "Physical Chemistry · Class 11"
  chapters: Chapter[];
}

export interface SyllabusSubject {
  id: "physics" | "chemistry" | "mathematics";
  name: string;
  groups: SyllabusGroup[];
}

const chap = (subject: string, cls: string, name: string): Chapter => ({
  key: `${subject}:${cls}:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name,
});

export const SYLLABUS: SyllabusSubject[] = [
  {
    id: "physics",
    name: "Physics",
    groups: [
      {
        label: "Class 11",
        chapters: [
          "Units and Dimensions","Errors in Measurement","Motion in One Dimension","Motion in Two Dimensions",
          "Relative Motion","Laws of Motion","Friction","Work, Energy and Power","Circular Motion","Centre of Mass",
          "Collision","Rotational Motion","Gravitation","Properties of Solids","Properties of Fluids",
          "Thermal Expansion","Calorimetry","Heat Transfer","Thermodynamics","Kinetic Theory of Gases",
          "Simple Harmonic Motion","Waves","Sound Waves","Doppler Effect",
        ].map((n) => chap("physics","11",n)),
      },
      {
        label: "Class 12",
        chapters: [
          "Electrostatics","Capacitance","Current Electricity","Magnetism","Magnetic Effects of Current",
          "Electromagnetic Induction","Alternating Current","Electromagnetic Waves","Ray Optics","Wave Optics",
          "Dual Nature of Matter","Atoms","Nuclei","Semiconductors","Communication Systems","Experimental Physics",
        ].map((n) => chap("physics","12",n)),
      },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    groups: [
      {
        label: "Physical · Class 11",
        chapters: ["Mole Concept","Atomic Structure","States of Matter","Thermodynamics","Thermochemistry",
          "Chemical Equilibrium","Ionic Equilibrium","Redox Reactions","Hydrogen"].map((n) => chap("chem-phy","11",n)),
      },
      {
        label: "Physical · Class 12",
        chapters: ["Solid State","Solutions","Electrochemistry","Chemical Kinetics","Surface Chemistry"]
          .map((n) => chap("chem-phy","12",n)),
      },
      {
        label: "Inorganic · Class 11",
        chapters: ["Periodic Table and Periodicity","Chemical Bonding","s-Block Elements","p-Block Elements (11th Part)"]
          .map((n) => chap("chem-inorg","11",n)),
      },
      {
        label: "Inorganic · Class 12",
        chapters: ["General Principles of Metallurgy","p-Block Elements (12th Part)","d-Block Elements",
          "f-Block Elements","Coordination Compounds","Qualitative Analysis","Environmental Chemistry"]
          .map((n) => chap("chem-inorg","12",n)),
      },
      {
        label: "Organic · Class 11",
        chapters: ["General Organic Chemistry (GOC)","Isomerism",
          "Purification and Characterisation of Organic Compounds","Hydrocarbons"]
          .map((n) => chap("chem-org","11",n)),
      },
      {
        label: "Organic · Class 12",
        chapters: ["Haloalkanes and Haloarenes","Alcohols, Phenols and Ethers",
          "Aldehydes, Ketones and Carboxylic Acids","Amines","Biomolecules","Polymers",
          "Chemistry in Everyday Life","Practical Organic Chemistry"]
          .map((n) => chap("chem-org","12",n)),
      },
    ],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    groups: [
      {
        label: "Class 11",
        chapters: ["Basic Mathematics","Sets","Relations and Functions","Trigonometric Functions",
          "Inverse Trigonometric Functions","Complex Numbers","Quadratic Equations","Sequences and Series",
          "Permutations and Combinations","Binomial Theorem","Straight Lines","Pair of Straight Lines",
          "Circle","Parabola","Ellipse","Hyperbola","Limits","Continuity","Differentiability","Statistics",
          "Mathematical Reasoning","Probability"].map((n) => chap("math","11",n)),
      },
      {
        label: "Class 12",
        chapters: ["Matrices","Determinants","Functions","Continuity and Differentiability","Differentiation",
          "Application of Derivatives","Indefinite Integration","Definite Integration","Area Under Curves",
          "Differential Equations","Vector Algebra","Three Dimensional Geometry","Linear Programming","Probability"]
          .map((n) => chap("math","12",n)),
      },
    ],
  },
];

export const ALL_CHAPTERS = SYLLABUS.flatMap((s) => s.groups.flatMap((g) => g.chapters));
export const MAX_STARS = 3;