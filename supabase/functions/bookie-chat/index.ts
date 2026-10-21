import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Bookie AI 🤖 — the intelligent, supportive, and dedicated personal study mentor for JEE (Main & Advanced) aspirants on the BOOKIE platform.

## Your Identity & Vibe
- Name: Bookie AI 🤖
- Tagline: "Your Personal JEE Study Mentor"
- Persona: Like an empathetic, top-ranker senior or mentor (Bhaiya/Didi vibe). Intelligent, calm, encouraging, and deeply practical.
- Never robotic, never overly formal, and never discouraging.
- Use encouraging affirmations like "You've got this 💪", "Let's crack this step-by-step", "Focus on the concepts first."

## Comprehensive Knowledge of BOOKIE Platform
BOOKIE (bookieshere.com) is built by a solo student developer for all JEE aspirants with love. Everything on the platform is 100% free.

### Key Website Sections & Routes:
1. **Home (`/`)**:
   - JEE 2027 Countdown: Live day/hour counters for JEE Main 2027 Session 1 (Jan 22, 2027), Session 2 (Apr 2, 2027), and JEE Advanced 2027 (May 16, 2027).
   - Quick access to all subjects, trending materials, daily study quotes, and community updates.
2. **Materials Library (`/materials`)**:
   - Over 500+ curated PDFs, modules, PYQs, and high-yield reference books with direct view and download.
   - **Physics Resources**:
     - Concepts of Physics by HC Verma (Vol 1 & 2) — best for foundation & intuition.
     - I.E. Irodov & Krotov — for top-rank problem solving and Olympiad level.
     - Physics Galaxy series by Ashish Arora — comprehensive theory + advanced illustrations.
     - Cengage Physics by BM Sharma — thorough practice.
     - Pathfinder for Olympiad & JEE Advanced (Arvind Tiwari & Sachin Singh).
   - **Chemistry Resources**:
     - Organic Chemistry: MS Chauhan (Advanced Problems), Akshay Choudhary, Himanshu Pandey.
     - Physical Chemistry: Narendra Awasthi (Balaji), P. Bahadur, RC Mukherjee.
     - Inorganic Chemistry: VK Jaiswal, JD Lee (adapted by Sudarshan Guha), NCERT line-by-line notes.
     - NCERT Class 11 & 12 Chemistry (the absolute Bible for JEE Main & Advanced).
   - **Mathematics Resources**:
     - Cengage Mathematics series by G. Tewani (Algebra, Calculus, Coordinate Geometry, Vectors & 3D, Trigonometry).
     - Vikas Gupta & Pankaj Joshi (Black Book for Advanced Problems in Mathematics).
     - Sameer Bansal (Calculus).
     - Chapter-wise PYQs (2019–2024) with step-by-step solutions.
   - **Coaching Modules & Topper Notes**:
     - Allen DLP / Classroom Modules (Physics, Chemistry, Maths).
     - Resonance Rank Booster & Study Material.
     - Physics Wallah (PW) Arjuna & Lakshya AIR Modules.
     - AIR 48 Hand-written Topper Notes and ALL IN ONE LN Materials.
     - Formula Booklets & Quick Revision Mind-Maps.
3. **YPT Study Timer & Study Rooms (`/ypt`)**:
   - Inspired by YPT (Yeolpumta) for tracking focused study hours.
   - Live Stopwatch & Pomodoro Timer modes.
   - Target tracking with progress ring.
   - 3:00 AM IST daily streak reset to match Indian student late-night study routines.
   - Study Rooms / Group studying to stay accountable with fellow aspirants.
4. **Test Series Hub (`/tests`)**:
   - Details, syllabus breakdowns, and schedules for top test series: MathonGo (Quizrr), Allen Leader & Major, Resonance, PW AITS.
5. **Portals & Educational Links (`/portals`)**:
   - Direct quick-links to official NTA JEE Main, JEE Advanced, JoSAA counselling, and test portals.
6. **Aspirant Lounge / Community (`/community`)**:
   - Discussion forum where aspirants share doubts, strategies, daily targets, and support each other.
7. **Support & Contact (`/support`)**:
   - Help desk and ticket submission for feedback, missing book requests, or technical issues.
8. **Support the Creator (`/donate`)**:
   - "Buy Me a Chai ☕" page to support the solo student developer who maintains the servers and keeps Bookie free.

## Academic & Problem-Solving Guidelines
1. **Doubt Solving**:
   - Break problems down into:
     - 1. Given data & Concept involved
     - 2. Relevant Formula / Theorem
     - 3. Step-by-step algebraic or conceptual solution
     - 4. Final Answer highlighted clearly
     - 5. Common traps / pitfalls to avoid
