/**
 * JEE Official Previous Year Questions (PYQ) Bank
 * 
 * IMPORTANT SOURCE POLICY:
 * - All questions MUST be sourced ONLY from official NTA/IIT released papers
 * - Questions without verified official sources are NOT included
 * - Solutions may be from trusted online sources (clearly marked)
 * - Accuracy > Quantity - fewer papers with 100% authenticity
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
  // Source verification metadata
  sourceVerified: boolean;
  officialSource: string; // e.g., "NTA JEE Main 2024 Jan 27 Shift 1", "IIT-M JEE Advanced 2024 Paper 1"
  solutionSource?: string; // e.g., "Allen Solutions", "Resonance", "Community verified"
}

// Available years with VERIFIED official papers only
export const JEE_MAIN_VERIFIED_PAPERS: { year: number; shifts: string[] }[] = [
  // Only include years where we have verified official papers
  // Currently: NO verified official papers loaded
  // This will be populated as official papers are verified and added
];

export const JEE_ADVANCED_VERIFIED_PAPERS: { year: number; papers: number[] }[] = [
  // Only include years where we have verified official papers
  // Currently: NO verified official papers loaded
  // This will be populated as official papers are verified and added
];

// Legacy years for display (but may not have verified papers)
export const JEE_MAIN_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
export const JEE_MAIN_SHIFTS = ["Morning", "Evening"];
export const JEE_ADVANCED_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
export const JEE_ADVANCED_PAPERS = [1, 2];

// Check if a paper has verified official questions
export function isPaperVerified(
  examType: "jee_main" | "jee_advanced",
  year: number,
  shiftOrPaper?: string | number
): boolean {
  if (examType === "jee_main") {
    const paper = JEE_MAIN_VERIFIED_PAPERS.find(p => p.year === year);
    if (!paper) return false;
    if (shiftOrPaper && !paper.shifts.includes(shiftOrPaper as string)) return false;
    return true;
  } else {
    const paper = JEE_ADVANCED_VERIFIED_PAPERS.find(p => p.year === year);
    if (!paper) return false;
    if (shiftOrPaper && !paper.papers.includes(shiftOrPaper as number)) return false;
    return true;
  }
}

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

/**
 * OFFICIAL PYQ BANK
 * 
 * IMPORTANT: This bank is currently EMPTY because we only include
 * questions from VERIFIED official sources.
 * 
 * To add questions:
 * 1. Source MUST be official NTA/IIT released question papers
 * 2. Each question MUST have sourceVerified: true
 * 3. Each question MUST have officialSource with exact paper reference
 * 4. Solutions can be from trusted sources (marked in solutionSource)
 * 
 * DO NOT add questions from:
 * - Coaching websites
 * - Memory-based reconstructions  
 * - "Compiled PYQ" blogs
 * - Modified or reformatted question banks
 */
export const PYQ_BANK: PYQQuestion[] = [
  // CURRENTLY EMPTY - Only verified official PYQs will be added here
  // Accuracy > Quantity
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
  // Only return verified questions
  return PYQ_BANK.filter(q => {
    if (!q.sourceVerified) return false; // CRITICAL: Only verified questions
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

// Check if questions are available for a specific selection
export function hasQuestionsAvailable(options: {
  examType: "jee_main" | "jee_advanced";
  year?: number;
  shift?: string;
  paper?: number;
  subject?: "physics" | "chemistry" | "mathematics";
  classLevel?: "11" | "12";
  topics?: string[];
}): boolean {
  const questions = getPYQs(options);
  return questions.length > 0;
}

// Get unavailable paper message
export function getUnavailableMessage(
  examType: "jee_main" | "jee_advanced",
  year?: number,
  shift?: string,
  paper?: number
): string {
  const examName = examType === "jee_main" ? "JEE Main" : "JEE Advanced";
  let paperRef = examName;
  
  if (year) {
    paperRef += ` ${year}`;
    if (shift) paperRef += ` ${shift} Shift`;
    if (paper) paperRef += ` Paper ${paper}`;
  }
  
  return `Official question data for ${paperRef} is currently unavailable. We only include questions from verified official sources to ensure 100% authenticity.`;
}

// Get questions for a full year-wise test
export function getYearWiseTest(
  examType: "jee_main" | "jee_advanced", 
  year: number, 
  shift?: string, 
  paper?: number
): { questions: PYQQuestion[]; isAvailable: boolean; message?: string } {
  const questions = getPYQs({ examType, year, shift, paper });
  
  if (questions.length === 0) {
    return {
      questions: [],
      isAvailable: false,
      message: getUnavailableMessage(examType, year, shift, paper)
    };
  }
  
  return {
    questions,
    isAvailable: true
  };
}

// Get questions for topic-wise practice
export function getTopicWiseTest(
  examType: "jee_main" | "jee_advanced",
  subject: "physics" | "chemistry" | "mathematics",
  classLevel: "11" | "12" | "custom",
  topics: string[]
): { questions: PYQQuestion[]; isAvailable: boolean; message?: string } {
  const options: Parameters<typeof getPYQs>[0] = {
    examType,
    subject,
    topics
  };
  
  if (classLevel !== "custom") {
    options.classLevel = classLevel;
  }
  
  const questions = getPYQs(options);
  
  if (questions.length === 0) {
    return {
      questions: [],
      isAvailable: false,
      message: `Official PYQ data for the selected topics is currently unavailable. We only include questions from verified official sources to ensure 100% authenticity.`
    };
  }
  
  return {
    questions,
    isAvailable: true
  };
}
