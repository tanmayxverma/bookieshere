import { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  RotateCcw, 
  Send,
  Loader2
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
import { usePYQTest } from "@/hooks/usePYQTest";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface PYQCBTSimulatorProps {
  testState: ReturnType<typeof usePYQTest>;
  onSubmit: () => void;
}

export function PYQCBTSimulator({ testState, onSubmit }: PYQCBTSimulatorProps) {
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const questionPanelRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (questionPanelRef.current) {
      questionPanelRef.current.scrollTop = 0;
    }
  }, []);

  // Scroll to top when question changes
  useEffect(() => {
    if (questionPanelRef.current) {
      questionPanelRef.current.scrollTop = 0;
    }
  }, [testState.currentQuestionIndex]);

  // Timer countdown
  useEffect(() => {
    if (testState.timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      testState.setTimeRemaining(testState.timeRemaining - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [testState.timeRemaining]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    setIsSubmitting(true);
    
    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    testState.submitTest();
    setIsSubmitting(false);
    onSubmit();
  };

  const currentQuestion = testState.questions[testState.currentQuestionIndex];
  const isLowTime = testState.timeRemaining < 300;
  const stats = testState.getStats();

  const getStatusColor = (questionId: string) => {
    const status = testState.getQuestionStatus(questionId);
    if (status.isMarked && status.isAnswered) return "bg-violet-500";
    if (status.isMarked) return "bg-violet-500/50";
    if (status.isAnswered) return "bg-green-500";
    return "bg-muted";
  };

  // Show submitting overlay
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 p-8 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20 animate-ping mx-auto" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold mb-2">Submitting Test...</h2>
            <p className="text-muted-foreground">Please wait while we calculate your score</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentAnswer = testState.userAnswers[currentQuestion.id];
  const isMarked = testState.markedForReview.has(currentQuestion.id);
  const isAnswered = currentAnswer !== undefined && currentAnswer !== null && 
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : String(currentAnswer).length > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display font-bold text-lg">
              {testState.examType === "jee_main" ? "JEE Main" : "JEE Advanced"} - Official PYQ
            </h1>
            <Badge variant="outline">
              Question {testState.currentQuestionIndex + 1} of {testState.questions.length}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-all ${
              isLowTime ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted"
            }`}>
              <Clock className="h-5 w-5" />
              {formatTime(testState.timeRemaining)}
            </div>
            <Button
              onClick={() => setShowSubmitDialog(true)}
              className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:shadow-lg transition-all"
            >
              <Send className="h-4 w-4" />
              Submit Test
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Question Panel */}
        <div ref={questionPanelRef} className="flex-1 p-6 overflow-auto">
          <Card className="max-w-4xl mx-auto animate-fade-in">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">
                    {currentQuestion.subject}
                  </Badge>
                  {currentQuestion.chapter && (
                    <span className="text-sm text-muted-foreground">{currentQuestion.chapter}</span>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {currentQuestion.year} {currentQuestion.shift || (currentQuestion.paper ? `Paper ${currentQuestion.paper}` : "")}
                  </Badge>
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
                  value={currentAnswer || ""}
                  onValueChange={(value) => testState.answerQuestion(value)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <Label
                      key={option.label}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                        currentAnswer === option.label
                          ? "border-primary bg-primary/5 shadow-sm"
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
                  {currentQuestion.options.map((option) => {
                    const selectedOptions = (currentAnswer as string[]) || [];
                    const isSelected = selectedOptions.includes(option.label);
                    
                    return (
                      <Label
                        key={option.label}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const newAnswer = checked
                              ? [...selectedOptions, option.label]
                              : selectedOptions.filter(l => l !== option.label);
                            testState.answerQuestion(newAnswer);
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
                    value={currentAnswer || ""}
                    onChange={(e) => testState.answerQuestion(e.target.value)}
                    className="text-lg font-mono"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={testState.toggleMarkForReview}
                    className={`transition-all ${isMarked ? "border-violet-500 text-violet-600 bg-violet-50 dark:bg-violet-950/20" : ""}`}
                  >
                    <Flag className={`h-4 w-4 mr-2 ${isMarked ? "fill-current" : ""}`} />
                    {isMarked ? "Marked" : "Mark for Review"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={testState.clearResponse}
                    disabled={!isAnswered}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear Response
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => testState.setCurrentQuestion(testState.currentQuestionIndex - 1)}
                    disabled={testState.currentQuestionIndex === 0}
                    className="transition-all hover:scale-105"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => testState.setCurrentQuestion(testState.currentQuestionIndex + 1)}
                    disabled={testState.currentQuestionIndex === testState.questions.length - 1}
                    className="transition-all hover:scale-105"
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
        <div className="w-80 border-l border-border bg-muted/30 p-4 hidden lg:block">
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
                <span>Marked: {stats.marked}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted">
                <div className="w-3 h-3 rounded-full border-2 border-primary" />
                <span>Total: {stats.total}</span>
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
                {testState.questions.map((q, index) => {
                  if (currentSubject !== "all" && q.subject !== currentSubject) return null;
                  return (
                    <button
                      key={q.id}
                      onClick={() => testState.setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all relative hover:scale-110 ${
                        index === testState.currentQuestionIndex
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      } ${getStatusColor(q.id)} ${
                        testState.getQuestionStatus(q.id).isAnswered ? "text-white" : ""
                      }`}
                    >
                      {index + 1}
                      {testState.markedForReview.has(q.id) && (
                        <Flag className="h-2 w-2 absolute top-0.5 right-0.5 fill-current" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to submit your test?</p>
              <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Answered:</span>
                  <span className="font-medium text-green-600">{stats.answered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Not Answered:</span>
                  <span className="font-medium text-muted-foreground">{stats.notAnswered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marked for Review:</span>
                  <span className="font-medium text-violet-600">{stats.marked}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-primary">
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
