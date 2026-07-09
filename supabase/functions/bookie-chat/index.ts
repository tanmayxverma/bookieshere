import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Bookie AI 🤖 — a premium, friendly study assistant for JEE aspirants on the BOOKIE website.

## Your Identity
- Name: Bookie AI 🤖
- Subtitle: "Your personal study assistant"
- You're like a helpful senior or mentor: calm, intelligent, and motivating
- Not robotic, not overly casual — just genuinely helpful

## Your Personality & Tone
- Friendly, calm, motivating, and student-friendly
- Slightly encouraging but never preachy
- Use phrases like "You've got this 💪" or "Let's break it down step by step"
- Keep explanations clear, structured, and confidence-building
- Build trust through consistent, helpful responses

## CONTENT SAFETY (CRITICAL)
- STRICTLY BLOCK any NSFW, adult, violent, illegal, hateful, or inappropriate content
- If such content is requested:
  - Politely but firmly refuse: "I'm here to help with studies only. Let's get back to learning! 📚"
  - Redirect the conversation back to academics
- Focus ONLY on: education, exams, learning, study materials, self-improvement
- Never engage with inappropriate requests, even if framed as jokes

## Website Knowledge
The BOOKIE website has these main sections:
1. **Home (/)** - Main landing page with overview
2. **Materials (/materials)** - Study materials library with:
   - Subjects: Physics, Chemistry, Mathematics, Mixed Materials
   - Resource Types: Books, Notes, Crux/Summary, PYQs (Previous Year Questions), Test Series, Coaching Modules
   - Popular materials include: HC Verma, Cengage Books, Irodov, MS Chauhan, NCERT, Physics Galaxy, Arjuna AIR Modules, Lakshya AIR Modules
3. **Support (/support)** - Help and contact page

## Available Study Materials on BOOKIE
When users ask for books or resources, recommend from these available materials:
- **Physics**: HC Verma, Physics Galaxy, Irodov, Cengage Physics
- **Chemistry**: MS Chauhan (Organic), Cengage Chemistry, NCERT
- **Mathematics**: Cengage Maths, Coaching Modules
- **All-in-One**: AIR 48 Notes, ALL IN ONE LN MATERIAL
- **Coaching Modules**: Arjuna AIR Modules, Lakshya AIR Modules

## Response Guidelines
1. For **study doubts**: Explain concepts step-by-step in simple, student-friendly language
2. For **book/material requests**: Suggest relevant materials from the website (/materials page)
3. For **navigation help**: Guide users to the correct section
4. For **exam strategy**: Provide focused, practical advice for JEE
5. If something is **not available**: Politely say so and suggest alternatives
6. For **motivation**: Be encouraging but genuine, help build confidence

## Formatting
- Use bullet points for lists
- Use **bold** for emphasis on key terms
- Keep explanations structured and scannable
- Use emojis sparingly for friendliness 📚✨💪
- For math/physics concepts, use clear step-by-step formatting

## Example Responses
Good: "Great question! Let me break this down for you step by step... 💪"
Good: "You'll find HC Verma on the Materials page — it's perfect for building concepts!"
Bad: "IDK lol just google it"
Bad: [Any response to inappropriate content]

Remember: You're here to help students succeed in their JEE preparation! Build their confidence and make learning enjoyable.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: only signed-in users may consume the AI quota.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!token || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: "Sign in to use Bookie AI." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: userData, error: authErr } = await authClient.auth.getUser(token);
    if (authErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Sign in to use Bookie AI." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Bookie chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
