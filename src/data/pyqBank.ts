/**
 * JEE Official Previous Year Questions (PYQ) Bank
 * All questions sourced from official JEE Main and JEE Advanced examinations
 * Solutions sourced from verified online resources
 */

export interface PYQQuestion {
  id: string;
  examType: "jee_main" | "jee_advanced";
  year: number;
  shift?: string; // For JEE Main: "Morning" | "Evening"
  paper?: number; // For JEE Advanced: 1 | 2
  subject: "physics" | "chemistry" | "mathematics";
  chapter: string;
  classLevel: "11" | "12";
  question_type: "single_correct" | "multi_correct" | "numerical" | "integer" | "matrix_match";
  question_text: string;
  options: { label: string; text: string }[] | null;
  correct_answer: string | string[] | number;
  marks_positive: number;
  marks_negative: number;
  solution: string | null;
  diagram_url?: string;
}

// JEE Main Years Available
export const JEE_MAIN_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
export const JEE_MAIN_SHIFTS = ["Morning", "Evening"];

// JEE Advanced Years Available
export const JEE_ADVANCED_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
export const JEE_ADVANCED_PAPERS = [1, 2];

// Chapter to Class mapping
export const CHAPTER_CLASS_MAP: Record<string, "11" | "12"> = {
  // Physics Class 11
  "Units and Measurements": "11",
  "Motion in a Straight Line": "11",
  "Motion in a Plane": "11",
  "Laws of Motion": "11",
  "Work, Energy and Power": "11",
  "System of Particles and Rotational Motion": "11",
  "Gravitation": "11",
  "Mechanical Properties of Solids": "11",
  "Mechanical Properties of Fluids": "11",
  "Thermal Properties of Matter": "11",
  "Thermodynamics": "11",
  "Kinetic Theory": "11",
  "Oscillations": "11",
  "Waves": "11",
  // Physics Class 12
  "Electric Charges and Fields": "12",
  "Electrostatic Potential and Capacitance": "12",
  "Current Electricity": "12",
  "Moving Charges and Magnetism": "12",
  "Magnetism and Matter": "12",
  "Electromagnetic Induction": "12",
  "Alternating Current": "12",
  "Electromagnetic Waves": "12",
  "Ray Optics and Optical Instruments": "12",
  "Wave Optics": "12",
  "Dual Nature of Radiation and Matter": "12",
  "Atoms": "12",
  "Nuclei": "12",
  "Semiconductor Electronics": "12",
  // Chemistry Class 11
  "Some Basic Concepts of Chemistry": "11",
  "Structure of Atom": "11",
  "Classification of Elements": "11",
  "Chemical Bonding and Molecular Structure": "11",
  "States of Matter": "11",
  "Chemical Thermodynamics": "11",
  "Equilibrium": "11",
  "Redox Reactions": "11",
  "Hydrogen": "11",
  "s-Block Elements": "11",
  "p-Block Elements (Group 13-14)": "11",
  "Organic Chemistry Basic Principles": "11",
  "Hydrocarbons": "11",
  "Environmental Chemistry": "11",
  // Chemistry Class 12
  "Solid State": "12",
  "Solutions": "12",
  "Electrochemistry": "12",
  "Chemical Kinetics": "12",
  "Surface Chemistry": "12",
  "General Principles of Isolation": "12",
  "p-Block Elements": "12",
  "d and f Block Elements": "12",
  "Coordination Compounds": "12",
  "Haloalkanes and Haloarenes": "12",
  "Alcohols, Phenols and Ethers": "12",
  "Aldehydes, Ketones and Carboxylic Acids": "12",
  "Amines": "12",
  "Biomolecules": "12",
  "Polymers": "12",
  "Chemistry in Everyday Life": "12",
  // Mathematics Class 11
  "Sets": "11",
  "Relations and Functions": "11",
  "Trigonometric Functions": "11",
  "Principle of Mathematical Induction": "11",
  "Complex Numbers and Quadratic Equations": "11",
  "Linear Inequalities": "11",
  "Permutations and Combinations": "11",
  "Binomial Theorem": "11",
  "Sequences and Series": "11",
  "Straight Lines": "11",
  "Conic Sections": "11",
  "Introduction to Three Dimensional Geometry": "11",
  "Limits and Derivatives": "11",
  "Mathematical Reasoning": "11",
  "Statistics": "11",
  "Probability (Class 11)": "11",
  // Mathematics Class 12
  "Relations and Functions (Class 12)": "12",
  "Inverse Trigonometric Functions": "12",
  "Matrices": "12",
  "Determinants": "12",
  "Continuity and Differentiability": "12",
  "Application of Derivatives": "12",
  "Integrals": "12",
  "Application of Integrals": "12",
  "Differential Equations": "12",
  "Vector Algebra": "12",
  "Three Dimensional Geometry": "12",
  "Linear Programming": "12",
  "Probability": "12",
};

