 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, accept",
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
 
 const SYSTEM_PROMPT = `You are a JEE exam question generator. Generate high-quality questions efficiently.
 
 REQUIREMENTS:
 1. Conceptually accurate, test real understanding
 2. Match exam difficulty (JEE Main = moderate, Advanced = challenging)
 3. Use LaTeX for math ($ inline, $$ block)
 4. Original questions, not PYQ copies
 5. Brief but clear solutions
 
 OUTPUT FORMAT (JSON):
 {
   "questions": [
     {
       "question_text": "Question with $LaTeX$",
       "question_type": "single_correct|multi_correct|numerical|integer",
       "options": [
         {"label": "A", "text": "Option text"},
         {"label": "B", "text": "..."},
         {"label": "C", "text": "..."},
         {"label": "D", "text": "..."}
       ],
       "correct_answer": "A" or ["A", "C"] for multi or "42" for numerical,
       "solution": "Brief solution with $LaTeX$",
       "chapter": "Chapter name"
     }
   ]
 }
 
 For numerical: options = null, correct_answer = number.
 For multi-correct: correct_answer = array of labels.`;
 
 interface GenerationTask {
   subject: string;
   qType: string;
   count: number;
   chapters: string[];
 }
 
 async function generateQuestionsForTask(
   task: GenerationTask,
   examType: string,
   apiKey: string
 ): Promise<any[]> {
   const prompt = `Generate ${task.count} ${task.qType.replace("_", " ")} questions for JEE ${examType === "jee_main" ? "Main" : "Advanced"}.
 
 Subject: ${task.subject}
 Chapters: ${task.chapters.join(", ")}
 Type: ${task.qType}
 
 ${examType === "jee_advanced" ? "Make challenging, multi-concept." : "Keep moderate difficulty."}
 Return ONLY valid JSON.`;
 
   try {
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${apiKey}`,
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
 
     if (!response.ok) {
       console.error(`AI error ${task.subject} ${task.qType}:`, await response.text());
       return [];
     }
 
     const data = await response.json();
     const content = data.choices?.[0]?.message?.content;
     if (content) {
       const parsed = JSON.parse(content);
       return parsed.questions || [];
     }
   } catch (err) {
     console.error(`Error ${task.subject} ${task.qType}:`, err);
   }
   return [];
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { examType, syllabusType, chapters, userId, stream = false } = await req.json();
     console.log("Generating test:", { examType, chaptersCount: chapters?.length, stream });
 
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
     const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 
     if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
     if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");
 
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
     const config = examType === "jee_main" ? JEE_MAIN_CONFIG : JEE_ADVANCED_CONFIG;
 
     // Group chapters by subject
     const chaptersBySubject: Record<string, string[]> = { physics: [], chemistry: [], mathematics: [] };
     chapters.forEach((ch: any) => {
       const subject = typeof ch === "object" ? ch.subject : null;
       const name = typeof ch === "object" ? ch.name : ch;
       if (subject && chaptersBySubject[subject]) {
         chaptersBySubject[subject].push(name);
       }
     });
 
     // Build generation tasks
     const tasks: GenerationTask[] = [];
     for (const subject of ["physics", "chemistry", "mathematics"]) {
       const subjectChapters = chaptersBySubject[subject];
       if (subjectChapters.length === 0) continue;
 
       const questionsPerType = examType === "jee_main"
         ? { single_correct: 20, numerical: 10 }
         : { single_correct: 6, multi_correct: 6, numerical: 6 };
 
       for (const [qType, count] of Object.entries(questionsPerType)) {
         tasks.push({ subject, qType, count, chapters: subjectChapters });
       }
     }
 
     // Streaming mode with progress updates
     if (stream) {
       const encoder = new TextEncoder();
       const readable = new ReadableStream({
         async start(controller) {
           const send = (data: any) => {
             controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
           };
 
           send({ type: "start", total: tasks.length, message: "Starting generation..." });
 
           let completed = 0;
           let totalQuestionsGenerated = 0;
 
           // Run ALL tasks in parallel for speed
           const results = await Promise.all(
             tasks.map(async (task) => {
               const questions = await generateQuestionsForTask(task, examType, LOVABLE_API_KEY!);
               completed++;
               totalQuestionsGenerated += questions.length;
               send({
                 type: "progress",
                 completed,
                 total: tasks.length,
                 subject: task.subject,
                 qType: task.qType,
                 questionsGenerated: totalQuestionsGenerated,
                 message: `${task.subject} ${task.qType.replace("_", " ")} done (${completed}/${tasks.length})`,
               });
               return { task, questions };
             })
           );
 
           // Process results
           const allQuestions: any[] = [];
           let questionNumber = 1;
 
           for (const { task, questions } of results) {
             for (const q of questions) {
               const marks = examType === "jee_main"
                 ? { positive: 4, negative: 1, partial: false }
                 : task.qType === "multi_correct"
                   ? { positive: 4, negative: 2, partial: true }
                   : task.qType === "numerical"
                     ? { positive: 3, negative: 0, partial: false }
                     : { positive: 3, negative: 1, partial: false };
 
               allQuestions.push({
                 question_number: questionNumber++,
                 subject: task.subject,
                 chapter: q.chapter || task.chapters[0],
                 question_type: task.qType,
                 question_text: q.question_text,
                 options: q.options || null,
                 correct_answer: q.correct_answer,
                 marks_positive: marks.positive,
                 marks_negative: marks.negative,
                 partial_marking: marks.partial,
                 solution: q.solution,
                 diagram_url: null,
               });
             }
           }
 
           if (allQuestions.length === 0) {
             send({ type: "error", message: "Failed to generate questions. Please try again." });
             controller.close();
             return;
           }
 
           send({ type: "saving", message: "Saving test..." });
 
           const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks_positive, 0);
 
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
             message: `Generated ${savedQuestions.length} questions!`,
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
 
     // Non-streaming: parallel execution
     const results = await Promise.all(
       tasks.map((task) => generateQuestionsForTask(task, examType, LOVABLE_API_KEY!))
     );
 
     const allQuestions: any[] = [];
     let questionNumber = 1;
 
     tasks.forEach((task, idx) => {
       for (const q of results[idx]) {
         const marks = examType === "jee_main"
           ? { positive: 4, negative: 1, partial: false }
           : task.qType === "multi_correct"
             ? { positive: 4, negative: 2, partial: true }
             : task.qType === "numerical"
               ? { positive: 3, negative: 0, partial: false }
               : { positive: 3, negative: 1, partial: false };
 
         allQuestions.push({
           question_number: questionNumber++,
           subject: task.subject,
           chapter: q.chapter || task.chapters[0],
           question_type: task.qType,
           question_text: q.question_text,
           options: q.options || null,
           correct_answer: q.correct_answer,
           marks_positive: marks.positive,
           marks_negative: marks.negative,
           partial_marking: marks.partial,
           solution: q.solution,
           diagram_url: null,
         });
       }
     });
 
     if (allQuestions.length === 0) {
       throw new Error("Failed to generate questions. Please try again.");
     }
 
     const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks_positive, 0);
 
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