 import { useMemo } from "react";
 import { 
   Trophy, 
   Target, 
   CheckCircle, 
   XCircle, 
   MinusCircle,
   ArrowRight,
   RotateCcw,
   Download,
   TrendingUp,
   TrendingDown,
   BookOpen,
   ChevronDown
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from "@/components/ui/accordion";
 import { useTestBuilder, QuestionData } from "@/hooks/useTestBuilder";
 import ReactMarkdown from "react-markdown";
 import remarkMath from "remark-math";
 import rehypeKatex from "rehype-katex";
 import "katex/dist/katex.min.css";
 
 interface TestResultsProps {
   testBuilder: ReturnType<typeof useTestBuilder>;
   onNewTest: () => void;
 }
 
 export function TestResults({ testBuilder, onNewTest }: TestResultsProps) {
   const { currentTest, questions } = testBuilder;
 
   const stats = useMemo(() => {
     if (!currentTest) return null;
 
     const subjectStats: Record<string, { correct: number; incorrect: number; unattempted: number; marks: number; total: number }> = {};
     
     questions.forEach(q => {
       if (!subjectStats[q.subject]) {
         subjectStats[q.subject] = { correct: 0, incorrect: 0, unattempted: 0, marks: 0, total: 0 };
       }
       
       const isCorrect = JSON.stringify(q.user_answer) === JSON.stringify(q.correct_answer);
       const isAttempted = q.is_answered;
       
       if (!isAttempted) {
         subjectStats[q.subject].unattempted++;
       } else if (isCorrect) {
         subjectStats[q.subject].correct++;
         subjectStats[q.subject].marks += q.marks_positive;
       } else {
         subjectStats[q.subject].incorrect++;
         subjectStats[q.subject].marks -= q.marks_negative;
       }
       subjectStats[q.subject].total += q.marks_positive;
     });
 
     return {
       overall: {
         score: currentTest.score || 0,
         total: currentTest.total_marks,
         percentage: Math.round(((currentTest.score || 0) / currentTest.total_marks) * 100),
         correct: currentTest.correct_count || 0,
         incorrect: currentTest.incorrect_count || 0,
         unattempted: currentTest.unattempted_count || 0,
       },
       subjects: subjectStats,
     };
   }, [currentTest, questions]);
 
   if (!currentTest || !stats) {
     return <div className="p-8 text-center">Loading results...</div>;
   }
 
   const getPerformanceLevel = (percentage: number) => {
     if (percentage >= 80) return { label: "Excellent", color: "text-green-600", bg: "bg-green-500" };
     if (percentage >= 60) return { label: "Good", color: "text-blue-600", bg: "bg-blue-500" };
     if (percentage >= 40) return { label: "Average", color: "text-amber-600", bg: "bg-amber-500" };
     return { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-500" };
   };
 
   const performance = getPerformanceLevel(stats.overall.percentage);
 
   const isQuestionCorrect = (q: QuestionData) => {
     return JSON.stringify(q.user_answer) === JSON.stringify(q.correct_answer);
   };
 
   return (
     <section className="py-8 min-h-screen">
       <div className="container mx-auto px-4">
         {/* Header */}
         <div className="text-center mb-8">
           <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${performance.bg}/10 ${performance.color} mb-4`}>
             <Trophy className="h-5 w-5" />
             <span className="font-semibold">{performance.label}</span>
           </div>
           <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
             Test <span className="text-gradient-glow">Complete!</span>
           </h1>
           <p className="text-muted-foreground">
             {currentTest.exam_type === "jee_main" ? "JEE Main" : "JEE Advanced"} • {questions.length} Questions
           </p>
         </div>
 
         {/* Score Card */}
         <Card className="max-w-2xl mx-auto mb-8 overflow-hidden">
           <div className={`h-2 ${performance.bg}`} />
           <CardContent className="p-8">
             <div className="text-center mb-8">
               <div className="text-6xl font-display font-bold mb-2">
                 {stats.overall.score}
                 <span className="text-2xl text-muted-foreground">/{stats.overall.total}</span>
               </div>
               <p className="text-xl text-muted-foreground">
                 {stats.overall.percentage}% Score
               </p>
             </div>
 
             <div className="grid grid-cols-3 gap-4">
               <div className="text-center p-4 bg-green-500/10 rounded-xl">
                 <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                 <div className="text-2xl font-bold text-green-600">{stats.overall.correct}</div>
                 <div className="text-sm text-muted-foreground">Correct</div>
               </div>
               <div className="text-center p-4 bg-red-500/10 rounded-xl">
                 <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                 <div className="text-2xl font-bold text-red-600">{stats.overall.incorrect}</div>
                 <div className="text-sm text-muted-foreground">Incorrect</div>
               </div>
               <div className="text-center p-4 bg-muted rounded-xl">
                 <MinusCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                 <div className="text-2xl font-bold">{stats.overall.unattempted}</div>
                 <div className="text-sm text-muted-foreground">Unattempted</div>
               </div>
             </div>
           </CardContent>
         </Card>
 
         {/* Subject-wise Analysis */}
         <div className="max-w-4xl mx-auto mb-8">
           <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
             <Target className="h-5 w-5 text-primary" />
             Subject-wise Performance
           </h2>
           
           <div className="grid md:grid-cols-3 gap-4">
             {Object.entries(stats.subjects).map(([subject, data]) => {
               const total = data.correct + data.incorrect + data.unattempted;
               const accuracy = total > 0 ? Math.round((data.correct / total) * 100) : 0;
               
               return (
                 <Card key={subject}>
                   <CardHeader className="pb-2">
                     <CardTitle className="text-lg capitalize flex items-center justify-between">
                       {subject}
                       <Badge variant={accuracy >= 60 ? "default" : "secondary"}>
                         {accuracy}%
                       </Badge>
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-muted-foreground">Score</span>
                         <span className="font-medium">{Math.max(0, data.marks)}/{data.total}</span>
                       </div>
                       <Progress value={(data.correct / total) * 100} className="h-2" />
                       <div className="grid grid-cols-3 gap-2 text-xs text-center">
                         <div className="text-green-600">
                           <div className="font-medium">{data.correct}</div>
                           <div>Correct</div>
                         </div>
                         <div className="text-red-600">
                           <div className="font-medium">{data.incorrect}</div>
                           <div>Wrong</div>
                         </div>
                         <div className="text-muted-foreground">
                           <div className="font-medium">{data.unattempted}</div>
                           <div>Skipped</div>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               );
             })}
           </div>
         </div>
 
         {/* Detailed Solutions */}
         <div className="max-w-4xl mx-auto mb-8">
           <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
             <BookOpen className="h-5 w-5 text-primary" />
             Detailed Solutions
           </h2>
 
           <Accordion type="single" collapsible className="space-y-3">
             {questions.map((q, index) => {
               const correct = isQuestionCorrect(q);
               const attempted = q.is_answered;
               
               return (
                 <AccordionItem 
                   key={q.id} 
                   value={q.id}
                   className={`border rounded-xl px-4 ${
                     !attempted ? "bg-muted/30" : correct ? "bg-green-500/5 border-green-500/30" : "bg-red-500/5 border-red-500/30"
                   }`}
                 >
                   <AccordionTrigger className="hover:no-underline py-4">
                     <div className="flex items-center gap-3 text-left">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                         !attempted ? "bg-muted text-muted-foreground" : correct ? "bg-green-500 text-white" : "bg-red-500 text-white"
                       }`}>
                         {q.question_number}
                       </div>
                       <div>
                         <div className="flex items-center gap-2">
                           <Badge variant="outline" className="capitalize text-xs">
                             {q.subject}
                           </Badge>
                           {!attempted ? (
                             <Badge variant="secondary" className="text-xs">Unattempted</Badge>
                           ) : correct ? (
                             <Badge className="bg-green-500 text-xs">Correct (+{q.marks_positive})</Badge>
                           ) : (
                             <Badge variant="destructive" className="text-xs">Incorrect (-{q.marks_negative})</Badge>
                           )}
                         </div>
                         {q.chapter && (
                           <span className="text-xs text-muted-foreground">{q.chapter}</span>
                         )}
                       </div>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="pb-4">
                     <div className="space-y-4 pt-2">
                       {/* Question */}
                       <div className="prose prose-sm dark:prose-invert max-w-none">
                         <ReactMarkdown
                           remarkPlugins={[remarkMath]}
                           rehypePlugins={[rehypeKatex]}
                         >
                           {q.question_text}
                         </ReactMarkdown>
                       </div>
 
                       {/* Options */}
                       {q.options && (
                         <div className="space-y-2">
                           {q.options.map((opt: { label: string; text: string }) => {
                             const isUserAnswer = q.question_type === "multi_correct"
                               ? (q.user_answer as string[] || []).includes(opt.label)
                               : q.user_answer === opt.label;
                             const isCorrectAnswer = q.question_type === "multi_correct"
                               ? (q.correct_answer as string[]).includes(opt.label)
                               : q.correct_answer === opt.label;
 
                             return (
                               <div
                                 key={opt.label}
                                 className={`flex items-start gap-2 p-3 rounded-lg border ${
                                   isCorrectAnswer
                                     ? "bg-green-500/10 border-green-500/50"
                                     : isUserAnswer
                                       ? "bg-red-500/10 border-red-500/50"
                                       : "border-border"
                                 }`}
                               >
                                 <span className="font-medium w-8">({opt.label})</span>
                                 <div className="flex-1 text-sm">
                                   <ReactMarkdown
                                     remarkPlugins={[remarkMath]}
                                     rehypePlugins={[rehypeKatex]}
                                     components={{
                                       p: ({ children }) => <span>{children}</span>
                                     }}
                                   >
                                     {opt.text}
                                   </ReactMarkdown>
                                 </div>
                                 {isCorrectAnswer && (
                                   <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                 )}
                                 {isUserAnswer && !isCorrectAnswer && (
                                   <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       )}
 
                       {/* Numerical Answer Display */}
                       {(q.question_type === "numerical" || q.question_type === "integer") && (
                         <div className="space-y-2">
                           <div className="flex gap-4">
                             <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50">
                               <span className="text-xs text-muted-foreground block">Correct Answer</span>
                               <span className="font-mono font-bold text-green-600">{String(q.correct_answer)}</span>
                             </div>
                             {attempted && (
                               <div className={`p-3 rounded-lg ${correct ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50"}`}>
                                 <span className="text-xs text-muted-foreground block">Your Answer</span>
                                 <span className={`font-mono font-bold ${correct ? "text-green-600" : "text-red-600"}`}>
                                   {String(q.user_answer)}
                                 </span>
                               </div>
                             )}
                           </div>
                         </div>
                       )}
 
                       {/* Solution */}
                       {q.solution && (
                         <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                           <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                             <BookOpen className="h-4 w-4" />
                             Solution
                           </h4>
                           <div className="prose prose-sm dark:prose-invert max-w-none">
                             <ReactMarkdown
                               remarkPlugins={[remarkMath]}
                               rehypePlugins={[rehypeKatex]}
                             >
                               {q.solution}
                             </ReactMarkdown>
                           </div>
                         </div>
                       )}
                     </div>
                   </AccordionContent>
                 </AccordionItem>
               );
             })}
           </Accordion>
         </div>
 
         {/* Actions */}
         <div className="flex justify-center gap-4 pt-8">
           <Button variant="outline" size="lg" onClick={onNewTest} className="gap-2">
             <RotateCcw className="h-4 w-4" />
             Create New Test
           </Button>
           <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-violet-500">
             <Download className="h-4 w-4" />
             Download Solutions PDF
           </Button>
         </div>
       </div>
     </section>
   );
 }