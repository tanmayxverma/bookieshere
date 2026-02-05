 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 const JEE_MAIN_CONFIG = {
   totalQuestions: 90,
   duration: 180,
   sections: {
     physics: { mcq: 20, numerical: 10 },
     chemistry: { mcq: 20, numerical: 10 },
     mathematics: { mcq: 20, numerical: 10 },
   },
   marks: { positive: 4, negative: 1 },
 };
 
 const JEE_ADVANCED_CONFIG = {
   totalQuestions: 54,
   duration: 180,
   sections: {
     physics: { single: 6, multi: 6, numerical: 6 },
     chemistry: { single: 6, multi: 6, numerical: 6 },
     mathematics: { single: 6, multi: 6, numerical: 6 },
   },
   marks: {
     single: { positive: 3, negative: 1 },
     multi: { positive: 4, negative: 2, partial: true },
     numerical: { positive: 3, negative: 0 },
   },
 };
 
 const SYSTEM_PROMPT = `You are a JEE exam question generator. Generate authentic, high-quality questions for JEE Main and JEE Advanced exams.
 
 CRITICAL REQUIREMENTS:
 1. Questions must be conceptually accurate and test real understanding
 2. Difficulty must match the exam type (JEE Main = moderate, JEE Advanced = challenging)
 3. Include proper mathematical notation using LaTeX ($ for inline, $$ for block)
 4. Generate original questions, not exact copies of PYQs
 5. Cover the specified chapter thoroughly
 6. Include step-by-step solutions with proper explanations
 
 OUTPUT FORMAT (JSON):
 {
   "questions": [
     {
       "question_text": "Question with $LaTeX$ if needed",
       "question_type": "single_correct|multi_correct|numerical|integer",
       "options": [
         {"label": "A", "text": "Option text with $math$"},
         {"label": "B", "text": "..."},
         {"label": "C", "text": "..."},
         {"label": "D", "text": "..."}
       ],
       "correct_answer": "A" or ["A", "C"] for multi or "42" for numerical,
       "solution": "Step-by-step solution with $LaTeX$",
       "chapter": "Chapter name"
     }
   ]
 }
 
 For numerical questions, options should be null and correct_answer should be the numerical value.
 For multi-correct, correct_answer is an array of correct option labels.`;
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { examType, syllabusType, chapters, userId } = await req.json();
     
     console.log("Generating test:", { examType, syllabusType, chaptersCount: chapters?.length, userId });
 
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
     const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 
     if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
     if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");
 
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
     const config = examType === "jee_main" ? JEE_MAIN_CONFIG : JEE_ADVANCED_CONFIG;
     
     // Group chapters by subject
     const chaptersBySubject: Record<string, string[]> = {
       physics: [],
       chemistry: [],
       mathematics: [],
     };
     
     chapters.forEach((ch: { name: string; subject: string }) => {
       if (chaptersBySubject[ch.subject]) {
         chaptersBySubject[ch.subject].push(ch.name);
       }
     });
 
     // Generate questions for each subject
     const allQuestions: any[] = [];
     let questionNumber = 1;
 
     for (const subject of ["physics", "chemistry", "mathematics"]) {
       const subjectChapters = chaptersBySubject[subject];
       if (subjectChapters.length === 0) continue;
 
       const questionsPerType = examType === "jee_main"
         ? { single_correct: 20, numerical: 10 }
         : { single_correct: 6, multi_correct: 6, numerical: 6 };
 
       for (const [qType, count] of Object.entries(questionsPerType)) {
         const prompt = `Generate ${count} ${qType.replace("_", " ")} questions for JEE ${examType === "jee_main" ? "Main" : "Advanced"}.
 
 Subject: ${subject}
 Chapters to cover: ${subjectChapters.join(", ")}
 Question Type: ${qType}
 
 Requirements:
 - Each question must be from one of the specified chapters
 - Distribute questions evenly across chapters
 - ${examType === "jee_advanced" ? "Questions should be challenging, testing deep conceptual understanding" : "Questions should be moderate difficulty, testing core concepts"}
 - Include detailed step-by-step solutions
 
 Return ONLY valid JSON matching the specified format.`;
 
         try {
           const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
             method: "POST",
             headers: {
               Authorization: `Bearer ${LOVABLE_API_KEY}`,
               "Content-Type": "application/json",
             },
             body: JSON.stringify({
               model: "google/gemini-3-flash-preview",
               messages: [
                 { role: "system", content: SYSTEM_PROMPT },
                 { role: "user", content: prompt },
               ],
               response_format: { type: "json_object" },
             }),
           });
 
           if (!aiResponse.ok) {
             console.error(`AI error for ${subject} ${qType}:`, await aiResponse.text());
             continue;
           }
 
           const aiData = await aiResponse.json();
           const content = aiData.choices?.[0]?.message?.content;
           
           if (content) {
             try {
               const parsed = JSON.parse(content);
               const questions = parsed.questions || [];
               
               questions.forEach((q: any) => {
                 const marks = examType === "jee_main"
                   ? { positive: 4, negative: 1, partial: false }
                   : qType === "multi_correct"
                     ? { positive: 4, negative: 2, partial: true }
                     : qType === "numerical"
                       ? { positive: 3, negative: 0, partial: false }
                       : { positive: 3, negative: 1, partial: false };
 
                 allQuestions.push({
                   question_number: questionNumber++,
                   subject,
                   chapter: q.chapter || subjectChapters[0],
                   question_type: qType,
                   question_text: q.question_text,
                   options: q.options || null,
                   correct_answer: q.correct_answer,
                   marks_positive: marks.positive,
                   marks_negative: marks.negative,
                   partial_marking: marks.partial,
                   solution: q.solution,
                   diagram_url: null,
                 });
               });
             } catch (parseError) {
               console.error(`Parse error for ${subject} ${qType}:`, parseError);
             }
           }
         } catch (aiError) {
           console.error(`AI call error for ${subject} ${qType}:`, aiError);
         }
       }
     }
 
     if (allQuestions.length === 0) {
       throw new Error("Failed to generate questions. Please try again.");
     }
 
     // Calculate total marks
     const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks_positive, 0);
 
     // Create test record
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
 
     // Insert questions
     const questionsToInsert = allQuestions.map(q => ({
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
 
     // Update test to in_progress
     await supabase
       .from("tests")
       .update({ status: "in_progress", started_at: new Date().toISOString() })
       .eq("id", test.id);
 
     console.log(`Generated ${questions.length} questions for test ${test.id}`);
 
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