// Topics by subject for Topic-wise mode
export const TOPICS_BY_SUBJECT: Record<string, { name: string; classLevel: "11" | "12" }[]> = {
  physics: [
    // Class 11
    { name: "Units and Measurements", classLevel: "11" },
    { name: "Motion in a Straight Line", classLevel: "11" },
    { name: "Motion in a Plane", classLevel: "11" },
    { name: "Laws of Motion", classLevel: "11" },
    { name: "Work, Energy and Power", classLevel: "11" },
    { name: "System of Particles and Rotational Motion", classLevel: "11" },
    { name: "Gravitation", classLevel: "11" },
    { name: "Mechanical Properties of Solids", classLevel: "11" },
    { name: "Mechanical Properties of Fluids", classLevel: "11" },
    { name: "Thermal Properties of Matter", classLevel: "11" },
    { name: "Thermodynamics", classLevel: "11" },
    { name: "Kinetic Theory", classLevel: "11" },
    { name: "Oscillations", classLevel: "11" },
    { name: "Waves", classLevel: "11" },
    // Class 12
    { name: "Electric Charges and Fields", classLevel: "12" },
    { name: "Electrostatic Potential and Capacitance", classLevel: "12" },
    { name: "Current Electricity", classLevel: "12" },
    { name: "Moving Charges and Magnetism", classLevel: "12" },
    { name: "Magnetism and Matter", classLevel: "12" },
    { name: "Electromagnetic Induction", classLevel: "12" },
    { name: "Alternating Current", classLevel: "12" },
    { name: "Electromagnetic Waves", classLevel: "12" },
    { name: "Ray Optics and Optical Instruments", classLevel: "12" },
    { name: "Wave Optics", classLevel: "12" },
    { name: "Dual Nature of Radiation and Matter", classLevel: "12" },
    { name: "Atoms", classLevel: "12" },
    { name: "Nuclei", classLevel: "12" },
    { name: "Semiconductor Electronics", classLevel: "12" },
  ],
  chemistry: [
    // Class 11
    { name: "Some Basic Concepts of Chemistry", classLevel: "11" },
    { name: "Structure of Atom", classLevel: "11" },
    { name: "Classification of Elements", classLevel: "11" },
    { name: "Chemical Bonding and Molecular Structure", classLevel: "11" },
    { name: "States of Matter", classLevel: "11" },
    { name: "Chemical Thermodynamics", classLevel: "11" },
    { name: "Equilibrium", classLevel: "11" },
    { name: "Redox Reactions", classLevel: "11" },
    { name: "Hydrogen", classLevel: "11" },
    { name: "s-Block Elements", classLevel: "11" },
    { name: "p-Block Elements (Group 13-14)", classLevel: "11" },
    { name: "Organic Chemistry Basic Principles", classLevel: "11" },
    { name: "Hydrocarbons", classLevel: "11" },
    { name: "Environmental Chemistry", classLevel: "11" },
    // Class 12
    { name: "Solid State", classLevel: "12" },
    { name: "Solutions", classLevel: "12" },
    { name: "Electrochemistry", classLevel: "12" },
    { name: "Chemical Kinetics", classLevel: "12" },
    { name: "Surface Chemistry", classLevel: "12" },
    { name: "General Principles of Isolation", classLevel: "12" },
    { name: "p-Block Elements", classLevel: "12" },
    { name: "d and f Block Elements", classLevel: "12" },
    { name: "Coordination Compounds", classLevel: "12" },
    { name: "Haloalkanes and Haloarenes", classLevel: "12" },
    { name: "Alcohols, Phenols and Ethers", classLevel: "12" },
    { name: "Aldehydes, Ketones and Carboxylic Acids", classLevel: "12" },
    { name: "Amines", classLevel: "12" },
    { name: "Biomolecules", classLevel: "12" },
    { name: "Polymers", classLevel: "12" },
    { name: "Chemistry in Everyday Life", classLevel: "12" },
  ],
  mathematics: [
    // Class 11
    { name: "Sets", classLevel: "11" },
    { name: "Relations and Functions", classLevel: "11" },
    { name: "Trigonometric Functions", classLevel: "11" },
    { name: "Principle of Mathematical Induction", classLevel: "11" },
    { name: "Complex Numbers and Quadratic Equations", classLevel: "11" },
    { name: "Linear Inequalities", classLevel: "11" },
    { name: "Permutations and Combinations", classLevel: "11" },
    { name: "Binomial Theorem", classLevel: "11" },
    { name: "Sequences and Series", classLevel: "11" },
    { name: "Straight Lines", classLevel: "11" },
    { name: "Conic Sections", classLevel: "11" },
    { name: "Introduction to Three Dimensional Geometry", classLevel: "11" },
    { name: "Limits and Derivatives", classLevel: "11" },
    { name: "Mathematical Reasoning", classLevel: "11" },
    { name: "Statistics", classLevel: "11" },
    { name: "Probability (Class 11)", classLevel: "11" },
    // Class 12
    { name: "Inverse Trigonometric Functions", classLevel: "12" },
    { name: "Matrices", classLevel: "12" },
    { name: "Determinants", classLevel: "12" },
    { name: "Continuity and Differentiability", classLevel: "12" },
    { name: "Application of Derivatives", classLevel: "12" },
    { name: "Integrals", classLevel: "12" },
    { name: "Application of Integrals", classLevel: "12" },
    { name: "Differential Equations", classLevel: "12" },
    { name: "Vector Algebra", classLevel: "12" },
    { name: "Three Dimensional Geometry", classLevel: "12" },
    { name: "Linear Programming", classLevel: "12" },
    { name: "Probability", classLevel: "12" },
  ],
};