2. **Material Recommendations**:
   - When asked for book recommendations, suggest the exact books available on the BOOKIE `/materials` page and explain who should use them (e.g., beginner vs advanced).
3. **Study Strategy & Time Management**:
   - Prioritize high-weightage chapters (e.g., Modern Physics, Thermodynamics, Coordination Compounds, Vectors/3D, Definite Integration).
   - Recommend using the `/ypt` timer for 50/10 Pomodoro cycles.
4. **Safety & Guardrails (Strict)**:
   - Strictly academic, motivational, and educational content.
   - Politely decline non-academic, NSFW, offensive, or harmful queries with: "I'm your Bookie study buddy! Let's get back to cracking JEE 📚💪".`;

function generateLocalMentorResponse(promptText: string): string {
  const q = promptText.toLowerCase().trim();

  if (/^(hi|hello|hey|yo|namaste|sup|good\s*(morning|afternoon|evening))\b/i.test(q)) {
    return [
      "Hey champ! 👋 I'm **Bookie AI** — your dedicated JEE (Main & Advanced) study mentor.",
      "",
      "Whether you're studying as a guest or logged in with Google/Email, I'm here 24/7 to help you crack your exam:",
      "",
      "- 📚 **Materials & Books**: Ask about HC Verma, Cengage, MS Chauhan, or Allen/PW modules on [/materials](/materials).",
      "- ❓ **Concept Doubts & Formulas**: Ask me any question across Physics, Chemistry, or Maths.",
      "- ⏱️ **Study Routine & YPT Tracker**: Learn how to use our [/ypt](/ypt) stopwatch & Pomodoro rooms to study 8–10 hours consistently.",
      "- 🎯 **High-Weightage Chapters**: Find out the highest ROI chapters to boost your score fast.",
      "",
      "What concept, chapter, or problem are we tackling today? Let's crack it step-by-step! 💪"
    ].join("\n");
  }

  if (q.includes("book") || q.includes("material") || q.includes("module") || q.includes("pdf") || q.includes("pyq") || q.includes("notes")) {
    if (q.includes("physic")) {
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

    if (q.includes("chem")) {
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

    if (q.includes("math")) {
      return [
        "### 📐 Best Mathematics Books & Strategy for JEE",
        "",
        "Mathematics in modern JEE Main & Advanced demands speed, algebraic accuracy, and geometric intuition:",
        "",
        "1. **Cengage Mathematics Series (G. Tewani)**:",
        "   - 5 Volumes: Algebra, Calculus, Coordinate Geometry, Vectors & 3D, Trigonometry.",
        "   - Graded difficulty from basic conceptual illustrations to JEE Advanced archive.",
        "",
        "2. **Advanced Problems in Mathematics (Black Book) — Vikas Gupta & Pankaj Joshi**:",
        "   - The benchmark for JEE Advanced problem-solving. Solve after completing chapter theory.",
        "",
        "3. **Sameer Bansal (Calculus for JEE Advanced)**:",
        "   - Outstanding collections of tricky limits, definite integrals (King's rule), and differential equations.",
        "",
        "4. **Chapter-wise PYQs (2019–2024)**:",
        "   - Absolutely non-negotiable. Doing 5 years of PYQs builds real exam pattern recognition.",
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

  if (q.includes("strategy") || q.includes("routine") || q.includes("ypt") || q.includes("backlog") || q.includes("hour") || q.includes("time") || q.includes("pomodoro") || q.includes("motivat")) {
    return [
      "### ⏳ The Ideal JEE Topper Daily Routine & Strategy",
      "",
      "Consistency beats motivation every single time. Here is the realistic 8–10 hour study blueprint:",
      "",
      "#### 1. The 50/10 Pomodoro Protocol (Using [/ypt](/ypt))",
      "- Study in **50-minute deep focus sprints**, followed by a strict **10-minute screen-free break**.",
      "- After 3 cycles (2.5 hours), take a longer 30-minute rest.",
      "- Track your hours using our live **[YPT Study Timer](/ypt)**. Streak resets happen at **3:00 AM IST** to accommodate late-night study routines!",
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

  if (q.includes("weightage") || q.includes("important chapter") || q.includes("high yield") || q.includes("syllabus") || q.includes("roi")) {
    return [
      "### 🎯 Highest Weightage Chapters for JEE Main & Advanced",
      "",
      "If you master these chapters, you secure over **60% of total exam marks**:",
      "",
      "#### 🔹 Physics (High ROI)",
      "1. **Modern Physics** (Photoelectric effect, Dual Nature, Atomic Structure, Nuclear Physics) — *Guaranteed 3–4 questions!*",
      "2. **Current Electricity & Capacitors** — *Frequent, formula-based questions.*",
      "3. **Thermodynamics & KTG** — *Direct overlap with Physical Chemistry.*",
      "4. **Rotational Motion & Work-Power-Energy** — *Foundation for all mechanics.*",
      "5. **Ray Optics & Wave Optics** — *Predictable questions on prism, lenses, and YDSE.*",
      "",
      "#### 🔹 Chemistry (Scoring Goldmine)",
      "1. **Coordination Compounds & Chemical Bonding** — *Highest weightage in Inorganic Chemistry.*",
      "2. **General Organic Chemistry (GOC) & Reaction Mechanisms** — *NCERT line by line.*",
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

  return [
    `### 🤖 Bookie AI Study Mentor Insight`,
    "",
    `Great question on **"${promptText.slice(0, 60)}"**! Let's approach this methodically:`,
    "",
    "#### 1. Core Principle & Approach",
    "- In JEE Main & Advanced, questions test **fundamental clarity** and **application under time constraints**.",
    "- Always break down the problem into: Given constraints $\\rightarrow$ Relevant formula/rule $\\rightarrow$ Step-by-step substitution $\\rightarrow$ Dimensional/sanity check.",
    "",
    "#### 2. Recommended Action Plan",
    "1. **Concept Review**: Check the corresponding chapter theory in standard books (HC Verma for Physics, NCERT for Chemistry, Cengage for Maths).",
    "2. **Practice Target**: Solve at least 15–20 previous year questions (PYQs) from 2020–2024 for this specific subtopic.",
    "3. **Track Focus**: Use our **[YPT Study Timer](/ypt)** to run a 50-minute focused sprint on this topic today.",
    "",
    "📚 *You can access 500+ curated PDFs, PYQ chapter-wise banks, and formula mind-maps on our [Materials Library](/materials) 100% free!*",
    "",
    "Feel free to ask for a specific formula, numerical step, or chapter recommendation! 💪"
  ].join("\n");
}

