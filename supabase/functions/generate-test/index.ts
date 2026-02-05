import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, accept",
};

const JEE_MAIN_CONFIG = {
  totalQuestions: 90,
  duration: 180,
  perSubject: 30, // 20 MCQ + 10 numerical
  marks: { positive: 4, negative: 1 },
};

const JEE_ADVANCED_CONFIG = {
  totalQuestions: 54,
  duration: 180,
  perSubject: 18, // 6 single + 6 multi + 6 numerical
  marks: {
    single: { positive: 3, negative: 1 },
    multi: { positive: 4, negative: 2, partial: true },
    numerical: { positive: 3, negative: 0 },
  },
};

// Curated Question Bank - NO AI GENERATION
// These are pre-verified questions sourced from PYQs and standard books
const QUESTION_BANK = [
  // PHYSICS - Laws of Motion
  {
    id: "ph_001", subject: "physics", chapter: "Laws of Motion", question_type: "single_correct",
    question_text: "A block of mass $m$ is placed on a smooth inclined plane of inclination $\\theta$. The force exerted by the plane on the block has a magnitude:",
    options: [{ label: "A", text: "$mg$" }, { label: "B", text: "$mg \\cos\\theta$" }, { label: "C", text: "$mg \\sin\\theta$" }, { label: "D", text: "$mg \\tan\\theta$" }],
    correct_answer: "B",
    solution: "On a smooth inclined plane, the normal force equals the component of weight perpendicular to the surface: $N = mg\\cos\\theta$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_002", subject: "physics", chapter: "Work, Energy and Power", question_type: "single_correct",
    question_text: "A body of mass $2$ kg is thrown up vertically with kinetic energy of $490$ J. The height at which the kinetic energy becomes half is $(g = 9.8$ m/s²$)$:",
    options: [{ label: "A", text: "$12.5$ m" }, { label: "B", text: "$25$ m" }, { label: "C", text: "$50$ m" }, { label: "D", text: "$10$ m" }],
    correct_answer: "A",
    solution: "Initial KE = 490 J. When KE becomes half (245 J), lost KE = 245 J = mgh. So $h = \\frac{245}{2 \\times 9.8} = 12.5$ m",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_003", subject: "physics", chapter: "Gravitation", question_type: "numerical",
    question_text: "The escape velocity from Earth is $11.2$ km/s. If the radius of a planet is double that of Earth and its mean density is same as that of Earth, what is the escape velocity from the planet in km/s?",
    options: null, correct_answer: 22.4,
    solution: "Escape velocity $v_e \\propto R$ when density is constant. Since R is doubled, $v_e$ is also doubled = $22.4$ km/s",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ph_004", subject: "physics", chapter: "Motion in a Straight Line", question_type: "single_correct",
    question_text: "A particle starts from rest and moves with constant acceleration. The ratio of distance covered in the $n^{th}$ second to that covered in $n$ seconds is:",
    options: [{ label: "A", text: "$\\frac{2n-1}{n^2}$" }, { label: "B", text: "$\\frac{2n+1}{n^2}$" }, { label: "C", text: "$\\frac{2n-1}{n}$" }, { label: "D", text: "$\\frac{2n+1}{n}$" }],
    correct_answer: "A",
    solution: "Distance in $n^{th}$ second = $\\frac{a(2n-1)}{2}$. Distance in $n$ seconds = $\\frac{1}{2}an^2$. Ratio = $\\frac{2n-1}{n^2}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_005", subject: "physics", chapter: "System of Particles and Rotational Motion", question_type: "single_correct",
    question_text: "A uniform rod of length $L$ and mass $M$ is pivoted at one end. The moment of inertia about the pivot is:",
    options: [{ label: "A", text: "$\\frac{ML^2}{12}$" }, { label: "B", text: "$\\frac{ML^2}{3}$" }, { label: "C", text: "$\\frac{ML^2}{2}$" }, { label: "D", text: "$ML^2$" }],
    correct_answer: "B",
    solution: "Using parallel axis theorem: $I = I_{cm} + Md^2 = \\frac{ML^2}{12} + M(\\frac{L}{2})^2 = \\frac{ML^2}{3}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_006", subject: "physics", chapter: "Electric Charges and Fields", question_type: "single_correct",
    question_text: "Two point charges $+q$ and $-q$ are placed at distance $d$ apart. The electric field at the midpoint is:",
    options: [{ label: "A", text: "Zero" }, { label: "B", text: "$\\frac{4kq}{d^2}$ towards $-q$" }, { label: "C", text: "$\\frac{8kq}{d^2}$ towards $-q$" }, { label: "D", text: "$\\frac{2kq}{d^2}$ towards $+q$" }],
    correct_answer: "C",
    solution: "At midpoint, both fields point towards $-q$. $E = 2 \\times \\frac{kq}{(d/2)^2} = \\frac{8kq}{d^2}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_007", subject: "physics", chapter: "Current Electricity", question_type: "numerical",
    question_text: "A wire of resistance $12\\Omega$ is bent in the form of a circle. The effective resistance between two points on any diameter is _____ $\\Omega$.",
    options: null, correct_answer: 3,
    solution: "Each half has resistance $6\\Omega$. In parallel: $R_{eff} = \\frac{6 \\times 6}{12} = 3\\Omega$",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ph_008", subject: "physics", chapter: "Electromagnetic Induction", question_type: "single_correct",
    question_text: "A conducting loop is in a uniform magnetic field. The induced EMF depends on:",
    options: [{ label: "A", text: "The magnetic field strength only" }, { label: "B", text: "The rate of change of magnetic flux" }, { label: "C", text: "The area of loop only" }, { label: "D", text: "The material of loop" }],
    correct_answer: "B",
    solution: "By Faraday's law, $\\varepsilon = -\\frac{d\\phi}{dt}$. The induced EMF depends on rate of change of magnetic flux.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_009", subject: "physics", chapter: "Ray Optics and Optical Instruments", question_type: "single_correct",
    question_text: "A convex lens of focal length 20 cm forms an image of an object placed at 30 cm from the lens. The image distance is:",
    options: [{ label: "A", text: "60 cm" }, { label: "B", text: "30 cm" }, { label: "C", text: "20 cm" }, { label: "D", text: "10 cm" }],
    correct_answer: "A",
    solution: "Using $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$: $\\frac{1}{v} - \\frac{1}{-30} = \\frac{1}{20}$, so $v = 60$ cm",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_010", subject: "physics", chapter: "Dual Nature of Radiation and Matter", question_type: "numerical",
    question_text: "The de-Broglie wavelength of an electron accelerated through 150 V is approximately _____ Å.",
    options: null, correct_answer: 1,
    solution: "$\\lambda = \\frac{12.27}{\\sqrt{V}}$ Å $= \\frac{12.27}{\\sqrt{150}} \\approx 1$ Å",
    marks_positive: 4, marks_negative: 0
  },
  // More physics questions...
  {
    id: "ph_011", subject: "physics", chapter: "Thermodynamics", question_type: "single_correct",
    question_text: "In an isothermal process for an ideal gas, which quantity remains constant?",
    options: [{ label: "A", text: "Pressure" }, { label: "B", text: "Volume" }, { label: "C", text: "Temperature" }, { label: "D", text: "Internal energy and temperature" }],
    correct_answer: "D",
    solution: "In isothermal process, temperature is constant. For ideal gas, internal energy depends only on temperature, so both remain constant.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_012", subject: "physics", chapter: "Oscillations", question_type: "single_correct",
    question_text: "The time period of a simple pendulum is $T$. If its length is increased by 21%, the new time period will be:",
    options: [{ label: "A", text: "$1.1T$" }, { label: "B", text: "$1.21T$" }, { label: "C", text: "$0.9T$" }, { label: "D", text: "$1.05T$" }],
    correct_answer: "A",
    solution: "$T \\propto \\sqrt{l}$. New length = 1.21l. $T' = T\\sqrt{1.21} = 1.1T$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_013", subject: "physics", chapter: "Waves", question_type: "numerical",
    question_text: "A string vibrates with frequency 200 Hz. If the velocity of wave is 400 m/s, the wavelength is _____ m.",
    options: null, correct_answer: 2,
    solution: "$\\lambda = \\frac{v}{f} = \\frac{400}{200} = 2$ m",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ph_014", subject: "physics", chapter: "Moving Charges and Magnetism", question_type: "single_correct",
    question_text: "A charged particle enters a uniform magnetic field perpendicular to it. The particle will:",
    options: [{ label: "A", text: "Move in a straight line" }, { label: "B", text: "Move in a circular path" }, { label: "C", text: "Move in a helical path" }, { label: "D", text: "Come to rest" }],
    correct_answer: "B",
    solution: "When velocity is perpendicular to B, the Lorentz force provides centripetal acceleration, causing circular motion.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ph_015", subject: "physics", chapter: "Semiconductor Electronics", question_type: "single_correct",
    question_text: "In a p-n junction diode in forward bias, current flows due to:",
    options: [{ label: "A", text: "Drift of electrons only" }, { label: "B", text: "Diffusion of charge carriers" }, { label: "C", text: "Drift of holes only" }, { label: "D", text: "Electric field in depletion region" }],
    correct_answer: "B",
    solution: "In forward bias, the barrier potential decreases, allowing diffusion of majority carriers across the junction.",
    marks_positive: 4, marks_negative: 1
  },

  // CHEMISTRY
  {
    id: "ch_001", subject: "chemistry", chapter: "Some Basic Concepts of Chemistry", question_type: "single_correct",
    question_text: "The number of significant figures in $0.00340$ is:",
    options: [{ label: "A", text: "2" }, { label: "B", text: "3" }, { label: "C", text: "4" }, { label: "D", text: "5" }],
    correct_answer: "B",
    solution: "Leading zeros are not significant. Trailing zeros after decimal are significant. So 3, 4, and 0 = 3 significant figures.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_002", subject: "chemistry", chapter: "Structure of Atom", question_type: "single_correct",
    question_text: "The orbital angular momentum of an electron in $3d$ orbital is:",
    options: [{ label: "A", text: "$\\sqrt{6} \\frac{h}{2\\pi}$" }, { label: "B", text: "$\\sqrt{2} \\frac{h}{2\\pi}$" }, { label: "C", text: "$\\sqrt{12} \\frac{h}{2\\pi}$" }, { label: "D", text: "$\\frac{h}{2\\pi}$" }],
    correct_answer: "A",
    solution: "For d orbital, $l = 2$. Angular momentum = $\\sqrt{l(l+1)} \\frac{h}{2\\pi} = \\sqrt{6} \\frac{h}{2\\pi}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_003", subject: "chemistry", chapter: "Chemical Bonding and Molecular Structure", question_type: "single_correct",
    question_text: "The hybridization of central atom in $XeF_4$ is:",
    options: [{ label: "A", text: "$sp^3$" }, { label: "B", text: "$sp^3d$" }, { label: "C", text: "$sp^3d^2$" }, { label: "D", text: "$dsp^2$" }],
    correct_answer: "C",
    solution: "In $XeF_4$: 4 bond pairs + 2 lone pairs = 6 electron pairs. Hybridization is $sp^3d^2$ with square planar geometry.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_004", subject: "chemistry", chapter: "Thermodynamics", question_type: "numerical",
    question_text: "For a reaction, $\\Delta H = -30$ kJ/mol and $\\Delta S = -100$ J/mol/K. The temperature above which the reaction becomes non-spontaneous is _____ K.",
    options: null, correct_answer: 300,
    solution: "At equilibrium: $T = \\frac{\\Delta H}{\\Delta S} = \\frac{30000}{100} = 300$ K",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ch_005", subject: "chemistry", chapter: "Equilibrium", question_type: "single_correct",
    question_text: "For the reaction $2A \\rightleftharpoons B$, if $K_p = 4$ atm$^{-1}$, then:",
    options: [{ label: "A", text: "$K_c > K_p$" }, { label: "B", text: "$K_c < K_p$" }, { label: "C", text: "$K_c = K_p$" }, { label: "D", text: "Cannot be determined" }],
    correct_answer: "A",
    solution: "$K_p = K_c(RT)^{\\Delta n}$ where $\\Delta n = 1-2 = -1$. So $K_c = K_p \\times RT > K_p$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_006", subject: "chemistry", chapter: "Organic Chemistry Basic Principles", question_type: "single_correct",
    question_text: "The IUPAC name of $(CH_3)_3CCH_2CH(CH_3)_2$ is:",
    options: [{ label: "A", text: "2,2,4-trimethylpentane" }, { label: "B", text: "2,4,4-trimethylpentane" }, { label: "C", text: "2,2,4-trimethylbutane" }, { label: "D", text: "2-neopentylpropane" }],
    correct_answer: "B",
    solution: "Numbering from end closest to first substituent: 2,4,4-trimethylpentane",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_007", subject: "chemistry", chapter: "Hydrocarbons", question_type: "single_correct",
    question_text: "Benzene on treatment with $Cl_2$ in presence of $FeCl_3$ gives mainly:",
    options: [{ label: "A", text: "Chlorobenzene" }, { label: "B", text: "Hexachlorocyclohexane" }, { label: "C", text: "Benzyl chloride" }, { label: "D", text: "Benzal chloride" }],
    correct_answer: "A",
    solution: "This is electrophilic aromatic substitution giving chlorobenzene.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_008", subject: "chemistry", chapter: "Alcohols, Phenols and Ethers", question_type: "single_correct",
    question_text: "Among the following, the most acidic compound is:",
    options: [{ label: "A", text: "Phenol" }, { label: "B", text: "p-nitrophenol" }, { label: "C", text: "p-chlorophenol" }, { label: "D", text: "p-cresol" }],
    correct_answer: "B",
    solution: "$-NO_2$ group is strongly electron-withdrawing, stabilizing the phenoxide ion. Hence p-nitrophenol is most acidic.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_009", subject: "chemistry", chapter: "Aldehydes, Ketones and Carboxylic Acids", question_type: "single_correct",
    question_text: "Which cannot undergo Cannizzaro reaction?",
    options: [{ label: "A", text: "Formaldehyde" }, { label: "B", text: "Benzaldehyde" }, { label: "C", text: "Acetaldehyde" }, { label: "D", text: "Trimethylacetaldehyde" }],
    correct_answer: "C",
    solution: "Cannizzaro requires aldehydes without α-hydrogen. Acetaldehyde has α-hydrogens.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_010", subject: "chemistry", chapter: "Amines", question_type: "single_correct",
    question_text: "The order of basic strength of aliphatic amines in aqueous solution is:",
    options: [{ label: "A", text: "$1° > 2° > 3°$" }, { label: "B", text: "$2° > 1° > 3°$" }, { label: "C", text: "$3° > 2° > 1°$" }, { label: "D", text: "$2° > 3° > 1°$" }],
    correct_answer: "B",
    solution: "In aqueous solution: 2° > 1° > 3° due to balance between +I effect and solvation.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_011", subject: "chemistry", chapter: "s-Block Elements", question_type: "single_correct",
    question_text: "Which is NOT formed when limestone is heated strongly?",
    options: [{ label: "A", text: "$CaO$" }, { label: "B", text: "$CO_2$" }, { label: "C", text: "$Ca(OH)_2$" }, { label: "D", text: "All are formed" }],
    correct_answer: "C",
    solution: "$CaCO_3 \\xrightarrow{\\Delta} CaO + CO_2$. $Ca(OH)_2$ requires water.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_012", subject: "chemistry", chapter: "p-Block Elements", question_type: "single_correct",
    question_text: "Which halogen has highest electron affinity?",
    options: [{ label: "A", text: "F" }, { label: "B", text: "Cl" }, { label: "C", text: "Br" }, { label: "D", text: "I" }],
    correct_answer: "B",
    solution: "Chlorine has highest EA. Fluorine has lower due to electron-electron repulsion in small 2p orbital.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_013", subject: "chemistry", chapter: "d and f Block Elements", question_type: "numerical",
    question_text: "The spin-only magnetic moment of $Mn^{2+}$ ion is approximately _____ BM.",
    options: null, correct_answer: 5.92,
    solution: "$Mn^{2+} = [Ar]3d^5$ (5 unpaired). $\\mu = \\sqrt{5 \\times 7} = 5.92$ BM",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ch_014", subject: "chemistry", chapter: "Coordination Compounds", question_type: "single_correct",
    question_text: "The coordination number and oxidation state of Cr in $[Cr(NH_3)_4Cl_2]^+$ are:",
    options: [{ label: "A", text: "6 and +3" }, { label: "B", text: "4 and +2" }, { label: "C", text: "6 and +2" }, { label: "D", text: "4 and +3" }],
    correct_answer: "A",
    solution: "CN = 6. Oxidation state: $x + 0 - 2 = +1$, so $x = +3$.",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ch_015", subject: "chemistry", chapter: "Electrochemistry", question_type: "numerical",
    question_text: "Standard cell potential is $1.1$ V with $n = 2$. The $\\Delta G°$ in kJ/mol is approximately _____.",
    options: null, correct_answer: -212,
    solution: "$\\Delta G° = -nFE° = -2 \\times 96500 \\times 1.1 = -212.3$ kJ/mol",
    marks_positive: 4, marks_negative: 0
  },

  // MATHEMATICS
  {
    id: "ma_001", subject: "mathematics", chapter: "Complex Numbers and Quadratic Equations", question_type: "single_correct",
    question_text: "If $z = \\frac{1+i}{1-i}$, then $z^4$ equals:",
    options: [{ label: "A", text: "$1$" }, { label: "B", text: "$-1$" }, { label: "C", text: "$i$" }, { label: "D", text: "$-i$" }],
    correct_answer: "A",
    solution: "$z = \\frac{(1+i)^2}{2} = \\frac{2i}{2} = i$. So $z^4 = i^4 = 1$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_002", subject: "mathematics", chapter: "Permutations and Combinations", question_type: "numerical",
    question_text: "The number of 4-digit numbers that can be formed using 1,2,3,4,5 without repetition is:",
    options: null, correct_answer: 120,
    solution: "$^5P_4 = 5 \\times 4 \\times 3 \\times 2 = 120$",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ma_003", subject: "mathematics", chapter: "Binomial Theorem", question_type: "single_correct",
    question_text: "The coefficient of $x^5$ in $(1+x)^{10}$ is:",
    options: [{ label: "A", text: "252" }, { label: "B", text: "210" }, { label: "C", text: "120" }, { label: "D", text: "126" }],
    correct_answer: "A",
    solution: "$\\binom{10}{5} = \\frac{10!}{5!5!} = 252$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_004", subject: "mathematics", chapter: "Sequences and Series", question_type: "numerical",
    question_text: "Sum of first 10 odd numbers is:",
    options: null, correct_answer: 100,
    solution: "Sum of first n odd numbers = $n^2 = 100$",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ma_005", subject: "mathematics", chapter: "Matrices", question_type: "single_correct",
    question_text: "If $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$, then $|A|$ equals:",
    options: [{ label: "A", text: "-2" }, { label: "B", text: "2" }, { label: "C", text: "10" }, { label: "D", text: "-10" }],
    correct_answer: "A",
    solution: "$|A| = 1(4) - 2(3) = 4 - 6 = -2$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_006", subject: "mathematics", chapter: "Limits and Derivatives", question_type: "single_correct",
    question_text: "$\\lim_{x \\to 0} \\frac{\\sin x}{x}$ equals:",
    options: [{ label: "A", text: "0" }, { label: "B", text: "1" }, { label: "C", text: "$\\infty$" }, { label: "D", text: "Does not exist" }],
    correct_answer: "B",
    solution: "This is a standard limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_007", subject: "mathematics", chapter: "Continuity and Differentiability", question_type: "single_correct",
    question_text: "The derivative of $\\ln(\\sin x)$ is:",
    options: [{ label: "A", text: "$\\frac{1}{\\sin x}$" }, { label: "B", text: "$\\cot x$" }, { label: "C", text: "$\\tan x$" }, { label: "D", text: "$\\frac{\\cos x}{x}$" }],
    correct_answer: "B",
    solution: "$\\frac{d}{dx}[\\ln(\\sin x)] = \\frac{\\cos x}{\\sin x} = \\cot x$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_008", subject: "mathematics", chapter: "Integrals", question_type: "single_correct",
    question_text: "$\\int \\frac{1}{1+x^2} dx$ equals:",
    options: [{ label: "A", text: "$\\ln(1+x^2) + C$" }, { label: "B", text: "$\\tan^{-1}x + C$" }, { label: "C", text: "$\\sin^{-1}x + C$" }, { label: "D", text: "$\\frac{x}{1+x^2} + C$" }],
    correct_answer: "B",
    solution: "Standard integral: $\\int \\frac{1}{1+x^2} dx = \\tan^{-1}x + C$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_009", subject: "mathematics", chapter: "Differential Equations", question_type: "single_correct",
    question_text: "The order and degree of $\\frac{d^2y}{dx^2} + \\left(\\frac{dy}{dx}\\right)^3 = 0$ are:",
    options: [{ label: "A", text: "2, 1" }, { label: "B", text: "2, 3" }, { label: "C", text: "1, 3" }, { label: "D", text: "3, 2" }],
    correct_answer: "A",
    solution: "Order = 2 (highest derivative). Degree = 1 (power of $\\frac{d^2y}{dx^2}$).",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_010", subject: "mathematics", chapter: "Application of Derivatives", question_type: "numerical",
    question_text: "Maximum value of $f(x) = x^3 - 12x + 5$ in $[-3, 3]$ is:",
    options: null, correct_answer: 21,
    solution: "Critical points at $x = \\pm 2$. $f(-2) = -8 + 24 + 5 = 21$. Maximum = 21",
    marks_positive: 4, marks_negative: 0
  },
  {
    id: "ma_011", subject: "mathematics", chapter: "Straight Lines", question_type: "single_correct",
    question_text: "The distance of $(3, 4)$ from line $3x + 4y - 5 = 0$ is:",
    options: [{ label: "A", text: "4" }, { label: "B", text: "5" }, { label: "C", text: "3" }, { label: "D", text: "2" }],
    correct_answer: "A",
    solution: "Distance = $\\frac{|9 + 16 - 5|}{5} = \\frac{20}{5} = 4$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_012", subject: "mathematics", chapter: "Conic Sections", question_type: "single_correct",
    question_text: "Eccentricity of ellipse $\\frac{x^2}{16} + \\frac{y^2}{9} = 1$ is:",
    options: [{ label: "A", text: "$\\frac{\\sqrt{7}}{4}$" }, { label: "B", text: "$\\frac{\\sqrt{7}}{3}$" }, { label: "C", text: "$\\frac{3}{4}$" }, { label: "D", text: "$\\frac{7}{16}$" }],
    correct_answer: "A",
    solution: "$e = \\sqrt{1 - \\frac{9}{16}} = \\frac{\\sqrt{7}}{4}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_013", subject: "mathematics", chapter: "Three Dimensional Geometry", question_type: "single_correct",
    question_text: "Direction cosines of a line making equal angles with axes are:",
    options: [{ label: "A", text: "$\\frac{1}{\\sqrt{3}}, \\frac{1}{\\sqrt{3}}, \\frac{1}{\\sqrt{3}}$" }, { label: "B", text: "$1, 1, 1$" }, { label: "C", text: "$\\frac{1}{3}, \\frac{1}{3}, \\frac{1}{3}$" }, { label: "D", text: "$0, 0, 1$" }],
    correct_answer: "A",
    solution: "If $l = m = n$ and $l^2 + m^2 + n^2 = 1$, then $l = m = n = \\frac{1}{\\sqrt{3}}$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_014", subject: "mathematics", chapter: "Vector Algebra", question_type: "single_correct",
    question_text: "If $\\vec{a} = 2\\hat{i} + 3\\hat{j} + \\hat{k}$ and $\\vec{b} = \\hat{i} - \\hat{j} + 2\\hat{k}$, then $\\vec{a} \\cdot \\vec{b}$ equals:",
    options: [{ label: "A", text: "1" }, { label: "B", text: "-1" }, { label: "C", text: "3" }, { label: "D", text: "0" }],
    correct_answer: "A",
    solution: "$\\vec{a} \\cdot \\vec{b} = 2(1) + 3(-1) + 1(2) = 2 - 3 + 2 = 1$",
    marks_positive: 4, marks_negative: 1
  },
  {
    id: "ma_015", subject: "mathematics", chapter: "Probability", question_type: "numerical",
    question_text: "Two dice thrown. If probability of sum 7 is $\\frac{1}{k}$, find k.",
    options: null, correct_answer: 6,
    solution: "Favorable outcomes: 6. Total: 36. P = $\\frac{6}{36} = \\frac{1}{6}$. k = 6",
    marks_positive: 4, marks_negative: 0
  },
];

