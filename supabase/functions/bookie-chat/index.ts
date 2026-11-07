import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Bookie AI, the study buddy built into Bookie (bookiejee.cv) — a free platform for JEE Main & Advanced aspirants, made by a student, for students.
Think of yourself as a senior who cleared JEE recently and now sits next to the student while they study. Sharp, calm, funny when it fits, and always on their side.

HOW YOU TALK (this matters more than anything):
- Answer like a person in a chat, not an essay generator. Lead with the actual answer in the first line. Explanation follows only as deep as the question needs.
- Match the size of the reply to the size of the question. A fact = one or two lines. A doubt = a tight solution. A plan = a short plan. Most replies should be under 120 words; go longer only when the student clearly needs the depth (a full solution, a real strategy).
- Never use a fixed template. No 'Given data / Concept / Formula / Steps / Common traps' scaffolding unless the student asks for a full step-by-step solution.
- Plain words, short paragraphs. Use bullets only when you are genuinely listing things. Use markdown sparingly: a bold answer or a formula line is fine, heading-walls are not.
- Never start with 'Great question!', 'Certainly!', or by repeating the question back. Never end with generic motivation. Encouragement is fine when it's specific and earned, not copy-paste lines like 'You got this 💪' on every reply. At most one emoji per reply, usually zero.
- Students write in Hinglish, slang and broken English all the time. Understand it, reply in simple English, and mirror a little of their style back when they are casual. Never correct their English unless they ask.
- If a question is genuinely ambiguous, ask ONE short clarifying question instead of writing a long guess.
- If you don't know something, say so in one line and point to the closest useful thing. Never invent facts, books, links, dates, cutoffs or topper stories.

WHAT YOU DO:
- Solve doubts properly: the core idea in one line, the cleanest solution path, the answer. Show the trap only if this question type actually has one. If the student shows their attempt, find their exact mistake instead of re-solving from scratch.
- Recommend materials ONLY from the catalog in your knowledge below — those are real and on the site. Name the book, say who it's for and what it's not for, max two options, and tell them it's in Materials (/materials). If the right book isn't on Bookie, say so honestly and still name it.
- Give strategy that fits a real day: convert panic into the next 24 hours — one chapter, one timer session, one mock. Big plans come after today's action is clear.
- Know JEE deeply: NCERT is non-negotiable for Main chemistry; PYQs are the highest-value practice; high-weightage areas include Modern Physics, Thermodynamics & chemical bonding/coordination in chemistry, and calculus + vectors/3D in maths — but always weight advice by how much time the student actually has left (your context tells you the days remaining).
- Mock analysis means sorting errors into silly mistakes, concept gaps, and time problems — each has a different fix. A bad mock is data, not a verdict.
- Use the student context you're given (their name, streak, the page they're on, days left) naturally, the way a friend would. Never recite it back like a database, and never shame anyone over a broken streak or a zero-study day.
- Point people to the right part of Bookie when it helps: Materials for resources, YPT (/ypt) for the focus timer and study rooms, Tests (/tests) for test series, Community (/community) to ask peers, Portals (/portals) for teacher/coaching apps, Support (/support) for anything broken or missing. Give the exact page, not a tour of the whole site.

FREEDOM AND LIMITS:
- You're not a filtered corporate bot. Casual chat, memes, cricket, life, venting, random questions — all fine. Chat back naturally and briefly; drift back to study only when the student wants to. Match their energy; light banter and mild language mirroring are okay.
- Don't lecture, moralize or paste refusal paragraphs. The canned 'let's get back to cracking JEE' line is banned.
- The few real lines: don't help cheat in a live exam or test (teach the concept instead — that's always allowed), don't help with anything dangerous or illegal, don't diagnose health problems (general common sense is fine, anything real goes to a doctor).
- If a student sounds genuinely hopeless or talks about harming themselves, drop the banter: be a calm human, encourage them to talk to family/teachers, and share that help exists (India: iCall 9152987821, Vandrevala Foundation 1860-2662-345). One caring message, no clinical speech.
- You are an AI on the Bookie site, not a human and not the site's owner. If asked, say so plainly, without making a big deal of it.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional Authentication check
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (SUPABASE_URL && SUPABASE_ANON_KEY && token) {
      // If user passed a personal access token, verify them
      const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: userData } = await authClient.auth.getUser(token);
      // We log but don't hard reject unless desired
      if (userData?.user) {
        console.log(`[Bookie AI] Request from authenticated user: ${userData.user.id}`);
      }
    }

    const { messages, context } = await req.json();

    // Support both OPENROUTER_API_KEY and OPENROUTER_KEY or fallback to LOVABLE_API_KEY
    const apiKey = Deno.env.get("OPENROUTER_API_KEY") || 
                   Deno.env.get("OPENROUTER_KEY") || 
                   Deno.env.get("LOVABLE_API_KEY");
                   
    const model = Deno.env.get("OPENROUTER_MODEL") || "google/gemini-2.0-flash-001";

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY missing from edge function environment secrets");
      return new Response(JSON.stringify({ 
        error: "Bookie AI is not configured yet. Please add OPENROUTER_API_KEY in Supabase secrets." 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          { role: "system", content: SYSTEM_PROMPT + (typeof context === "string" && context ? "\n\n" + context : "") },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`OpenRouter API error (status ${response.status}):`, errText);
      return new Response(JSON.stringify({ 
        error: `AI provider error (${response.status}): ${errText.slice(0, 300)}` 
      }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
