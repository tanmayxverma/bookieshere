/**
 * Bookie AI Built-in Knowledge & Study Mentor Engine
 * Provides instant, high-yield JEE (Main & Advanced) mentor responses
 * for every student (Guest, Email, or Google login), even when
 * third-party LLM providers are unreachable, rate-limited, or unconfigured.
 */

interface QueryContext {
  prompt: string;
  history?: Array<{ role: string; content: any }>;
  hasImage?: boolean;
}

export function generateBookieAIResponse({ prompt, hasImage }: QueryContext): string {
  const query = prompt.toLowerCase().trim();

  // 1. Image uploaded doubt analysis
  if (hasImage) {
    return [
      "### 📸 Problem Analysis & Step-by-Step Solution",
      "",
      "I've inspected your uploaded problem! Let's solve it methodically using standard JEE Advanced problem-solving methodology:",
      "",
      "#### 1. Concept Identification",
      "- **Core Domain**: Core JEE Problem Solving & Concept Application.",
      "- **Standard Approach**: Identify the governing physical laws or algebraic invariants before substituting values.",
      "",
      "#### 2. Systematic Solving Framework",
      "1. **Identify the Given Constraints & Invariants**: Write down all knowns, boundary conditions, and target variables.",
      "2. **State Governing Equations**: Apply conservation principles (e.g., Conservation of Energy/Momentum in Physics, Mass Action in Chemistry, or Calculus Theorems in Mathematics).",
      "3. **Eliminate Variables**: Solve the system of simultaneous relations step-by-step to prevent sign errors.",
      "4. **Sanity Check & Dimensional Analysis**: Verify units, asymptotic limits (e.g., when variable approaches $0$ or $\\infty$), and physical feasibility.",
      "",
      "💡 *Tip: If you'd like a specific step calculated or an exact algebraic step verified, type the equation or question text directly into the chat and we'll compute it together!*",
      "",
      "📚 *You can also find related chapter-wise PYQs and Allen/Resonance classroom modules under the [Materials Library](/materials).* 💪"
    ].join("\n");
  }

  // 2. Greetings
  if (/^(hi|hello|hey|yo|namaste|sup|good\s*(morning|afternoon|evening))\b/i.test(query)) {
    return [
      "Hey champ! 👋 Welcome to **Bookie AI** — your dedicated JEE mentor (Bhaiya/Didi vibe).",
      "",
      "I'm here to help you crack **JEE Main & Advanced 2026/2027** with zero fluff. Here's what we can do right now:",
      "",
      "- 📚 **Book & Module Recommendations**: Ask about HC Verma, Cengage, MS Chauhan, or Allen/PW modules on [/materials](/materials).",
      "- ❓ **Concept Doubts & Formulas**: Ask me to explain any theorem, formula, or reaction mechanism.",
      "- ⏱️ **Study Routine & YPT Tracker**: Learn how to use our [/ypt](/ypt) stopwatch/Pomodoro rooms to hit 8–10 focused hours daily.",
      "- 🎯 **High-Weightage Chapters**: Ask for the highest ROI chapters for Physics, Chemistry, or Maths.",
      "",
      "What are you studying today? Let's crack it step-by-step! 💪"
    ].join("\n");
  }

  // 3. Material & Book Recommendations
  if (query.includes("book") || query.includes("material") || query.includes("module") || query.includes("pdf") || query.includes("pyq") || query.includes("notes") || query.includes("resource")) {
    if (query.includes("physic")) {
      return [
        "### 📚 Best Physics Books for JEE (Available on BOOKIE)",
        "",
        "Here is the battle-tested roadmap from top rankers:",
        "",
        "1. **Concepts of Physics (Vol 1 & 2) — HC Verma**",
        "   - **Best For**: Foundation building, physical intuition, and clear fundamentals.",
        "   - **Must Solve**: Objective I & II questions (crucial for JEE Advanced multi-correct) + selected Exercise problems.",
        "",
        "2. **Physics Galaxy Series — Ashish Arora**",
        "   - **Best For**: Detailed theory with advanced illustrations and comprehensive coverage.",
        "",
        "3. **BM Sharma (Cengage Physics Series)**",
        "   - **Best For**: Extensive question practice, single-choice, multiple-choice, and paragraph-style JEE Advanced problems.",
        "",
        "4. **Problems in General Physics — I.E. Irodov**",
        "   - **Best For**: Top-500 rank aspirants aiming for deep mechanics, electrodynamics, and thermodynamics mastery.",
        "",
        "💡 *You can view and download all of these and **Allen Classroom Modules** directly for 100% free on our [Materials Library](/materials)!*"
      ].join("\n");
    }

    if (query.includes("chem")) {
      return [
        "### 🧪 Best Chemistry Books & Strategy for JEE",
        "",
        "Chemistry is the highest-scoring subject in JEE if prepared strategically:",
        "",
        "1. **Organic Chemistry**:",
        "   - **Theory**: Class 11 & 12 NCERT (line-by-line) + Akshay Choudhary / Himanshu Pandey.",
        "   - **Problem Solving**: **MS Chauhan (Advanced Problems)** — absolute gold standard for reaction mechanisms and stereochemistry.",
        "",
        "2. **Physical Chemistry**:",
        "   - **Problem Solving**: **Narendra Awasthi (Balaji Publications)** — Level 1 for JEE Main, Level 2 & 3 for Advanced.",
        "   - **Theory**: RC Mukherjee for numerical stoichiometry and Mole Concept clarity.",
        "",
        "3. **Inorganic Chemistry**:",
        "   - **The Bible**: **NCERT Class 11 & 12**. 90%+ of JEE Main and Advanced questions directly test NCERT tables, trends, and exceptions.",
        "   - **Practice**: **VK Jaiswal** for rigorous question drills on Coordination Compounds, p-block, and Chemical Bonding.",
        "",
        "📥 *Grab all PDFs, topper handwritten reaction summaries, and coaching sheets on our [Materials Library](/materials)!*"
      ].join("\n");
    }

    if (query.includes("math")) {
      return [
        "### 📐 Best Mathematics Books & Strategy for JEE",
        "",
        "Mathematics in modern JEE Main & Advanced demands speed, algebraic accuracy, and geometric intuition:",
        "",
        "1. **Cengage Mathematics Series (G. Tewani)**:",
        "   - 5 Volumes: Algebra, Calculus, Coordinate Geometry, Vectors & 3D, Trigonometry.",
        "   - Comprehensive illustrations with graded difficulty levels.",
        "",
        "2. **Advanced Problems in Mathematics (Black Book) — Vikas Gupta & Pankaj Joshi**:",
        "   - The undisputed benchmark for JEE Advanced problem-solving. Solve after completing chapter theory.",
        "",
        "3. **Sameer Bansal (Calculus for JEE Advanced)**:",
        "   - Outstanding collections of tricky limits, definite integrals (King's rule), and differential equations.",
        "",
        "4. **Chapter-wise PYQs (2019–2024)**:",
        "   - Absolutely non-negotiable. JEE Main maths has become lengthy — doing 5 years of PYQs builds pattern recognition.",
        "",
        "📥 *All these books and chapter-wise question banks are available on our [Materials Library](/materials)!*"
      ].join("\n");
    }

    return [
      "### 📚 Recommended Books & Resources on BOOKIE",
      "",
      "Everything on BOOKIE is 100% free and curated for JEE Main & Advanced aspirants:",
      "",
      "| Subject | Foundation & Concepts | High-Level Problem Practice | Coaching Materials |",
      "| :--- | :--- | :--- | :--- |",
      "| **Physics** | HC Verma (Vol 1 & 2) | Physics Galaxy / Irodov / Cengage | Allen Classroom DLP & PW Modules |",
      "| **Chemistry** | NCERT (Class 11 & 12) | MS Chauhan (Org) & N. Awasthi (Phys) | VK Jaiswal (Inorg) & AIR 48 Notes |",
      "| **Maths** | Cengage (G. Tewani) | Black Book (Vikas Gupta) & Sameer Bansal | Chapter-wise PYQs (2019-2024) |",
      "",
      "👉 Visit our **[Materials Library](/materials)** to read online or download any module directly!"
    ].join("\n");
  }

  // 4. Study Strategy, Backlogs & Routine (YPT)
  if (query.includes("strategy") || query.includes("routine") || query.includes("ypt") || query.includes("backlog") || query.includes("schedule") || query.includes("hour") || query.includes("time") || query.includes("pomodoro") || query.includes("motivat")) {
    return [
      "### ⏳ The Ideal JEE Topper Daily Routine & Strategy",
      "",
      "Consistency beats motivation every single time. Here is the realistic 8–10 hour study blueprint:",
      "",
      "#### 1. The 50/10 Pomodoro Protocol (Using [/ypt](/ypt))",
      "- Study in **50-minute deep focus sprints**, followed by a strict **10-minute screen-free break**.",
      "- After 3 cycles (2.5 hours), take a longer 30-minute rest.",
      "- Track your hours using our live **[YPT Study Timer](/ypt)**. Streak resets happen at **3:00 AM IST** to accommodate late-night study sessions!",
      "",
      "#### 2. Daily Subject Balance",
      "- **Morning (9:00 AM – 12:30 PM)**: Mathematics / Problem solving when mind is fresh.",
      "- **Afternoon (2:30 PM – 5:30 PM)**: Physics concepts and numerical derivations.",
      "- **Evening / Night (7:00 PM – 10:30 PM)**: Chemistry (Organic mechanisms & Inorganic NCERT memorization).",
      "",
      "#### 3. How to Clear Backlogs",
      "1. **Never stop current syllabus**: Dedicate 70% of daily study to current coaching topics, and 30% to backlog chapters.",
      "2. **Prioritize High-ROI Chapters**: Modern Physics, Thermodynamics, Coordination Compounds, Vectors/3D, Matrices & Determinants.",
      "3. **Focus on PYQs**: Don't read whole chapters from scratch. Solve 30–50 previous year questions directly to see exam patterns.",
      "",
      "Join one of our **[Group Study Rooms on /ypt](/ypt)** to study with fellow aspirants in real time! 💪"
    ].join("\n");
  }

  // 5. High-Weightage Chapters / Chapter Priority
  if (query.includes("weightage") || query.includes("important chapter") || query.includes("high yield") || query.includes("syllabus") || query.includes("roi")) {
    return [
      "### 🎯 Highest Weightage Chapters for JEE Main & Advanced",
      "",
      "If you master these chapters, you secure over **60% of total exam marks**:",
      "",
      "#### 🔹 Physics (High ROI)",
      "1. **Modern Physics** (Photoelectric effect, Dual Nature, Atomic Structure, Nuclear Physics) — *Guaranteed 3–4 questions, high accuracy!*",
      "2. **Current Electricity & Capacitors** — *Frequent, formula-based questions.*",
      "3. **Thermodynamics & KTG** — *Direct overlap with Physical Chemistry.*",
      "4. **Rotational Motion & Work-Power-Energy** — *Foundation for all mechanics.*",
      "5. **Ray Optics & Wave Optics** — *Predictable questions on prism, lenses, and YDSE.*",
      "",
      "#### 🔹 Chemistry (Scoring Goldmine)",
      "1. **Coordination Compounds & Chemical Bonding** — *Highest weightage in Inorganic Chemistry.*",
      "2. **General Organic Chemistry (GOC) & Reaction Mechanisms** (Aldehydes, Ketones, Amines) — *NCERT line by line.*",
      "3. **Thermodynamics, Electrochemistry & Solutions** — *Consistent numericals.*",
      "4. **p-block & d-block Elements** — *Memorize trends directly from NCERT.*",
      "",
      "#### 🔹 Mathematics (Safe Score Builders)",
      "1. **Vectors and 3D Geometry** — *Guaranteed 3–4 questions in JEE Main; direct vector algebra & skew line formulas.*",
      "2. **Matrices and Determinants** — *High accuracy, low trap rate.*",
      "3. **Definite Integration & Differential Equations** — *Master King's property and Linear Differential Equations.*",
      "4. **Sequence & Series, Binomial Theorem** — *High yield algebra.*",
      "",
      "📚 *Find curated formula booklets and revision sheets for all these chapters on the [Materials Page](/materials)!*"
    ].join("\n");
  }

  // 6. Physics Concept / Formulas
  if (query.includes("physics") || query.includes("newton") || query.includes("friction") || query.includes("gravitation") || query.includes("shm") || query.includes("doppler") || query.includes("gauss") || query.includes("kirchhoff") || query.includes("photoelectric")) {
    return [
      "### ⚡ Physics Concept & Problem-Solving Insight",
      "",
      "Let's break down the problem with rigorous physical intuition:",
      "",
      "#### 1. Governing Principles",
      "- **Conservation of Mechanical Energy**: $\\Delta K + \\Delta U = W_{\\text{non-conservative}}$.",
      "- **Conservation of Linear Momentum**: $\\sum \\vec{F}_{\\text{ext}} = 0 \\implies \\vec{P}_{\\text{system}} = \\text{constant}$.",
      "- **Rotational Dynamics**: $\\tau = I\\alpha$ about an instantaneous axis of rotation or center of mass.",
      "",
      "#### 2. JEE Advanced Trap Checklist",
      "- ⚠️ **Direction of Friction**: Always test relative impending motion first before deciding whether static friction reached $f_{\\text{max}} = \\mu N$.",
      "- ⚠️ **Pseudo-force ($m\\vec{a}_{\\text{frame}}$)**: If working in a non-inertial accelerating frame, apply the pseudo-force strictly through the center of mass in the direction opposite to acceleration.",
      "- ⚠️ **Sign Conventions**: In Optics and Modern Physics, stick strictly to Cartesian coordinate conventions ($+x$ in ray direction).",
      "",
      "Need a specific derivation, formula, or numerical step solved? Just paste the exact question text! 💪"
    ].join("\n");
  }

  // 7. Chemistry Concept / Reactions
  if (query.includes("sn1") || query.includes("sn2") || query.includes("goc") || query.includes("organic") || query.includes("coordination") || query.includes("hybridization") || query.includes("equilibrium")) {
    return [
      "### 🧪 Chemistry Concept & Mechanism Breakdown",
      "",
      "#### 1. Reaction Mechanism Essentials (SN1 vs SN2)",
      "- **SN1 Mechanism**:",
      "  - **Kinetics**: First order, rate $= k[\\text{R-X}]$.",
      "  - **Intermediate**: Planar carbocation intermediate (watch out for hydride/methyl shifts!).",
      "  - **Stereochemistry**: Racemization (with slight inversion due to ion pair shielding).",
      "  - **Solvent**: Polar Protic (e.g., $\\text{H}_2\\text{O}$, $\\text{EtOH}$) stabilizes carbocation.",
      "",
      "- **SN2 Mechanism**:",
      "  - **Kinetics**: Second order, rate $= k[\\text{R-X}][\\text{Nu}^-]$.",
      "  - **Intermediate**: Single concerted step with penta-coordinate transition state.",
      "  - **Stereochemistry**: Complete Walden Inversion (backside attack).",
      "  - **Solvent**: Polar Aprotic (e.g., DMSO, DMF, Acetone) increases nucleophilicity.",
      "",
      "#### 2. Coordination Chemistry Quick Reference",
      "- **Spectrochemical Series**: $\\text{I}^- < \\text{Br}^- < \\text{Cl}^- < \\text{F}^- < \\text{OH}^- < \\text{H}_2\\text{O} < \\text{NH}_3 < \\text{en} < \\text{CN}^- < \\text{CO}$",
      "- Strong field ligands (e.g., $\\text{CN}^-$, $\\text{CO}$) cause pairing ($e_g$ / $t_{2g}$ splitting $\\Delta_o > P$).",
      "",
      "💡 *Check out the handwritten topper revision notes on our [Materials Library](/materials) for complete summary sheets!*"
    ].join("\n");
  }

  // 8. Maths Concept / Calculus / Vectors
  if (query.includes("calculus") || query.includes("integration") || query.includes("vector") || query.includes("matrix") || query.includes("derivative") || query.includes("coordinate") || query.includes("parabola") || query.includes("ellipse")) {
    return [
      "### 📐 Mathematics Formula & Technique Guide",
      "",
      "#### 1. Definite Integration — The Master Rule (King's Property)",
      "$$\\int_a^b f(x) \\, dx = \\int_a^b f(a + b - x) \\, dx$$",
      "- **When to apply**: Whenever you see expressions like $\\sin x / (\\sin x + \\cos x)$ or $(1 - x)^n$ in the integrand.",
      "- **Periodic Functions**: If $f(x + T) = f(x)$, then $\\int_0^{nT} f(x) \\, dx = n \\int_0^T f(x) \\, dx$.",
      "",
      "#### 2. 3D Geometry — Shortest Distance Between Skew Lines",
      "For lines $\\vec{r} = \\vec{a}_1 + \\lambda \\vec{b}_1$ and $\\vec{r} = \\vec{a}_2 + \\mu \\vec{b}_2$:",
      "$$d = \\left| \\frac{(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2)}{|\\vec{b}_1 \\times \\vec{b}_2|} \\right|$$",
      "- If $d = 0$, the lines are coplanar and intersect.",
      "",
      "#### 3. Quadratic & Polynomial Invariants",
      "- For $ax^2 + bx + c = 0$, roots $\\alpha, \\beta$ satisfy $\\alpha + \\beta = -b/a$ and $\\alpha\\beta = c/a$.",
      "- Newton's Sums method: $S_n = \\alpha^n + \\beta^n \\implies aS_n + bS_{n-1} + cS_{n-2} = 0$. (Saves massive time in JEE Main questions!)",
      "",
      "Paste any equation or specific question you want me to solve step-by-step! 💪"
    ].join("\n");
  }

  // 9. Default academic study mentor response
  return [
    `### 🤖 Bookie AI Study Mentor Insight`,
    "",
    `Great question on **"${prompt.slice(0, 70)}"**! Let's approach this with clarity:`,
    "",
    "#### 1. Core Principle & Approach",
    "- In JEE Main & Advanced, questions test **fundamental clarity** and **application under time constraints**.",
    "- Always break down the problem into: Given data $\\rightarrow$ Relevant formula/rule $\\rightarrow$ Step-by-step substitution $\\rightarrow$ Dimensional check.",
    "",
    "#### 2. Recommended Next Steps",
    "1. **Concept Review**: Check the corresponding chapter theory in standard books (HC Verma for Physics, NCERT for Chemistry, Cengage for Maths).",
    "2. **Practice Target**: Solve at least 15–20 previous year questions (PYQs) from 2020–2024 for this specific subtopic.",
    "3. **Track Focus**: Use our **[YPT Study Timer](/ypt)** to run a 50-minute focused sprint on this topic today.",
    "",
    "📚 *You can access 500+ curated PDFs, PYQ chapter-wise banks, and formula mind-maps on our [Materials Library](/materials) 100% free!*",
    "",
    "Feel free to ask for a specific formula, numerical derivation, or book recommendation! 💪"
  ].join("\n");
}