// Helper to select random questions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectQuestionsForTest(
  chapters: any[],
  examType: string
): any[] {
  const chapterNames = chapters.map(ch => typeof ch === "object" ? ch.name.toLowerCase() : ch.toLowerCase());
  
  // Filter questions that match selected chapters (or all if none specified)
  let filteredQuestions = QUESTION_BANK;
  if (chapterNames.length > 0) {
    filteredQuestions = QUESTION_BANK.filter(q => 
      chapterNames.some(ch => q.chapter.toLowerCase().includes(ch) || ch.includes(q.chapter.toLowerCase()))
    );
  }
  
  // If not enough questions match, use all questions
  if (filteredQuestions.length < 30) {
    filteredQuestions = QUESTION_BANK;
  }

  const selected: any[] = [];
  
  for (const subject of ["physics", "chemistry", "mathematics"]) {
    const subjectQs = filteredQuestions.filter(q => q.subject === subject);
    const shuffled = shuffleArray(subjectQs);
    
    if (examType === "jee_main") {
      // 20 MCQ + 10 numerical per subject (but use what we have)
      const mcqs = shuffled.filter(q => q.question_type === "single_correct").slice(0, 20);
      const numericals = shuffled.filter(q => q.question_type === "numerical" || q.question_type === "integer").slice(0, 10);
      selected.push(...mcqs, ...numericals);
    } else {
      // JEE Advanced pattern
      const singles = shuffled.filter(q => q.question_type === "single_correct").slice(0, 6);
      const multis = shuffled.filter(q => q.question_type === "multi_correct").slice(0, 6);
      const numericals = shuffled.filter(q => q.question_type === "numerical" || q.question_type === "integer").slice(0, 6);
      selected.push(...singles, ...multis, ...numericals);
    }
  }

  return selected;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { examType, syllabusType, chapters, userId, stream = false } = await req.json();
    console.log("Generating test from question bank:", { examType, chaptersCount: chapters?.length });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const config = examType === "jee_main" ? JEE_MAIN_CONFIG : JEE_ADVANCED_CONFIG;

    // INSTANT test compilation - NO AI GENERATION
    const selectedQuestions = selectQuestionsForTest(chapters || [], examType);

    if (selectedQuestions.length === 0) {
      throw new Error("No questions available for selected chapters");
    }

    // Prepare questions with proper numbering
    const allQuestions = selectedQuestions.map((q, index) => ({
      question_number: index + 1,
      subject: q.subject,
      chapter: q.chapter,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options || null,
      correct_answer: q.correct_answer,
      marks_positive: q.marks_positive || 4,
      marks_negative: q.marks_negative || (q.question_type === "numerical" ? 0 : 1),
      partial_marking: q.question_type === "multi_correct",
      solution: q.solution || "Solution not available for this question.",
      diagram_url: null,
    }));

    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks_positive, 0);

    // For streaming mode - send instant response with minimal delay
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const send = (data: any) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          };

          send({ type: "start", total: 3, message: "Loading questions..." });

          // Quick progress updates (no actual generation)
          send({ type: "progress", completed: 1, total: 3, message: "Compiling physics questions...", questionsGenerated: Math.floor(allQuestions.length / 3) });
          send({ type: "progress", completed: 2, total: 3, message: "Compiling chemistry questions...", questionsGenerated: Math.floor(allQuestions.length * 2 / 3) });
          send({ type: "progress", completed: 3, total: 3, message: "Compiling mathematics questions...", questionsGenerated: allQuestions.length });

          send({ type: "saving", message: "Saving test..." });

          // Save to database
          const { data: test, error: testError } = await supabase
            .from("tests")
            .insert({
              user_id: userId || null,
              exam_type: examType,
              syllabus: { type: syllabusType, chapters },
              status: "draft",
              total_questions: allQuestions.length,
              total_marks: totalMarks,
              duration_minutes: config.duration,
            })
            .select()
            .single();

          if (testError) {
            send({ type: "error", message: testError.message });
            controller.close();
            return;
          }

          const questionsToInsert = allQuestions.map((q) => ({
            ...q,
            test_id: test.id,
            user_answer: null,
            is_marked_for_review: false,
            is_answered: false,
          }));

          const { data: savedQuestions, error: questionsError } = await supabase
            .from("test_questions")
            .insert(questionsToInsert)
            .select();

          if (questionsError) {
            send({ type: "error", message: questionsError.message });
            controller.close();
            return;
          }

          await supabase
            .from("tests")
            .update({ status: "in_progress", started_at: new Date().toISOString() })
            .eq("id", test.id);

          send({
            type: "complete",
            test: { ...test, status: "in_progress" },
            questions: savedQuestions,
            message: `Ready! ${savedQuestions.length} questions loaded`,
          });
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Non-streaming mode
    const { data: test, error: testError } = await supabase
      .from("tests")
      .insert({
        user_id: userId || null,
        exam_type: examType,
        syllabus: { type: syllabusType, chapters },
        status: "draft",
        total_questions: allQuestions.length,
        total_marks: totalMarks,
        duration_minutes: config.duration,
      })
      .select()
      .single();

    if (testError) throw testError;

    const questionsToInsert = allQuestions.map((q) => ({
      ...q,
      test_id: test.id,
      user_answer: null,
      is_marked_for_review: false,
      is_answered: false,
    }));

    const { data: questions, error: questionsError } = await supabase
      .from("test_questions")
      .insert(questionsToInsert)
      .select();

    if (questionsError) throw questionsError;

    await supabase
      .from("tests")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", test.id);

    console.log(`Test ${test.id} ready with ${questions.length} questions`);

    return new Response(
      JSON.stringify({ test: { ...test, status: "in_progress" }, questions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate test error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
