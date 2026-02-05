 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { testId, answers } = await req.json();
     
     console.log("Submitting test:", { testId, answersCount: answers?.length });
 
     const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
     const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 
     if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
       throw new Error("Supabase not configured");
     }
 
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
     // Get all questions for this test
     const { data: questions, error: questionsError } = await supabase
       .from("test_questions")
       .select("*")
       .eq("test_id", testId)
       .order("question_number");
 
     if (questionsError) throw questionsError;
 
     // Process answers and calculate score
     let score = 0;
     let correctCount = 0;
     let incorrectCount = 0;
     let unattemptedCount = 0;
 
     const updatedQuestions = questions.map(q => {
       const answer = answers.find((a: any) => a.questionId === q.id);
       const userAnswer = answer?.userAnswer;
       
       // Check if answered
       const isAnswered = userAnswer !== null && userAnswer !== undefined && 
         (Array.isArray(userAnswer) ? userAnswer.length > 0 : String(userAnswer).length > 0);
       
       if (!isAnswered) {
         unattemptedCount++;
         return { ...q, user_answer: null, is_answered: false };
       }
 
       // Check correctness based on question type
       let isCorrect = false;
       let partialScore = 0;
 
       if (q.question_type === "single_correct") {
         isCorrect = userAnswer === q.correct_answer;
       } else if (q.question_type === "multi_correct") {
         const correctAnswers = q.correct_answer as string[];
         const userAnswers = (userAnswer as string[]) || [];
         
         if (q.partial_marking) {
           // Partial marking for multi-correct
           const correctSelected = userAnswers.filter(a => correctAnswers.includes(a)).length;
           const incorrectSelected = userAnswers.filter(a => !correctAnswers.includes(a)).length;
           
           if (incorrectSelected === 0) {
             if (correctSelected === correctAnswers.length) {
               isCorrect = true;
             } else if (correctSelected > 0) {
               // Partial credit
               partialScore = (correctSelected / correctAnswers.length) * q.marks_positive;
             }
           }
         } else {
           isCorrect = JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort());
         }
       } else if (q.question_type === "numerical" || q.question_type === "integer") {
         const correctValue = parseFloat(String(q.correct_answer));
         const userValue = parseFloat(String(userAnswer));
         
         // Allow small tolerance for numerical answers
         if (q.question_type === "integer") {
           isCorrect = Math.round(userValue) === Math.round(correctValue);
         } else {
           isCorrect = Math.abs(userValue - correctValue) < 0.01;
         }
       }
 
       if (isCorrect) {
         score += q.marks_positive;
         correctCount++;
       } else if (partialScore > 0) {
         score += partialScore;
         // Count as partially correct (still incorrect for stats)
         incorrectCount++;
       } else {
         score -= q.marks_negative;
         incorrectCount++;
       }
 
       return { ...q, user_answer: userAnswer, is_answered: true };
     });
 
     // Update questions with user answers
     for (const q of updatedQuestions) {
       await supabase
         .from("test_questions")
         .update({ user_answer: q.user_answer, is_answered: q.is_answered })
         .eq("id", q.id);
     }
 
     // Get test details
     const { data: test, error: testError } = await supabase
       .from("tests")
       .select("*")
       .eq("id", testId)
       .single();
 
     if (testError) throw testError;
 
     // Update test with results
     const { data: updatedTest, error: updateError } = await supabase
       .from("tests")
       .update({
         status: "completed",
         completed_at: new Date().toISOString(),
         score: Math.max(0, Math.round(score)),
         correct_count: correctCount,
         incorrect_count: incorrectCount,
         unattempted_count: unattemptedCount,
       })
       .eq("id", testId)
       .select()
       .single();
 
     if (updateError) throw updateError;
 
     console.log(`Test ${testId} submitted. Score: ${score}/${test.total_marks}`);
 
     return new Response(
       JSON.stringify({ test: updatedTest, questions: updatedQuestions }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error) {
     console.error("Submit test error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });