 import { useState, useEffect, useCallback } from "react";
 import { 
   Clock, 
   ChevronLeft, 
   ChevronRight, 
   Flag, 
   RotateCcw, 
   AlertTriangle,
   CheckCircle,
   Circle,
   BookmarkCheck,
   Send
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader } from "@/components/ui/card";
 import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from "@/components/ui/alert-dialog";
 import { useTestBuilder } from "@/hooks/useTestBuilder";
 import ReactMarkdown from "react-markdown";
 import remarkMath from "remark-math";
 import rehypeKatex from "rehype-katex";
 import "katex/dist/katex.min.css";
 
 interface ExamSimulatorProps {
   testBuilder: ReturnType<typeof useTestBuilder>;
   onSubmit: () => void;
 }
 
 export function ExamSimulator({ testBuilder, onSubmit }: ExamSimulatorProps) {
   const [showSubmitDialog, setShowSubmitDialog] = useState(false);
   const [currentSubject, setCurrentSubject] = useState<string>("all");
 
   // Timer countdown
   useEffect(() => {
     if (testBuilder.timeRemaining <= 0) {
       handleSubmit();
       return;
     }
 
     const timer = setInterval(() => {
       testBuilder.setTimeRemaining(testBuilder.timeRemaining - 1);
     }, 1000);
 
     return () => clearInterval(timer);
   }, [testBuilder.timeRemaining]);
 
   const formatTime = (seconds: number) => {
     const hrs = Math.floor(seconds / 3600);
     const mins = Math.floor((seconds % 3600) / 60);
     const secs = seconds % 60;
     return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
   };
 
   const handleSubmit = async () => {
     setShowSubmitDialog(false);
     const success = await testBuilder.submitTest();
     if (success) {
       onSubmit();
     }
   };
 
   const currentQuestion = testBuilder.questions[testBuilder.currentQuestionIndex];
   const isLowTime = testBuilder.timeRemaining < 300; // Less than 5 minutes
 
   const getQuestionsBySubject = (subject: string) => {
     if (subject === "all") return testBuilder.questions;
     return testBuilder.questions.filter(q => q.subject === subject);
   };
 
   const getStatusColor = (question: typeof currentQuestion) => {
     if (question.is_marked_for_review && question.is_answered) return "bg-violet-500";
     if (question.is_marked_for_review) return "bg-violet-500/50";
     if (question.is_answered) return "bg-green-500";
     return "bg-muted";
   };
 
   const stats = {
     answered: testBuilder.questions.filter(q => q.is_answered).length,
     notAnswered: testBuilder.questions.filter(q => !q.is_answered && !q.is_marked_for_review).length,
     markedForReview: testBuilder.questions.filter(q => q.is_marked_for_review).length,
     answeredAndMarked: testBuilder.questions.filter(q => q.is_answered && q.is_marked_for_review).length,
   };
 
   if (!currentQuestion) {
     return <div className="p-8 text-center">Loading questions...</div>;
   }
 
   return (
     <div className="min-h-screen bg-background flex flex-col">
       {/* Top Bar */}
       <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
         <div className="container mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
             <h1 className="font-display font-bold text-lg">
               {testBuilder.currentTest?.exam_type === "jee_main" ? "JEE Main" : "JEE Advanced"}
             </h1>
             <Badge variant="outline">
               Question {testBuilder.currentQuestionIndex + 1} of {testBuilder.questions.length}
             </Badge>
           </div>
 
           <div className="flex items-center gap-4">
             <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
               isLowTime ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted"
             }`}>
               <Clock className="h-5 w-5" />
               {formatTime(testBuilder.timeRemaining)}
             </div>
             <Button
               onClick={() => setShowSubmitDialog(true)}
               className="gap-2 bg-gradient-to-r from-primary to-violet-500"
             >
               <Send className="h-4 w-4" />
               Submit Test
             </Button>
           </div>
         </div>
       </div>
 
       <div className="flex-1 flex">
         {/* Question Panel */}
         <div className="flex-1 p-6 overflow-auto">
           <Card className="max-w-4xl mx-auto">
             <CardHeader className="border-b">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Badge variant="secondary" className="capitalize">
                     {currentQuestion.subject}
                   </Badge>
                   {currentQuestion.chapter && (
                     <span className="text-sm text-muted-foreground">{currentQuestion.chapter}</span>
                   )}
                 </div>
                 <div className="flex items-center gap-2 text-sm">
                   <span className="text-green-600">+{currentQuestion.marks_positive}</span>
                   <span className="text-muted-foreground">/</span>
                   <span className="text-destructive">-{currentQuestion.marks_negative}</span>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
               {/* Question Text */}
               <div className="prose prose-sm dark:prose-invert max-w-none">
                 <ReactMarkdown
                   remarkPlugins={[remarkMath]}
                   rehypePlugins={[rehypeKatex]}
                 >
                   {currentQuestion.question_text}
                 </ReactMarkdown>
               </div>
 
               {/* Diagram if any */}
               {currentQuestion.diagram_url && (
                 <div className="flex justify-center">
                   <img 
                     src={currentQuestion.diagram_url} 
                     alt="Question diagram" 
                     className="max-w-md rounded-lg border"
                   />
                 </div>
               )}
 
               {/* Options */}
               {currentQuestion.question_type === "single_correct" && currentQuestion.options && (
                 <RadioGroup
                   value={currentQuestion.user_answer || ""}
                   onValueChange={(value) => testBuilder.answerQuestion(value)}
                   className="space-y-3"
                 >
                   {currentQuestion.options.map((option: { label: string; text: string }) => (
                     <Label
                       key={option.label}
                       className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                         currentQuestion.user_answer === option.label
                           ? "border-primary bg-primary/5"
                           : "border-border hover:border-primary/50"
                       }`}
                     >
                       <RadioGroupItem value={option.label} className="mt-0.5" />
                       <div className="flex-1">
                         <span className="font-medium mr-2">({option.label})</span>
                         <ReactMarkdown
                           remarkPlugins={[remarkMath]}
                           rehypePlugins={[rehypeKatex]}
                           components={{
                             p: ({ children }) => <span>{children}</span>
                           }}
                         >
                           {option.text}
                         </ReactMarkdown>
                       </div>
                     </Label>
                   ))}
                 </RadioGroup>
               )}
 
               {currentQuestion.question_type === "multi_correct" && currentQuestion.options && (
                 <div className="space-y-3">
                   {currentQuestion.options.map((option: { label: string; text: string }) => {
                     const selectedOptions = (currentQuestion.user_answer as string[]) || [];
                     const isSelected = selectedOptions.includes(option.label);
                     
                     return (
                       <Label
                         key={option.label}
                         className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                           isSelected
                             ? "border-primary bg-primary/5"
                             : "border-border hover:border-primary/50"
                         }`}
                       >
                         <Checkbox
                           checked={isSelected}
                           onCheckedChange={(checked) => {
                             const newAnswer = checked
                               ? [...selectedOptions, option.label]
                               : selectedOptions.filter(l => l !== option.label);
                             testBuilder.answerQuestion(newAnswer);
                           }}
                           className="mt-0.5"
                         />
                         <div className="flex-1">
                           <span className="font-medium mr-2">({option.label})</span>
                           <ReactMarkdown
                             remarkPlugins={[remarkMath]}
                             rehypePlugins={[rehypeKatex]}
                           components={{
                             p: ({ children }) => <span>{children}</span>
                           }}
                           >
                             {option.text}
                           </ReactMarkdown>
                         </div>
                       </Label>
                     );
                   })}
                 </div>
               )}
 
               {(currentQuestion.question_type === "numerical" || currentQuestion.question_type === "integer") && (
                 <div className="max-w-xs">
                   <Label className="text-sm text-muted-foreground mb-2 block">
                     Enter your answer {currentQuestion.question_type === "integer" ? "(Integer only)" : "(Decimal allowed)"}
                   </Label>
                   <Input
                     type="number"
                     step={currentQuestion.question_type === "integer" ? "1" : "any"}
                     placeholder="Enter answer"
                     value={currentQuestion.user_answer || ""}
                     onChange={(e) => testBuilder.answerQuestion(e.target.value)}
                     className="text-lg font-mono"
                   />
                 </div>
               )}
 
               {/* Action Buttons */}
               <div className="flex items-center justify-between pt-6 border-t">
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     onClick={testBuilder.toggleMarkForReview}
                     className={currentQuestion.is_marked_for_review ? "border-violet-500 text-violet-600" : ""}
                   >
                     <Flag className={`h-4 w-4 mr-2 ${currentQuestion.is_marked_for_review ? "fill-current" : ""}`} />
                     {currentQuestion.is_marked_for_review ? "Marked" : "Mark for Review"}
                   </Button>
                   <Button
                     variant="ghost"
                     onClick={testBuilder.clearResponse}
                     disabled={!currentQuestion.is_answered}
                   >
                     <RotateCcw className="h-4 w-4 mr-2" />
                     Clear Response
                   </Button>
                 </div>
 
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     onClick={() => testBuilder.setCurrentQuestion(testBuilder.currentQuestionIndex - 1)}
                     disabled={testBuilder.currentQuestionIndex === 0}
                   >
                     <ChevronLeft className="h-4 w-4 mr-1" />
                     Previous
                   </Button>
                   <Button
                     onClick={() => testBuilder.setCurrentQuestion(testBuilder.currentQuestionIndex + 1)}
                     disabled={testBuilder.currentQuestionIndex === testBuilder.questions.length - 1}
                   >
                     Next
                     <ChevronRight className="h-4 w-4 ml-1" />
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Navigation Panel */}
         <div className="w-80 border-l border-border bg-surface-1 p-4 hidden lg:block">
           <div className="space-y-4">
             {/* Stats */}
             <div className="grid grid-cols-2 gap-2 text-xs">
               <div className="flex items-center gap-2 p-2 rounded bg-green-500/10">
                 <div className="w-3 h-3 rounded-full bg-green-500" />
                 <span>Answered: {stats.answered}</span>
               </div>
               <div className="flex items-center gap-2 p-2 rounded bg-muted">
                 <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
                 <span>Not Answered: {stats.notAnswered}</span>
               </div>
               <div className="flex items-center gap-2 p-2 rounded bg-violet-500/10">
                 <div className="w-3 h-3 rounded-full bg-violet-500" />
                 <span>Marked: {stats.markedForReview}</span>
               </div>
               <div className="flex items-center gap-2 p-2 rounded bg-violet-500/10">
                 <div className="w-3 h-3 rounded-full bg-violet-500" />
                 <span>Answered + Marked: {stats.answeredAndMarked}</span>
               </div>
             </div>
 
             {/* Subject Filter */}
             <div className="flex gap-1 flex-wrap">
               <Button
                 variant={currentSubject === "all" ? "default" : "outline"}
                 size="sm"
                 onClick={() => setCurrentSubject("all")}
                 className="text-xs h-7"
               >
                 All
               </Button>
               {["physics", "chemistry", "mathematics"].map(subject => (
                 <Button
                   key={subject}
                   variant={currentSubject === subject ? "default" : "outline"}
                   size="sm"
                   onClick={() => setCurrentSubject(subject)}
                   className="text-xs h-7 capitalize"
                 >
                   {subject.slice(0, 3)}
                 </Button>
               ))}
             </div>
 
             {/* Question Grid */}
             <ScrollArea className="h-[calc(100vh-350px)]">
               <div className="grid grid-cols-5 gap-2">
                 {testBuilder.questions.map((q, index) => {
                   if (currentSubject !== "all" && q.subject !== currentSubject) return null;
                   return (
                     <button
                       key={q.id}
                       onClick={() => testBuilder.setCurrentQuestion(index)}
                       className={`w-10 h-10 rounded-lg text-sm font-medium transition-all relative ${
                         index === testBuilder.currentQuestionIndex
                           ? "ring-2 ring-primary ring-offset-2"
                           : ""
                       } ${getStatusColor(q)} ${
                         q.is_answered || q.is_marked_for_review ? "text-white" : ""
                       }`}
                     >
                       {q.question_number}
                       {q.is_marked_for_review && (
                         <Flag className="absolute -top-1 -right-1 h-3 w-3 text-white fill-current" />
                       )}
                     </button>
                   );
                 })}
               </div>
             </ScrollArea>
           </div>
         </div>
       </div>
 
       {/* Submit Confirmation Dialog */}
       <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle className="flex items-center gap-2">
               <AlertTriangle className="h-5 w-5 text-amber-500" />
               Submit Test?
             </AlertDialogTitle>
             <AlertDialogDescription className="space-y-3">
               <p>Are you sure you want to submit the test?</p>
               <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span>Answered:</span>
                   <span className="font-medium text-green-600">{stats.answered}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Not Answered:</span>
                   <span className="font-medium">{stats.notAnswered}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Marked for Review:</span>
                   <span className="font-medium text-violet-600">{stats.markedForReview}</span>
                 </div>
               </div>
               {stats.notAnswered > 0 && (
                 <p className="text-amber-600 text-sm">
                   ⚠️ You have {stats.notAnswered} unanswered questions
                 </p>
               )}
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction onClick={handleSubmit} className="bg-primary">
               {testBuilder.isSubmitting ? "Submitting..." : "Submit Test"}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </div>
   );
 }