function streamResponse(text: string): Response {
  const encoder = new TextEncoder();
  const chunks = text.split(/(\s+)/);

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        if (!chunk) continue;
        const payload = JSON.stringify({
          choices: [{ delta: { content: chunk } }]
        });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        // Small delay between tokens for natural streaming
        await new Promise((r) => setTimeout(r, 15));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional Authentication check - works for guests, email, and Google users
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    // Only attempt user verification if token is not the anon key
    if (SUPABASE_URL && SUPABASE_ANON_KEY && token && token !== SUPABASE_ANON_KEY) {
      try {
        const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        await authClient.auth.getUser(token);
      } catch (_authError) {
        // Safe fallback: allow guests & unauthenticated users to use Bookie AI without error!
      }
    }

    const { messages } = await req.json();
    const lastUserMessage = messages && messages.length > 0 
      ? messages[messages.length - 1] 
      : { content: "" };

    const promptText = typeof lastUserMessage.content === "string" 
      ? lastUserMessage.content 
      : Array.isArray(lastUserMessage.content) 
        ? (lastUserMessage.content.find((p: any) => p.type === "text")?.text || "")
        : "";

    // Support both OPENROUTER_API_KEY and OPENROUTER_KEY or fallback to LOVABLE_API_KEY
    const apiKey = Deno.env.get("OPENROUTER_API_KEY") || 
                   Deno.env.get("OPENROUTER_KEY") || 
                   Deno.env.get("LOVABLE_API_KEY");
                   
    const model = Deno.env.get("OPENROUTER_MODEL") || "google/gemini-2.0-flash-001";

    if (!apiKey) {
      // If external provider key is not yet set in cloud secrets,
      // seamlessly stream the built-in JEE mentor response so the app ALWAYS works!
      const fallbackText = generateLocalMentorResponse(promptText);
      return streamResponse(fallbackText);
    }

    // Call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://bookieshere.com",
        "X-Title": "Bookie AI",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`OpenRouter API issue (${response.status}): ${errText.slice(0, 100)} - Falling back to built-in mentor engine.`);
      // Graceful fallback on API error / quota limits
      const fallbackText = generateLocalMentorResponse(promptText);
      return streamResponse(fallbackText);
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Bookie chat error:", error);
    // Even in unhandled exception, return a valid mentor stream instead of crashing
    const fallbackText = generateLocalMentorResponse("JEE study help");
    return streamResponse(fallbackText);
  }
});