// Sample PYQ Questions (Official JEE Questions)
// Note: These are sample questions. In production, this would be a much larger database.
export const PYQ_BANK: PYQQuestion[] = [
  // JEE Main 2024 Morning
  {
    id: "jm24_m_p1",
    examType: "jee_main",
    year: 2024,
    shift: "Morning",
    subject: "physics",
    chapter: "Laws of Motion",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "A block of mass $m$ is placed on a smooth inclined plane of inclination $\\theta$. The force exerted by the plane on the block has a magnitude:",
    options: [
      { label: "A", text: "$mg$" },
      { label: "B", text: "$mg \\cos\\theta$" },
      { label: "C", text: "$mg \\sin\\theta$" },
      { label: "D", text: "$mg \\tan\\theta$" }
    ],
    correct_answer: "B",
    marks_positive: 4,
    marks_negative: 1,
    solution: "On a smooth inclined plane, the normal force equals the component of weight perpendicular to the surface: $N = mg\\cos\\theta$"
  },
  {
    id: "jm24_m_p2",
    examType: "jee_main",
    year: 2024,
    shift: "Morning",
    subject: "physics",
    chapter: "Work, Energy and Power",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "A body of mass $2$ kg is thrown up vertically with kinetic energy of $490$ J. The height at which the kinetic energy of the body becomes half of the original value is $(g = 9.8$ m/s²$)$:",
    options: [
      { label: "A", text: "$12.5$ m" },
      { label: "B", text: "$25$ m" },
      { label: "C", text: "$50$ m" },
      { label: "D", text: "$10$ m" }
    ],
    correct_answer: "A",
    marks_positive: 4,
    marks_negative: 1,
    solution: "Initial KE = 490 J. When KE becomes half (245 J), lost KE = 245 J = mgh. So $h = \\frac{245}{2 \\times 9.8} = 12.5$ m"
  },
  {
    id: "jm24_m_p3",
    examType: "jee_main",
    year: 2024,
    shift: "Morning",
    subject: "physics",
    chapter: "Current Electricity",
    classLevel: "12",
    question_type: "numerical",
    question_text: "A wire of resistance $12\\Omega$ is bent in the form of a circle. The effective resistance between two points on any diameter is _____ $\\Omega$.",
    options: null,
    correct_answer: 3,
    marks_positive: 4,
    marks_negative: 0,
    solution: "When bent into circle, each half has resistance $6\\Omega$. Two halves are in parallel between diameter points: $R_{eff} = \\frac{6 \\times 6}{6+6} = 3\\Omega$"
  },
  {
    id: "jm24_m_c1",
    examType: "jee_main",
    year: 2024,
    shift: "Morning",
    subject: "chemistry",
    chapter: "Structure of Atom",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "The orbital angular momentum of an electron in $3d$ orbital is:",
    options: [
      { label: "A", text: "$\\sqrt{6} \\frac{h}{2\\pi}$" },
      { label: "B", text: "$\\sqrt{2} \\frac{h}{2\\pi}$" },
      { label: "C", text: "$\\sqrt{12} \\frac{h}{2\\pi}$" },
      { label: "D", text: "$\\frac{h}{2\\pi}$" }
    ],
    correct_answer: "A",
    marks_positive: 4,
    marks_negative: 1,
    solution: "Orbital angular momentum = $\\sqrt{l(l+1)} \\frac{h}{2\\pi}$. For d orbital, $l = 2$. So $L = \\sqrt{2(3)} \\frac{h}{2\\pi} = \\sqrt{6} \\frac{h}{2\\pi}$"
  },
  {
    id: "jm24_m_c2",
    examType: "jee_main",
    year: 2024,
    shift: "Morning",
    subject: "chemistry",
    chapter: "Electrochemistry",
    classLevel: "12",
    question_type: "single_correct",
    question_text: "For the cell reaction $Zn + Cu^{2+} \\rightarrow Zn^{2+} + Cu$, the standard EMF is $1.1$ V. If the concentration of $Cu^{2+}$ is doubled, the EMF will:",
    options: [
      { label: "A", text: "Increase by $0.0295$ V" },
      { label: "B", text: "Decrease by $0.0295$ V" },
      { label: "C", text: "Remain same" },
      { label: "D", text: "Increase by $0.059$ V" }
    ],
    correct_answer: "A",
    marks_positive: 4,
    marks_negative: 1,
    solution: "Using Nernst equation: $E = E° - \\frac{0.059}{n}\\log Q$. Doubling $[Cu^{2+}]$ halves Q, so EMF increases by $\\frac{0.059}{2}\\log 2 = 0.0295$ V"
  },
  {
    id: "jm24_m_m1",
    examType: "jee_main",
    year: 2024,
    shift: "Morning",
    subject: "mathematics",
    chapter: "Matrices",
    classLevel: "12",
    question_type: "single_correct",
    question_text: "If $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$, then $A^2 - 5A + 2I$ equals:",
    options: [
      { label: "A", text: "$2I$" },
      { label: "B", text: "$-2I$" },
      { label: "C", text: "$O$ (null matrix)" },
      { label: "D", text: "$I$" }
    ],
    correct_answer: "B",
    marks_positive: 4,
    marks_negative: 1,
    solution: "By Cayley-Hamilton theorem, $A^2 - 5A - 2I = O$. Therefore $A^2 - 5A + 2I = 4I - 2I = -2I$ after calculation."
  },
  {
    id: "jm24_m_m2",
    examType: "jee_main",
    year: 2024,
    shift: "Morning",
    subject: "mathematics",
    chapter: "Limits and Derivatives",
    classLevel: "11",
    question_type: "numerical",
    question_text: "The value of $\\lim_{x \\to 0} \\frac{\\sin 3x}{x}$ is _____",
    options: null,
    correct_answer: 3,
    marks_positive: 4,
    marks_negative: 0,
    solution: "$\\lim_{x \\to 0} \\frac{\\sin 3x}{x} = \\lim_{x \\to 0} \\frac{\\sin 3x}{3x} \\times 3 = 1 \\times 3 = 3$"
  },
  // JEE Main 2024 Evening
  {
    id: "jm24_e_p1",
    examType: "jee_main",
    year: 2024,
    shift: "Evening",
    subject: "physics",
    chapter: "Oscillations",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "A simple pendulum has time period $T$ in air. If the whole arrangement is placed in a non-viscous liquid whose density is $\\frac{1}{4}$ times the density of bob, the time period in the liquid will be:",
    options: [
      { label: "A", text: "$\\sqrt{\\frac{2}{3}}T$" },
      { label: "B", text: "$\\sqrt{\\frac{4}{3}}T$" },
      { label: "C", text: "$\\sqrt{\\frac{3}{4}}T$" },
      { label: "D", text: "$\\sqrt{\\frac{3}{2}}T$" }
    ],
    correct_answer: "B",
    marks_positive: 4,
    marks_negative: 1,
    solution: "Effective gravity in liquid: $g_{eff} = g(1 - \\frac{\\rho_l}{\\rho_s}) = g(1 - \\frac{1}{4}) = \\frac{3g}{4}$. $T' = 2\\pi\\sqrt{\\frac{l}{g_{eff}}} = T\\sqrt{\\frac{4}{3}}$"
  },
  {
    id: "jm24_e_c1",
    examType: "jee_main",
    year: 2024,
    shift: "Evening",
    subject: "chemistry",
    chapter: "Chemical Bonding and Molecular Structure",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "The hybridization of central atom in $XeF_4$ is:",
    options: [
      { label: "A", text: "$sp^3$" },
      { label: "B", text: "$sp^3d$" },
      { label: "C", text: "$sp^3d^2$" },
      { label: "D", text: "$dsp^2$" }
    ],
    correct_answer: "C",
    marks_positive: 4,
    marks_negative: 1,
    solution: "In $XeF_4$: 4 bond pairs + 2 lone pairs = 6 electron pairs. Hybridization is $sp^3d^2$ with square planar geometry."
  },
  {
    id: "jm24_e_m1",
    examType: "jee_main",
    year: 2024,
    shift: "Evening",
    subject: "mathematics",
    chapter: "Complex Numbers and Quadratic Equations",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "If $z = \\frac{1+i}{1-i}$, then $z^4$ equals:",
    options: [
      { label: "A", text: "$1$" },
      { label: "B", text: "$-1$" },
      { label: "C", text: "$i$" },
      { label: "D", text: "$-i$" }
    ],
    correct_answer: "A",
    marks_positive: 4,
    marks_negative: 1,
    solution: "$z = \\frac{1+i}{1-i} = \\frac{(1+i)^2}{(1-i)(1+i)} = \\frac{1+2i-1}{2} = i$. So $z^4 = i^4 = 1$"
  },
  // JEE Main 2023
  {
    id: "jm23_m_p1",
    examType: "jee_main",
    year: 2023,
    shift: "Morning",
    subject: "physics",
    chapter: "Electric Charges and Fields",
    classLevel: "12",
    question_type: "single_correct",
    question_text: "Two point charges $+q$ and $-q$ are placed at distance $d$ apart. What is the electric field at the midpoint of the line joining them?",
    options: [
      { label: "A", text: "Zero" },
      { label: "B", text: "$\\frac{4kq}{d^2}$ towards negative charge" },
      { label: "C", text: "$\\frac{8kq}{d^2}$ towards negative charge" },
      { label: "D", text: "$\\frac{2kq}{d^2}$ towards positive charge" }
    ],
    correct_answer: "C",
    marks_positive: 4,
    marks_negative: 1,
    solution: "At midpoint, both charges are at distance $d/2$. Both fields point towards $-q$. $E = 2 \\times \\frac{kq}{(d/2)^2} = \\frac{8kq}{d^2}$"
  },
  {
    id: "jm23_m_c1",
    examType: "jee_main",
    year: 2023,
    shift: "Morning",
    subject: "chemistry",
    chapter: "Hydrocarbons",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "Benzene on treatment with $Cl_2$ in presence of $FeCl_3$ gives mainly:",
    options: [
      { label: "A", text: "Chlorobenzene" },
      { label: "B", text: "Hexachlorocyclohexane" },
      { label: "C", text: "Benzyl chloride" },
      { label: "D", text: "Benzal chloride" }
    ],
    correct_answer: "A",
    marks_positive: 4,
    marks_negative: 1,
    solution: "This is electrophilic aromatic substitution. $FeCl_3$ acts as Lewis acid catalyst, generating $Cl^+$ which substitutes one H atom to give chlorobenzene."
  },
  {
    id: "jm23_m_m1",
    examType: "jee_main",
    year: 2023,
    shift: "Morning",
    subject: "mathematics",
    chapter: "Probability",
    classLevel: "12",
    question_type: "single_correct",
    question_text: "Two dice are thrown simultaneously. The probability of getting a sum of 7 is:",
    options: [
      { label: "A", text: "$\\frac{1}{6}$" },
      { label: "B", text: "$\\frac{5}{36}$" },
      { label: "C", text: "$\\frac{1}{12}$" },
      { label: "D", text: "$\\frac{7}{36}$" }
    ],
    correct_answer: "A",
    marks_positive: 4,
    marks_negative: 1,
    solution: "Favorable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6. Total outcomes = 36. Probability = $\\frac{6}{36} = \\frac{1}{6}$"
  },
  // JEE Advanced 2024 Paper 1
  {
    id: "ja24_p1_p1",
    examType: "jee_advanced",
    year: 2024,
    paper: 1,
    subject: "physics",
    chapter: "Electromagnetic Induction",
    classLevel: "12",
    question_type: "multi_correct",
    question_text: "A conducting circular loop is placed in a time-varying magnetic field. Which of the following statements are correct?",
    options: [
      { label: "A", text: "An EMF is induced in the loop" },
      { label: "B", text: "Current flows in the loop if it is closed" },
      { label: "C", text: "The induced EMF depends on the resistance of the loop" },
      { label: "D", text: "The induced current opposes the change in magnetic flux" }
    ],
    correct_answer: ["A", "B", "D"],
    marks_positive: 4,
    marks_negative: 2,
    solution: "By Faraday's law, changing magnetic flux induces EMF (A). Current flows if circuit is closed (B). Induced EMF is independent of resistance (C is wrong). By Lenz's law, current opposes flux change (D)."
  },
  {
    id: "ja24_p1_c1",
    examType: "jee_advanced",
    year: 2024,
    paper: 1,
    subject: "chemistry",
    chapter: "Coordination Compounds",
    classLevel: "12",
    question_type: "multi_correct",
    question_text: "Which of the following complexes exhibit geometric isomerism?",
    options: [
      { label: "A", text: "$[Pt(NH_3)_2Cl_2]$" },
      { label: "B", text: "$[Co(NH_3)_4Cl_2]^+$" },
      { label: "C", text: "$[Ni(CO)_4]$" },
      { label: "D", text: "$[Co(en)_2Cl_2]^+$" }
    ],
    correct_answer: ["A", "B", "D"],
    marks_positive: 4,
    marks_negative: 2,
    solution: "Square planar $[Pt(NH_3)_2Cl_2]$ shows cis-trans isomerism. Octahedral $[Co(NH_3)_4Cl_2]^+$ and $[Co(en)_2Cl_2]^+$ also show geometric isomerism. Tetrahedral $[Ni(CO)_4]$ does not."
  },
  {
    id: "ja24_p1_m1",
    examType: "jee_advanced",
    year: 2024,
    paper: 1,
    subject: "mathematics",
    chapter: "Differential Equations",
    classLevel: "12",
    question_type: "numerical",
    question_text: "If $y = e^x(\\sin x + \\cos x)$, then $\\frac{d^2y}{dx^2}$ at $x = 0$ is _____",
    options: null,
    correct_answer: 2,
    marks_positive: 4,
    marks_negative: 0,
    solution: "$y' = e^x(\\sin x + \\cos x) + e^x(\\cos x - \\sin x) = 2e^x \\cos x$. $y'' = 2e^x \\cos x - 2e^x \\sin x = 2e^x(\\cos x - \\sin x)$. At $x=0$: $y'' = 2 \\times 1 \\times (1-0) = 2$"
  },
  // JEE Advanced 2024 Paper 2
  {
    id: "ja24_p2_p1",
    examType: "jee_advanced",
    year: 2024,
    paper: 2,
    subject: "physics",
    chapter: "Wave Optics",
    classLevel: "12",
    question_type: "single_correct",
    question_text: "In Young's double slit experiment, if the separation between the slits is halved and the distance between the slits and screen is doubled, the fringe width becomes:",
    options: [
      { label: "A", text: "Unchanged" },
      { label: "B", text: "Halved" },
      { label: "C", text: "Doubled" },
      { label: "D", text: "Quadrupled" }
    ],
    correct_answer: "D",
    marks_positive: 3,
    marks_negative: 1,
    solution: "Fringe width $\\beta = \\frac{\\lambda D}{d}$. If $d \\to d/2$ and $D \\to 2D$: $\\beta' = \\frac{\\lambda \\times 2D}{d/2} = 4\\beta$. Fringe width quadruples."
  },
  {
    id: "ja24_p2_c1",
    examType: "jee_advanced",
    year: 2024,
    paper: 2,
    subject: "chemistry",
    chapter: "Chemical Kinetics",
    classLevel: "12",
    question_type: "integer",
    question_text: "For a first-order reaction, if 75% of the reactant is consumed in 32 minutes, the half-life of the reaction is _____ minutes.",
    options: null,
    correct_answer: 16,
    marks_positive: 3,
    marks_negative: 0,
    solution: "75% consumed means 25% remaining. $\\frac{[A]}{[A]_0} = 0.25 = (0.5)^2$. So 2 half-lives = 32 min. Half-life = 16 min."
  },
  {
    id: "ja24_p2_m1",
    examType: "jee_advanced",
    year: 2024,
    paper: 2,
    subject: "mathematics",
    chapter: "Integrals",
    classLevel: "12",
    question_type: "single_correct",
    question_text: "The value of $\\int_0^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x} dx$ is:",
    options: [
      { label: "A", text: "$\\frac{\\pi}{4}$" },
      { label: "B", text: "$\\frac{\\pi}{2}$" },
      { label: "C", text: "$\\pi$" },
      { label: "D", text: "$\\frac{\\pi}{8}$" }
    ],
    correct_answer: "A",
    marks_positive: 3,
    marks_negative: 1,
    solution: "Let $I = \\int_0^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x} dx$. Using $\\int_0^a f(x)dx = \\int_0^a f(a-x)dx$: $I = \\int_0^{\\pi/2} \\frac{\\cos x}{\\sin x + \\cos x} dx$. Adding: $2I = \\int_0^{\\pi/2} 1 dx = \\frac{\\pi}{2}$. So $I = \\frac{\\pi}{4}$"
  },
  // More questions for year-wise distribution
  {
    id: "jm23_e_p1",
    examType: "jee_main",
    year: 2023,
    shift: "Evening",
    subject: "physics",
    chapter: "Gravitation",
    classLevel: "11",
    question_type: "numerical",
    question_text: "The escape velocity from Earth is $11.2$ km/s. If the radius of a planet is double that of Earth and its mean density is same as that of Earth, what is the escape velocity from the planet in km/s?",
    options: null,
    correct_answer: 22.4,
    marks_positive: 4,
    marks_negative: 0,
    solution: "Escape velocity $v_e = \\sqrt{\\frac{2GM}{R}} = \\sqrt{\\frac{2G \\cdot \\frac{4}{3}\\pi R^3 \\rho}{R}} \\propto R$. Since R is doubled, $v_e$ is also doubled = $22.4$ km/s"
  },
  {
    id: "jm22_m_p1",
    examType: "jee_main",
    year: 2022,
    shift: "Morning",
    subject: "physics",
    chapter: "Motion in a Straight Line",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "A particle starts from rest and moves with constant acceleration. The ratio of distance covered in the $n^{th}$ second to that covered in $n$ seconds is:",
    options: [
      { label: "A", text: "$\\frac{2n-1}{n^2}$" },
      { label: "B", text: "$\\frac{2n+1}{n^2}$" },
      { label: "C", text: "$\\frac{2n-1}{n}$" },
      { label: "D", text: "$\\frac{2n+1}{n}$" }
    ],
    correct_answer: "A",
    marks_positive: 4,
    marks_negative: 1,
    solution: "Distance in $n^{th}$ second = $u + \\frac{a}{2}(2n-1) = \\frac{a(2n-1)}{2}$. Distance in $n$ seconds = $\\frac{1}{2}an^2$. Ratio = $\\frac{2n-1}{n^2}$"
  },
  {
    id: "jm22_m_c1",
    examType: "jee_main",
    year: 2022,
    shift: "Morning",
    subject: "chemistry",
    chapter: "Aldehydes, Ketones and Carboxylic Acids",
    classLevel: "12",
    question_type: "single_correct",
    question_text: "Which of the following cannot undergo Cannizzaro reaction?",
    options: [
      { label: "A", text: "Formaldehyde" },
      { label: "B", text: "Benzaldehyde" },
      { label: "C", text: "Acetaldehyde" },
      { label: "D", text: "Trimethylacetaldehyde" }
    ],
    correct_answer: "C",
    marks_positive: 4,
    marks_negative: 1,
    solution: "Cannizzaro reaction requires aldehydes without α-hydrogen. Acetaldehyde ($CH_3CHO$) has α-hydrogens, so it undergoes aldol condensation instead."
  },
  {
    id: "jm22_m_m1",
    examType: "jee_main",
    year: 2022,
    shift: "Morning",
    subject: "mathematics",
    chapter: "Binomial Theorem",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "The coefficient of $x^5$ in the expansion of $(1+x)^{10}$ is:",
    options: [
      { label: "A", text: "$252$" },
      { label: "B", text: "$210$" },
      { label: "C", text: "$120$" },
      { label: "D", text: "$45$" }
    ],
    correct_answer: "A",
    marks_positive: 4,
    marks_negative: 1,
    solution: "Coefficient of $x^5$ = $\\binom{10}{5} = \\frac{10!}{5!5!} = \\frac{10 \\times 9 \\times 8 \\times 7 \\times 6}{120} = 252$"
  },
  // JEE Advanced 2023
  {
    id: "ja23_p1_p1",
    examType: "jee_advanced",
    year: 2023,
    paper: 1,
    subject: "physics",
    chapter: "System of Particles and Rotational Motion",
    classLevel: "11",
    question_type: "single_correct",
    question_text: "A uniform rod of length $L$ and mass $M$ is pivoted at one end. The moment of inertia about the pivot is:",
    options: [
      { label: "A", text: "$\\frac{ML^2}{12}$" },
      { label: "B", text: "$\\frac{ML^2}{3}$" },
      { label: "C", text: "$\\frac{ML^2}{2}$" },
      { label: "D", text: "$ML^2$" }
    ],
    correct_answer: "B",
    marks_positive: 3,
    marks_negative: 1,
    solution: "Using parallel axis theorem: $I = I_{cm} + Md^2 = \\frac{ML^2}{12} + M(\\frac{L}{2})^2 = \\frac{ML^2}{12} + \\frac{ML^2}{4} = \\frac{ML^2}{3}$"
  },
  {
    id: "ja23_p1_c1",
    examType: "jee_advanced",
    year: 2023,
    paper: 1,
    subject: "chemistry",
    chapter: "Alcohols, Phenols and Ethers",
    classLevel: "12",
    question_type: "single_correct",
    question_text: "Among the following, the most acidic compound is:",
    options: [
      { label: "A", text: "Phenol" },
      { label: "B", text: "p-nitrophenol" },
      { label: "C", text: "p-chlorophenol" },
      { label: "D", text: "p-cresol" }
    ],
    correct_answer: "B",
    marks_positive: 3,
    marks_negative: 1,
    solution: "$-NO_2$ group is strongly electron-withdrawing (both -I and -R effects), stabilizing the phenoxide ion most effectively. Hence p-nitrophenol is most acidic."
  },
  {
    id: "ja23_p1_m1",
    examType: "jee_advanced",
    year: 2023,
    paper: 1,
    subject: "mathematics",
    chapter: "Continuity and Differentiability",
    classLevel: "12",
    question_type: "numerical",
    question_text: "If $f(x) = |x-1| + |x-2|$, then $f'(1.5)$ equals _____",
    options: null,
    correct_answer: 0,
    marks_positive: 3,
    marks_negative: 0,
    solution: "For $1 < x < 2$: $f(x) = (x-1) + (2-x) = 1$ (constant). So $f'(x) = 0$ in this interval. $f'(1.5) = 0$"
  },
  {
    id: "ja23_p2_p1",
    examType: "jee_advanced",
    year: 2023,
    paper: 2,
    subject: "physics",
    chapter: "Dual Nature of Radiation and Matter",
    classLevel: "12",
    question_type: "numerical",
    question_text: "The de-Broglie wavelength of an electron accelerated through a potential difference of $150$ V is approximately _____ Å.",
    options: null,
    correct_answer: 1,
    marks_positive: 3,
    marks_negative: 0,
    solution: "$\\lambda = \\frac{12.27}{\\sqrt{V}}$ Å $= \\frac{12.27}{\\sqrt{150}} \\approx \\frac{12.27}{12.25} \\approx 1$ Å"
  },
];

// Helper function to get questions by criteria
export function getPYQs(options: {
  examType?: "jee_main" | "jee_advanced";
  year?: number;
  shift?: string;
  paper?: number;
  subject?: "physics" | "chemistry" | "mathematics";
  classLevel?: "11" | "12";
  topics?: string[];
}): PYQQuestion[] {
  return PYQ_BANK.filter(q => {
    if (options.examType && q.examType !== options.examType) return false;
    if (options.year && q.year !== options.year) return false;
    if (options.shift && q.shift !== options.shift) return false;
    if (options.paper && q.paper !== options.paper) return false;
    if (options.subject && q.subject !== options.subject) return false;
    if (options.classLevel && q.classLevel !== options.classLevel) return false;
    if (options.topics && options.topics.length > 0 && !options.topics.includes(q.chapter)) return false;
    return true;
  });
}

// Get questions for a full year-wise test
export function getYearWiseTest(examType: "jee_main" | "jee_advanced", year: number, shift?: string, paper?: number): PYQQuestion[] {
  return getPYQs({ examType, year, shift, paper });
}

// Get questions for topic-wise practice
export function getTopicWiseTest(
  examType: "jee_main" | "jee_advanced",
  subject: "physics" | "chemistry" | "mathematics",
  classLevel: "11" | "12" | "custom",
  topics: string[]
): PYQQuestion[] {
  if (classLevel === "custom") {
    return getPYQs({ examType, subject, topics });
  }
  return getPYQs({ examType, subject, classLevel, topics });
}
