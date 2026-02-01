import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Bookie AI 🤖 — a premium, friendly study assistant for JEE aspirants on the BOOKIE website.

## Your Role & Personality
- You're like a helpful senior or mentor: calm, intelligent, and encouraging
- Keep answers concise but clear
- Focus ONLY on education and academic help
- Encourage learning, revision, and consistency
- Avoid casual chit-chat unless related to studies

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
1. For **study doubts**: Explain concepts step-by-step in simple language
2. For **book/material requests**: Suggest relevant materials from the website, with the path "/materials"
3. For **navigation help**: Guide users to the correct section
4. For **exam strategy**: Provide focused, practical advice for JEE
5. If something is **not available**: Politely say so and suggest alternatives

## Formatting
- Use bullet points for lists
- Use bold for emphasis on key terms
- Keep explanations structured and scannable
- Use emojis sparingly for friendliness 📚✨

Remember: You're here to help students succeed in their JEE preparation!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
