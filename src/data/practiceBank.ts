/**
 * Practice Question Bank for JEE Main & Advanced Type Tests
 * 
 * IMPORTANT: These are PRACTICE questions, NOT official PYQs.
 * Questions are curated for concept relevance, difficulty match, and quality.
 * Source does not matter — quality and uniqueness do.
 */

export interface PracticeQuestion {
  id: string;
  subject: "physics" | "chemistry" | "mathematics";
  chapter: string;
  classLevel: "11" | "12";
  question_type: "single_correct" | "multi_correct" | "numerical" | "integer";
  question_text: string;
  options: { label: string; text: string }[] | null;
  correct_answer: string | string[] | number;
  marks_positive: number;
  marks_negative: number;
  solution: string | null;
  diagram_url?: string;
  difficulty: "main" | "advanced"; // JEE Main level or JEE Advanced level
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

// Topics by subject for selection UI
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
 * PRACTICE QUESTION BANK
 * Curated for quality, concept relevance, and difficulty matching.
 */
export const PRACTICE_BANK: PracticeQuestion[] = [
  // ==================== PHYSICS ====================
  // Class 11 - Laws of Motion
  {
    id: "ph_001", subject: "physics", chapter: "Laws of Motion", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "A block of mass $m$ is placed on a smooth inclined plane of inclination $\\theta$. The force exerted by the plane on the block has a magnitude:",
    options: [{ label: "A", text: "$mg$" }, { label: "B", text: "$mg \\cos\\theta$" }, { label: "C", text: "$mg \\sin\\theta$" }, { label: "D", text: "$mg \\tan\\theta$" }],
    correct_answer: "B",
    solution: "On a smooth inclined plane, the normal force equals the component of weight perpendicular to the surface: $N = mg\\cos\\theta$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_001b", subject: "physics", chapter: "Laws of Motion", classLevel: "11",
    question_type: "single_correct", difficulty: "advanced",
    question_text: "Two blocks of masses $m_1$ and $m_2$ ($m_1 > m_2$) are connected by a light inextensible string passing over a smooth pulley. The acceleration of the system is:",
    options: [{ label: "A", text: "$\\frac{(m_1 - m_2)g}{m_1 + m_2}$" }, { label: "B", text: "$\\frac{(m_1 + m_2)g}{m_1 - m_2}$" }, { label: "C", text: "$\\frac{m_1 g}{m_2}$" }, { label: "D", text: "$\\frac{m_2 g}{m_1}$" }],
    correct_answer: "A",
    solution: "For Atwood machine: net force = $(m_1 - m_2)g$, total mass = $m_1 + m_2$. So $a = \\frac{(m_1 - m_2)g}{m_1 + m_2}$",
    marks_positive: 4, marks_negative: 1
  },
  // Class 11 - Work, Energy and Power
  {
    id: "ph_002", subject: "physics", chapter: "Work, Energy and Power", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "A body of mass $2$ kg is thrown up vertically with kinetic energy of $490$ J. The height at which the kinetic energy becomes half is $(g = 9.8$ m/s²$)$:",
    options: [{ label: "A", text: "$12.5$ m" }, { label: "B", text: "$25$ m" }, { label: "C", text: "$50$ m" }, { label: "D", text: "$10$ m" }],
    correct_answer: "A",
    solution: "Initial KE = 490 J. When KE becomes half (245 J), lost KE = 245 J = mgh. So $h = \\frac{245}{2 \\times 9.8} = 12.5$ m",
    marks_positive: 4, marks_negative: 1
  },
  // Class 11 - Gravitation
  {
    id: "ph_003", subject: "physics", chapter: "Gravitation", classLevel: "11",
    question_type: "numerical", difficulty: "main",
    question_text: "The escape velocity from Earth is $11.2$ km/s. If the radius of a planet is double that of Earth and its mean density is same as that of Earth, what is the escape velocity from the planet in km/s?",
    options: null, correct_answer: 22.4,
    solution: "Escape velocity $v_e \\propto R$ when density is constant. Since R is doubled, $v_e$ is also doubled = $22.4$ km/s",
    marks_positive: 4, marks_negative: 0
  },
  // Class 11 - Motion in a Straight Line
  {
    id: "ph_004", subject: "physics", chapter: "Motion in a Straight Line", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "A particle starts from rest and moves with constant acceleration. The ratio of distance covered in the $n^{th}$ second to that covered in $n$ seconds is:",
    options: [{ label: "A", text: "$\\frac{2n-1}{n^2}$" }, { label: "B", text: "$\\frac{2n+1}{n^2}$" }, { label: "C", text: "$\\frac{2n-1}{n}$" }, { label: "D", text: "$\\frac{2n+1}{n}$" }],
    correct_answer: "A",
    solution: "Distance in $n^{th}$ second = $\\frac{a(2n-1)}{2}$. Distance in $n$ seconds = $\\frac{1}{2}an^2$. Ratio = $\\frac{2n-1}{n^2}$",
    marks_positive: 4, marks_negative: 1
  },
  // Class 11 - Rotational Motion
  {
    id: "ph_005", subject: "physics", chapter: "System of Particles and Rotational Motion", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "A uniform rod of length $L$ and mass $M$ is pivoted at one end. The moment of inertia about the pivot is:",
    options: [{ label: "A", text: "$\\frac{ML^2}{12}$" }, { label: "B", text: "$\\frac{ML^2}{3}$" }, { label: "C", text: "$\\frac{ML^2}{2}$" }, { label: "D", text: "$ML^2$" }],
    correct_answer: "B",
    solution: "Using parallel axis theorem: $I = I_{cm} + Md^2 = \\frac{ML^2}{12} + M(\\frac{L}{2})^2 = \\frac{ML^2}{3}$",
    marks_positive: 4, marks_negative: 1
  },
  // Class 11 - Thermodynamics
  {
    id: "ph_011", subject: "physics", chapter: "Thermodynamics", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "In an isothermal process for an ideal gas, which quantity remains constant?",
    options: [{ label: "A", text: "Pressure" }, { label: "B", text: "Volume" }, { label: "C", text: "Temperature" }, { label: "D", text: "Internal energy and temperature" }],
    correct_answer: "D",
    solution: "In isothermal process, temperature is constant. For ideal gas, internal energy depends only on temperature, so both remain constant.",
    marks_positive: 4, marks_negative: 1
  },
  // Class 11 - Oscillations
  {
    id: "ph_012", subject: "physics", chapter: "Oscillations", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "The time period of a simple pendulum is $T$. If its length is increased by 21%, the new time period will be:",
    options: [{ label: "A", text: "$1.1T$" }, { label: "B", text: "$1.21T$" }, { label: "C", text: "$0.9T$" }, { label: "D", text: "$1.05T$" }],
    correct_answer: "A",
    solution: "$T \\propto \\sqrt{l}$. New length = 1.21l. $T' = T\\sqrt{1.21} = 1.1T$",
    marks_positive: 4, marks_negative: 1
  },
  // Class 11 - Waves
  {
    id: "ph_013", subject: "physics", chapter: "Waves", classLevel: "11",
    question_type: "numerical", difficulty: "main",
    question_text: "A string vibrates with frequency 200 Hz. If the velocity of wave is 400 m/s, the wavelength is _____ m.",
    options: null, correct_answer: 2,
    solution: "$\\lambda = \\frac{v}{f} = \\frac{400}{200} = 2$ m",
    marks_positive: 4, marks_negative: 0
  },
  // Class 11 - Motion in a Plane
  {
    id: "ph_016", subject: "physics", chapter: "Motion in a Plane", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "A projectile is launched at 60° to the horizontal with speed $u$. The range is:",
    options: [{ label: "A", text: "$\\frac{u^2 \\sin 120°}{g}$" }, { label: "B", text: "$\\frac{u^2}{g}$" }, { label: "C", text: "$\\frac{u^2 \\sqrt{3}}{2g}$" }, { label: "D", text: "$\\frac{u^2}{2g}$" }],
    correct_answer: "A",
    solution: "Range $R = \\frac{u^2 \\sin 2\\theta}{g} = \\frac{u^2 \\sin 120°}{g}$",
    marks_positive: 4, marks_negative: 1
  },
  // Class 11 - Kinetic Theory
  {
    id: "ph_017", subject: "physics", chapter: "Kinetic Theory", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "The average kinetic energy of a gas molecule at temperature $T$ is:",
    options: [{ label: "A", text: "$\\frac{1}{2}kT$" }, { label: "B", text: "$kT$" }, { label: "C", text: "$\\frac{3}{2}kT$" }, { label: "D", text: "$\\frac{5}{2}kT$" }],
    correct_answer: "C",
    solution: "Average KE per molecule = $\\frac{3}{2}kT$ where $k$ is Boltzmann constant.",
    marks_positive: 4, marks_negative: 1
  },
  // Class 11 - Mechanical Properties of Fluids
  {
    id: "ph_018", subject: "physics", chapter: "Mechanical Properties of Fluids", classLevel: "11",
    question_type: "numerical", difficulty: "main",
    question_text: "A hydraulic lift has pistons of cross-sectional areas $10$ cm² and $200$ cm². A force of $50$ N is applied on the smaller piston. The force on the larger piston in N is:",
    options: null, correct_answer: 1000,
    solution: "By Pascal's law: $\\frac{F_1}{A_1} = \\frac{F_2}{A_2}$. $F_2 = \\frac{50 \\times 200}{10} = 1000$ N",
    marks_positive: 4, marks_negative: 0
  },
  // Class 12 - Electric Charges and Fields
  {
    id: "ph_006", subject: "physics", chapter: "Electric Charges and Fields", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "Two point charges $+q$ and $-q$ are placed at distance $d$ apart. The electric field at the midpoint is:",
    options: [{ label: "A", text: "Zero" }, { label: "B", text: "$\\frac{4kq}{d^2}$ towards $-q$" }, { label: "C", text: "$\\frac{8kq}{d^2}$ towards $-q$" }, { label: "D", text: "$\\frac{2kq}{d^2}$ towards $+q$" }],
    correct_answer: "C",
    solution: "At midpoint, both fields point towards $-q$. $E = 2 \\times \\frac{kq}{(d/2)^2} = \\frac{8kq}{d^2}$",
    marks_positive: 4, marks_negative: 1
  },
  // Class 12 - Current Electricity
  {
    id: "ph_007", subject: "physics", chapter: "Current Electricity", classLevel: "12",
    question_type: "numerical", difficulty: "main",
    question_text: "A wire of resistance $12\\Omega$ is bent in the form of a circle. The effective resistance between two points on any diameter is _____ $\\Omega$.",
    options: null, correct_answer: 3,
    solution: "Each half has resistance $6\\Omega$. In parallel: $R_{eff} = \\frac{6 \\times 6}{12} = 3\\Omega$",
    marks_positive: 4, marks_negative: 0
  },
  // Class 12 - Electromagnetic Induction
  {
    id: "ph_008", subject: "physics", chapter: "Electromagnetic Induction", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "A conducting loop is in a uniform magnetic field. The induced EMF depends on:",
    options: [{ label: "A", text: "The magnetic field strength only" }, { label: "B", text: "The rate of change of magnetic flux" }, { label: "C", text: "The area of loop only" }, { label: "D", text: "The material of loop" }],
    correct_answer: "B",
    solution: "By Faraday's law, $\\varepsilon = -\\frac{d\\phi}{dt}$. The induced EMF depends on rate of change of magnetic flux.",
    marks_positive: 4, marks_negative: 1
  },
  // Class 12 - Ray Optics
  {
    id: "ph_009", subject: "physics", chapter: "Ray Optics and Optical Instruments", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "A convex lens of focal length 20 cm forms an image of an object placed at 30 cm from the lens. The image distance is:",
    options: [{ label: "A", text: "60 cm" }, { label: "B", text: "30 cm" }, { label: "C", text: "20 cm" }, { label: "D", text: "10 cm" }],
    correct_answer: "A",
    solution: "Using $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$: $\\frac{1}{v} - \\frac{1}{-30} = \\frac{1}{20}$, so $v = 60$ cm",
    marks_positive: 4, marks_negative: 1
  },
  // Class 12 - Dual Nature
  {
    id: "ph_010", subject: "physics", chapter: "Dual Nature of Radiation and Matter", classLevel: "12",
    question_type: "numerical", difficulty: "main",
    question_text: "The de-Broglie wavelength of an electron accelerated through 150 V is approximately _____ Å.",
    options: null, correct_answer: 1,
    solution: "$\\lambda = \\frac{12.27}{\\sqrt{V}}$ Å $= \\frac{12.27}{\\sqrt{150}} \\approx 1$ Å",
    marks_positive: 4, marks_negative: 0
  },
  // Class 12 - Moving Charges and Magnetism
  {
    id: "ph_014", subject: "physics", chapter: "Moving Charges and Magnetism", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "A charged particle enters a uniform magnetic field perpendicular to it. The particle will:",
    options: [{ label: "A", text: "Move in a straight line" }, { label: "B", text: "Move in a circular path" }, { label: "C", text: "Move in a helical path" }, { label: "D", text: "Come to rest" }],
    correct_answer: "B",
    solution: "When velocity is perpendicular to B, the Lorentz force provides centripetal acceleration, causing circular motion.",
    marks_positive: 4, marks_negative: 1
  },
  // Class 12 - Semiconductor Electronics
  {
    id: "ph_015", subject: "physics", chapter: "Semiconductor Electronics", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "In a p-n junction diode in forward bias, current flows due to:",
    options: [{ label: "A", text: "Drift of electrons only" }, { label: "B", text: "Diffusion of charge carriers" }, { label: "C", text: "Drift of holes only" }, { label: "D", text: "Electric field in depletion region" }],
    correct_answer: "B",
    solution: "In forward bias, the barrier potential decreases, allowing diffusion of majority carriers across the junction.",
    marks_positive: 4, marks_negative: 1
  },
  // Class 12 - Electrostatic Potential
  {
    id: "ph_019", subject: "physics", chapter: "Electrostatic Potential and Capacitance", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "Two capacitors of $4\\mu F$ and $6\\mu F$ are connected in series. The equivalent capacitance is:",
    options: [{ label: "A", text: "$10\\mu F$" }, { label: "B", text: "$2.4\\mu F$" }, { label: "C", text: "$5\\mu F$" }, { label: "D", text: "$24\\mu F$" }],
    correct_answer: "B",
    solution: "$\\frac{1}{C_{eq}} = \\frac{1}{4} + \\frac{1}{6} = \\frac{5}{12}$. So $C_{eq} = 2.4\\mu F$",
    marks_positive: 4, marks_negative: 1
  },
  // Class 12 - Wave Optics
  {
    id: "ph_020", subject: "physics", chapter: "Wave Optics", classLevel: "12",
    question_type: "single_correct", difficulty: "advanced",
    question_text: "In Young's double slit experiment, if one slit is covered, then:",
    options: [{ label: "A", text: "Fringes disappear, uniform intensity" }, { label: "B", text: "Fringe width doubles" }, { label: "C", text: "Diffraction pattern from single slit appears" }, { label: "D", text: "No light reaches screen" }],
    correct_answer: "C",
    solution: "Covering one slit eliminates interference. Single slit diffraction pattern is observed instead.",
    marks_positive: 4, marks_negative: 1
  },

  // ==================== CHEMISTRY ====================
  // Class 11
  {
    id: "ch_001", subject: "chemistry", chapter: "Some Basic Concepts of Chemistry", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "The number of significant figures in $0.00340$ is:",
    options: [{ label: "A", text: "2" }, { label: "B", text: "3" }, { label: "C", text: "4" }, { label: "D", text: "5" }],
    correct_answer: "B",
    solution: "Leading zeros are not significant. Trailing zeros after decimal are significant. So 3, 4, and 0 = 3 significant figures.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_002", subject: "chemistry", chapter: "Structure of Atom", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "The orbital angular momentum of an electron in $3d$ orbital is:",
    options: [{ label: "A", text: "$\\sqrt{6} \\frac{h}{2\\pi}$" }, { label: "B", text: "$\\sqrt{2} \\frac{h}{2\\pi}$" }, { label: "C", text: "$\\sqrt{12} \\frac{h}{2\\pi}$" }, { label: "D", text: "$\\frac{h}{2\\pi}$" }],
    correct_answer: "A",
    solution: "For d orbital, $l = 2$. Angular momentum = $\\sqrt{l(l+1)} \\frac{h}{2\\pi} = \\sqrt{6} \\frac{h}{2\\pi}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_003", subject: "chemistry", chapter: "Chemical Bonding and Molecular Structure", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "The hybridization of central atom in $XeF_4$ is:",
    options: [{ label: "A", text: "$sp^3$" }, { label: "B", text: "$sp^3d$" }, { label: "C", text: "$sp^3d^2$" }, { label: "D", text: "$dsp^2$" }],
    correct_answer: "C",
    solution: "In $XeF_4$: 4 bond pairs + 2 lone pairs = 6 electron pairs. Hybridization is $sp^3d^2$ with square planar geometry.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_004", subject: "chemistry", chapter: "Chemical Thermodynamics", classLevel: "11",
    question_type: "numerical", difficulty: "main",
    question_text: "For a reaction, $\\Delta H = -30$ kJ/mol and $\\Delta S = -100$ J/mol/K. The temperature above which the reaction becomes non-spontaneous is _____ K.",
    options: null, correct_answer: 300,
    solution: "At equilibrium: $T = \\frac{\\Delta H}{\\Delta S} = \\frac{30000}{100} = 300$ K",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ch_005", subject: "chemistry", chapter: "Equilibrium", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "For the reaction $2A \\rightleftharpoons B$, if $K_p = 4$ atm$^{-1}$, then:",
    options: [{ label: "A", text: "$K_c > K_p$" }, { label: "B", text: "$K_c < K_p$" }, { label: "C", text: "$K_c = K_p$" }, { label: "D", text: "Cannot be determined" }],
    correct_answer: "A",
    solution: "$K_p = K_c(RT)^{\\Delta n}$ where $\\Delta n = 1-2 = -1$. So $K_c = K_p \\times RT > K_p$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_006", subject: "chemistry", chapter: "Organic Chemistry Basic Principles", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "The IUPAC name of $(CH_3)_3CCH_2CH(CH_3)_2$ is:",
    options: [{ label: "A", text: "2,2,4-trimethylpentane" }, { label: "B", text: "2,4,4-trimethylpentane" }, { label: "C", text: "2,2,4-trimethylbutane" }, { label: "D", text: "2-neopentylpropane" }],
    correct_answer: "B",
    solution: "Numbering from end closest to first substituent: 2,4,4-trimethylpentane",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_007", subject: "chemistry", chapter: "Hydrocarbons", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "Benzene on treatment with $Cl_2$ in presence of $FeCl_3$ gives mainly:",
    options: [{ label: "A", text: "Chlorobenzene" }, { label: "B", text: "Hexachlorocyclohexane" }, { label: "C", text: "Benzyl chloride" }, { label: "D", text: "Benzal chloride" }],
    correct_answer: "A",
    solution: "This is electrophilic aromatic substitution giving chlorobenzene.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_011", subject: "chemistry", chapter: "s-Block Elements", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "Which is NOT formed when limestone is heated strongly?",
    options: [{ label: "A", text: "$CaO$" }, { label: "B", text: "$CO_2$" }, { label: "C", text: "$Ca(OH)_2$" }, { label: "D", text: "All are formed" }],
    correct_answer: "C",
    solution: "$CaCO_3 \\xrightarrow{\\Delta} CaO + CO_2$. $Ca(OH)_2$ requires water.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_016", subject: "chemistry", chapter: "States of Matter", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "At constant temperature, the pressure of an ideal gas is doubled. Its volume becomes:",
    options: [{ label: "A", text: "Double" }, { label: "B", text: "Half" }, { label: "C", text: "Same" }, { label: "D", text: "Four times" }],
    correct_answer: "B",
    solution: "By Boyle's law: $PV = $ constant. If $P$ doubles, $V$ halves.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_017", subject: "chemistry", chapter: "Redox Reactions", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "In the reaction $2FeCl_3 + SnCl_2 \\rightarrow 2FeCl_2 + SnCl_4$, the reducing agent is:",
    options: [{ label: "A", text: "$FeCl_3$" }, { label: "B", text: "$SnCl_2$" }, { label: "C", text: "$FeCl_2$" }, { label: "D", text: "$SnCl_4$" }],
    correct_answer: "B",
    solution: "$Sn^{2+} \\rightarrow Sn^{4+}$ (loses electrons). $SnCl_2$ is oxidized, hence it is the reducing agent.",
    marks_positive: 4, marks_negative: 1
  },
  // Class 12
  {
    id: "ch_008", subject: "chemistry", chapter: "Alcohols, Phenols and Ethers", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "Among the following, the most acidic compound is:",
    options: [{ label: "A", text: "Phenol" }, { label: "B", text: "p-nitrophenol" }, { label: "C", text: "p-chlorophenol" }, { label: "D", text: "p-cresol" }],
    correct_answer: "B",
    solution: "$-NO_2$ group is strongly electron-withdrawing, stabilizing the phenoxide ion. Hence p-nitrophenol is most acidic.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_009", subject: "chemistry", chapter: "Aldehydes, Ketones and Carboxylic Acids", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "Which cannot undergo Cannizzaro reaction?",
    options: [{ label: "A", text: "Formaldehyde" }, { label: "B", text: "Benzaldehyde" }, { label: "C", text: "Acetaldehyde" }, { label: "D", text: "Trimethylacetaldehyde" }],
    correct_answer: "C",
    solution: "Cannizzaro requires aldehydes without α-hydrogen. Acetaldehyde has α-hydrogens.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_010", subject: "chemistry", chapter: "Amines", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "The order of basic strength of aliphatic amines in aqueous solution is:",
    options: [{ label: "A", text: "$1° > 2° > 3°$" }, { label: "B", text: "$2° > 1° > 3°$" }, { label: "C", text: "$3° > 2° > 1°$" }, { label: "D", text: "$2° > 3° > 1°$" }],
    correct_answer: "B",
    solution: "In aqueous solution: 2° > 1° > 3° due to balance between +I effect and solvation.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_012", subject: "chemistry", chapter: "p-Block Elements", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "Which halogen has highest electron affinity?",
    options: [{ label: "A", text: "F" }, { label: "B", text: "Cl" }, { label: "C", text: "Br" }, { label: "D", text: "I" }],
    correct_answer: "B",
    solution: "Chlorine has highest EA. Fluorine has lower due to electron-electron repulsion in small 2p orbital.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_013", subject: "chemistry", chapter: "d and f Block Elements", classLevel: "12",
    question_type: "numerical", difficulty: "main",
    question_text: "The spin-only magnetic moment of $Mn^{2+}$ ion is approximately _____ BM.",
    options: null, correct_answer: 5.92,
    solution: "$Mn^{2+} = [Ar]3d^5$ (5 unpaired). $\\mu = \\sqrt{5 \\times 7} = 5.92$ BM",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ch_014", subject: "chemistry", chapter: "Coordination Compounds", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "The coordination number and oxidation state of Cr in $[Cr(NH_3)_4Cl_2]^+$ are:",
    options: [{ label: "A", text: "6 and +3" }, { label: "B", text: "4 and +2" }, { label: "C", text: "6 and +2" }, { label: "D", text: "4 and +3" }],
    correct_answer: "A",
    solution: "CN = 6. Oxidation state: $x + 0 - 2 = +1$, so $x = +3$.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_015", subject: "chemistry", chapter: "Electrochemistry", classLevel: "12",
    question_type: "numerical", difficulty: "main",
    question_text: "Standard cell potential is $1.1$ V with $n = 2$. The $\\Delta G°$ in kJ/mol is approximately _____.",
    options: null, correct_answer: -212,
    solution: "$\\Delta G° = -nFE° = -2 \\times 96500 \\times 1.1 = -212.3$ kJ/mol",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ch_018", subject: "chemistry", chapter: "Chemical Kinetics", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "For a first-order reaction, the half-life is:",
    options: [{ label: "A", text: "Proportional to initial concentration" }, { label: "B", text: "Independent of initial concentration" }, { label: "C", text: "Inversely proportional to initial concentration" }, { label: "D", text: "Proportional to square of initial concentration" }],
    correct_answer: "B",
    solution: "For first-order: $t_{1/2} = \\frac{0.693}{k}$. Independent of initial concentration.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_019", subject: "chemistry", chapter: "Solutions", classLevel: "12",
    question_type: "numerical", difficulty: "main",
    question_text: "The molality of a solution containing 36 g of glucose ($M = 180$) in 500 g of water is _____ mol/kg.",
    options: null, correct_answer: 0.4,
    solution: "Moles of glucose = $\\frac{36}{180} = 0.2$. Molality = $\\frac{0.2}{0.5} = 0.4$ mol/kg",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ch_020", subject: "chemistry", chapter: "Haloalkanes and Haloarenes", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "$SN_1$ reaction proceeds through:",
    options: [{ label: "A", text: "Carbanion intermediate" }, { label: "B", text: "Free radical intermediate" }, { label: "C", text: "Carbocation intermediate" }, { label: "D", text: "Concerted mechanism" }],
    correct_answer: "C",
    solution: "$SN_1$ is a two-step mechanism proceeding through carbocation intermediate formation.",
    marks_positive: 4, marks_negative: 1
  },

  // ==================== MATHEMATICS ====================
  // Class 11
  {
    id: "ma_001", subject: "mathematics", chapter: "Complex Numbers and Quadratic Equations", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "If $z = \\frac{1+i}{1-i}$, then $z^4$ equals:",
    options: [{ label: "A", text: "$1$" }, { label: "B", text: "$-1$" }, { label: "C", text: "$i$" }, { label: "D", text: "$-i$" }],
    correct_answer: "A",
    solution: "$z = \\frac{(1+i)^2}{2} = \\frac{2i}{2} = i$. So $z^4 = i^4 = 1$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_002", subject: "mathematics", chapter: "Permutations and Combinations", classLevel: "11",
    question_type: "numerical", difficulty: "main",
    question_text: "The number of 4-digit numbers that can be formed using 1,2,3,4,5 without repetition is:",
    options: null, correct_answer: 120,
    solution: "$^5P_4 = 5 \\times 4 \\times 3 \\times 2 = 120$",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ma_003", subject: "mathematics", chapter: "Binomial Theorem", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "The coefficient of $x^5$ in $(1+x)^{10}$ is:",
    options: [{ label: "A", text: "252" }, { label: "B", text: "210" }, { label: "C", text: "120" }, { label: "D", text: "126" }],
    correct_answer: "A",
    solution: "$\\binom{10}{5} = \\frac{10!}{5!5!} = 252$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_004", subject: "mathematics", chapter: "Sequences and Series", classLevel: "11",
    question_type: "numerical", difficulty: "main",
    question_text: "Sum of first 10 odd numbers is:",
    options: null, correct_answer: 100,
    solution: "Sum of first n odd numbers = $n^2 = 100$",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ma_006", subject: "mathematics", chapter: "Limits and Derivatives", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "$\\lim_{x \\to 0} \\frac{\\sin x}{x}$ equals:",
    options: [{ label: "A", text: "0" }, { label: "B", text: "1" }, { label: "C", text: "$\\infty$" }, { label: "D", text: "Does not exist" }],
    correct_answer: "B",
    solution: "This is a standard limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_011", subject: "mathematics", chapter: "Straight Lines", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "The distance of $(3, 4)$ from line $3x + 4y - 5 = 0$ is:",
    options: [{ label: "A", text: "4" }, { label: "B", text: "5" }, { label: "C", text: "3" }, { label: "D", text: "2" }],
    correct_answer: "A",
    solution: "Distance = $\\frac{|9 + 16 - 5|}{5} = \\frac{20}{5} = 4$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_012", subject: "mathematics", chapter: "Conic Sections", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "Eccentricity of ellipse $\\frac{x^2}{16} + \\frac{y^2}{9} = 1$ is:",
    options: [{ label: "A", text: "$\\frac{\\sqrt{7}}{4}$" }, { label: "B", text: "$\\frac{\\sqrt{7}}{3}$" }, { label: "C", text: "$\\frac{3}{4}$" }, { label: "D", text: "$\\frac{7}{16}$" }],
    correct_answer: "A",
    solution: "$e = \\sqrt{1 - \\frac{9}{16}} = \\frac{\\sqrt{7}}{4}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_016", subject: "mathematics", chapter: "Trigonometric Functions", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "The value of $\\sin 75°$ is:",
    options: [{ label: "A", text: "$\\frac{\\sqrt{6}+\\sqrt{2}}{4}$" }, { label: "B", text: "$\\frac{\\sqrt{6}-\\sqrt{2}}{4}$" }, { label: "C", text: "$\\frac{\\sqrt{3}+1}{2\\sqrt{2}}$" }, { label: "D", text: "Both A and C" }],
    correct_answer: "D",
    solution: "$\\sin 75° = \\sin(45° + 30°) = \\frac{\\sqrt{6}+\\sqrt{2}}{4} = \\frac{\\sqrt{3}+1}{2\\sqrt{2}}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_017", subject: "mathematics", chapter: "Relations and Functions", classLevel: "11",
    question_type: "single_correct", difficulty: "main",
    question_text: "If $f(x) = x^2$ and $g(x) = x + 1$, then $f(g(2))$ equals:",
    options: [{ label: "A", text: "5" }, { label: "B", text: "9" }, { label: "C", text: "4" }, { label: "D", text: "8" }],
    correct_answer: "B",
    solution: "$g(2) = 3$, $f(g(2)) = f(3) = 9$",
    marks_positive: 4, marks_negative: 1
  },
  // Class 12
  {
    id: "ma_005", subject: "mathematics", chapter: "Matrices", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "If $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$, then $|A|$ equals:",
    options: [{ label: "A", text: "-2" }, { label: "B", text: "2" }, { label: "C", text: "10" }, { label: "D", text: "-10" }],
    correct_answer: "A",
    solution: "$|A| = 1(4) - 2(3) = 4 - 6 = -2$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_007", subject: "mathematics", chapter: "Continuity and Differentiability", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "The derivative of $\\ln(\\sin x)$ is:",
    options: [{ label: "A", text: "$\\frac{1}{\\sin x}$" }, { label: "B", text: "$\\cot x$" }, { label: "C", text: "$\\tan x$" }, { label: "D", text: "$\\frac{\\cos x}{x}$" }],
    correct_answer: "B",
    solution: "$\\frac{d}{dx}[\\ln(\\sin x)] = \\frac{\\cos x}{\\sin x} = \\cot x$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_008", subject: "mathematics", chapter: "Integrals", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "$\\int \\frac{1}{1+x^2} dx$ equals:",
    options: [{ label: "A", text: "$\\ln(1+x^2) + C$" }, { label: "B", text: "$\\tan^{-1}x + C$" }, { label: "C", text: "$\\sin^{-1}x + C$" }, { label: "D", text: "$\\frac{x}{1+x^2} + C$" }],
    correct_answer: "B",
    solution: "Standard integral: $\\int \\frac{1}{1+x^2} dx = \\tan^{-1}x + C$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_009", subject: "mathematics", chapter: "Differential Equations", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "The order and degree of $\\frac{d^2y}{dx^2} + \\left(\\frac{dy}{dx}\\right)^3 = 0$ are:",
    options: [{ label: "A", text: "2, 1" }, { label: "B", text: "2, 3" }, { label: "C", text: "1, 3" }, { label: "D", text: "3, 2" }],
    correct_answer: "A",
    solution: "Order = 2 (highest derivative). Degree = 1 (power of $\\frac{d^2y}{dx^2}$).",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_010", subject: "mathematics", chapter: "Application of Derivatives", classLevel: "12",
    question_type: "numerical", difficulty: "main",
    question_text: "Maximum value of $f(x) = x^3 - 12x + 5$ in $[-3, 3]$ is:",
    options: null, correct_answer: 21,
    solution: "Critical points at $x = \\pm 2$. $f(-2) = -8 + 24 + 5 = 21$. Maximum = 21",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ma_013", subject: "mathematics", chapter: "Three Dimensional Geometry", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "Direction cosines of a line making equal angles with axes are:",
    options: [{ label: "A", text: "$\\frac{1}{\\sqrt{3}}, \\frac{1}{\\sqrt{3}}, \\frac{1}{\\sqrt{3}}$" }, { label: "B", text: "$1, 1, 1$" }, { label: "C", text: "$\\frac{1}{3}, \\frac{1}{3}, \\frac{1}{3}$" }, { label: "D", text: "$0, 0, 1$" }],
    correct_answer: "A",
    solution: "If $l = m = n$ and $l^2 + m^2 + n^2 = 1$, then $l = m = n = \\frac{1}{\\sqrt{3}}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_014", subject: "mathematics", chapter: "Vector Algebra", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "If $\\vec{a} = 2\\hat{i} + 3\\hat{j} + \\hat{k}$ and $\\vec{b} = \\hat{i} - \\hat{j} + 2\\hat{k}$, then $\\vec{a} \\cdot \\vec{b}$ equals:",
    options: [{ label: "A", text: "1" }, { label: "B", text: "-1" }, { label: "C", text: "3" }, { label: "D", text: "0" }],
    correct_answer: "A",
    solution: "$\\vec{a} \\cdot \\vec{b} = 2(1) + 3(-1) + 1(2) = 2 - 3 + 2 = 1$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_015", subject: "mathematics", chapter: "Probability", classLevel: "12",
    question_type: "numerical", difficulty: "main",
    question_text: "Two dice thrown. If probability of sum 7 is $\\frac{1}{k}$, find k.",
    options: null, correct_answer: 6,
    solution: "Favorable outcomes: 6. Total: 36. P = $\\frac{6}{36} = \\frac{1}{6}$. k = 6",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ma_018", subject: "mathematics", chapter: "Determinants", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "If $\\begin{vmatrix} 2 & 3 \\\\ 4 & 5 \\end{vmatrix} = k$, then $k$ equals:",
    options: [{ label: "A", text: "-2" }, { label: "B", text: "2" }, { label: "C", text: "-22" }, { label: "D", text: "22" }],
    correct_answer: "A",
    solution: "$k = 2(5) - 3(4) = 10 - 12 = -2$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_019", subject: "mathematics", chapter: "Inverse Trigonometric Functions", classLevel: "12",
    question_type: "single_correct", difficulty: "main",
    question_text: "$\\sin^{-1}(\\frac{1}{2}) + \\cos^{-1}(\\frac{1}{2})$ equals:",
    options: [{ label: "A", text: "$0$" }, { label: "B", text: "$\\frac{\\pi}{2}$" }, { label: "C", text: "$\\pi$" }, { label: "D", text: "$\\frac{\\pi}{6}$" }],
    correct_answer: "B",
    solution: "$\\sin^{-1}x + \\cos^{-1}x = \\frac{\\pi}{2}$ for all $x \\in [-1, 1]$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_020", subject: "mathematics", chapter: "Application of Integrals", classLevel: "12",
    question_type: "numerical", difficulty: "main",
    question_text: "Area enclosed by $y = x^2$, $x = 0$, and $x = 2$ is _____ sq. units (rounded to nearest integer).",
    options: null, correct_answer: 3,
    solution: "$\\int_0^2 x^2 dx = \\frac{x^3}{3}\\Big|_0^2 = \\frac{8}{3} \\approx 2.67 \\approx 3$",
    marks_positive: 4, marks_negative: 0
  },
];

// Helper functions
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export type SyllabusLevel = "11" | "12" | "both" | "custom";

export function getFilteredQuestions(options: {
  testType: "jee_main" | "jee_advanced";
  syllabusLevel: SyllabusLevel;
  subjects: ("physics" | "chemistry" | "mathematics")[];
  topics: string[];
}): PracticeQuestion[] {
  const filtered = PRACTICE_BANK.filter(q => {
    // STRICT difficulty filtering — Main questions NEVER in Advanced tests, vice versa
    if (options.testType === "jee_main" && q.difficulty !== "main") return false;
    if (options.testType === "jee_advanced" && q.difficulty !== "advanced") return false;

    // Filter by syllabus level
    if (options.syllabusLevel === "11" && q.classLevel !== "11") return false;
    if (options.syllabusLevel === "12" && q.classLevel !== "12") return false;
    // "both" allows all, "custom" uses topic filtering

    // Filter by subjects
    if (options.subjects.length > 0 && !options.subjects.includes(q.subject)) return false;

    // Filter by topics — EXACT match only, no related/prerequisite topics
    if (options.topics.length > 0 && !options.topics.includes(q.chapter)) return false;

    return true;
  });

  // Enforce fixed marking: +4 correct, -1 incorrect
  const withFixedMarking = filtered.map(q => ({
    ...q,
    marks_positive: 4,
    marks_negative: 1,
  }));

  return shuffleArray(withFixedMarking);
}
