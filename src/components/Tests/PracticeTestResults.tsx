import {
  CheckCircle2, XCircle, MinusCircle, BarChart3, RotateCcw,
  ChevronDown, ChevronUp, Sparkles, Award, Target,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePracticeTest } from "@/hooks/usePracticeTest";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface PracticeTestResultsProps {
  testState: ReturnType<typeof usePracticeTest>;
  onNewTest: () => void;
}

export function PracticeTestResults({ testState, onNewTest }: PracticeTestResultsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const totalMarks = testState.questions.length * 4; // Fixed: +4 per question
  const percentage = totalMarks > 0 ? Math.round((Math.max(0, testState.score) / totalMarks) * 100) : 0;

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    if (percentage >= 40) return "text-orange-500";
    return "text-destructive";
  };

  const getQuestionResult = (question: typeof testState.questions[0]) => {
    const userAnswer = testState.userAnswers[question.id];
    if (userAnswer === undefined || userAnswer === null || 
        (Array.isArray(userAnswer) && userAnswer.length === 0) ||
        (typeof userAnswer === "string" && userAnswer.trim() === "")) {
      return "unattempted";
    }

    let isCorrect = false;
    if (question.question_type === "single_correct") {
      isCorrect = userAnswer === question.correct_answer;
    } else if (question.question_type === "multi_correct") {
      const correctArr = Array.isArray(question.correct_answer) ? question.correct_answer : [question.correct_answer];
      const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      isCorrect = correctArr.length === userArr.length && correctArr.every(a => userArr.includes(a));
    } else if (question.question_type === "numerical" || question.question_type === "integer") {
      const userNum = parseFloat(userAnswer);
      const correctNum = typeof question.correct_answer === "number" ? question.correct_answer : parseFloat(question.correct_answer as string);
      isCorrect = Math.abs(userNum - correctNum) < 0.01;
    }
    return isCorrect ? "correct" : "incorrect";
  };

  // Fixed marking: -1 per incorrect
  const negativeMarksLost = testState.incorrectCount * 1;

  return (
    <div className="relative min-h-screen bg-background py-12 overflow-hidden">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="container mx-auto px-4 max-w-5xl relative">
        {/* Editorial Hero Score Card */}
        <div className="relative mb-8 animate-fade-in">
          <div className="absolute -inset-1 bg-gradient-to-br from-primary/15 via-transparent to-accent/15 rounded-[2rem] blur-2xl opacity-70" aria-hidden />
          <div className="relative rounded-3xl border border-border/40 bg-card/50 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.3)]">
            {/* Top stripe */}
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="p-7 md:p-9">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2/60 backdrop-blur border border-border/40 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                      <Award className="h-3 w-3 text-primary" /> Result
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                      {testState.testType === "jee_main" ? "JEE Main Type" : "JEE Advanced Type"} · Practice
                    </span>
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[0.95]">
                    <span className="italic">Test </span>
                    <span className="text-muted-foreground/60">complete.</span>
                  </h1>
                  <p className="text-sm text-muted-foreground mt-2">Here's how you did, broken down question by question.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-1">Final Score</p>
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className={`font-display text-6xl md:text-7xl font-bold tabular-nums leading-none ${getScoreColor()}`}>
                      {testState.score}
                    </span>
                    <span className="text-2xl text-muted-foreground/60 font-mono">/{totalMarks}</span>
                  </div>
                  <p className={`text-sm font-mono mt-1 ${getScoreColor()}`}>{percentage}%</p>
                </div>
              </div>

              {/* Score progress */}
              <div className="mb-8">
                <Progress value={Math.max(0, percentage)} className="h-2 rounded-full" />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile icon={<CheckCircle2 className="h-4 w-4" />} label="Correct" value={testState.correctCount} tone="success" />
                <StatTile icon={<XCircle className="h-4 w-4" />} label="Incorrect" value={testState.incorrectCount} tone="danger" />
                <StatTile icon={<MinusCircle className="h-4 w-4" />} label="Unattempted" value={testState.unattemptedCount} tone="neutral" />
                <StatTile icon={<Target className="h-4 w-4" />} label="Negative" value={`−${negativeMarksLost}`} tone="danger" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  <Sparkles className="inline h-3 w-3 text-accent mr-1" />
                  Review each solution below to lock in the concepts.
                </p>
                <Button onClick={onNewTest} className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <RotateCcw className="h-4 w-4" /> Take Another Test
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-in rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/30 bg-surface-2/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold tracking-tight">Detailed Solutions</h2>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.18em]">{testState.questions.length} questions</span>
          </div>
          <div className="p-4 md:p-6">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {testState.questions.map((q, index) => {
                  const result = getQuestionResult(q);
                  const isExpanded = expandedQuestions.has(q.id);
                  const userAnswer = testState.userAnswers[q.id];

                  return (
                    <Collapsible key={q.id} open={isExpanded} onOpenChange={() => toggleQuestion(q.id)}>
                      <div className={`rounded-2xl border bg-surface-2/30 backdrop-blur transition-colors overflow-hidden ${
                        result === "correct" ? "border-emerald-500/30" :
                        result === "incorrect" ? "border-destructive/30" :
                        "border-border/40"
                      }`}>
                        <CollapsibleTrigger asChild>
                          <div className="p-4 cursor-pointer hover:bg-card/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-muted-foreground tracking-wider">Q{String(index + 1).padStart(2, "0")}</span>
                                <Badge variant="secondary" className="capitalize text-[10px] tracking-wider">{q.subject}</Badge>
                                {result === "correct" && <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Correct</Badge>}
                                {result === "incorrect" && <Badge className="bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/20"><XCircle className="h-3 w-3 mr-1" />Incorrect</Badge>}
                                {result === "unattempted" && <Badge variant="outline" className="border-border/40"><MinusCircle className="h-3 w-3 mr-1" />Skipped</Badge>}
                              </div>
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {q.question_text}
                              </ReactMarkdown>
                            </div>

                            {q.options && (
                              <div className="space-y-2">
                                {q.options.map(opt => {
                                  const isCorrectOption = Array.isArray(q.correct_answer) 
                                    ? q.correct_answer.includes(opt.label) : q.correct_answer === opt.label;
                                  const isUserAnswer = Array.isArray(userAnswer)
                                    ? userAnswer.includes(opt.label) : userAnswer === opt.label;
                                  return (
                                    <div key={opt.label} className={`p-3 rounded-xl border ${
                                      isCorrectOption ? "border-emerald-500/40 bg-emerald-500/10" :
                                      isUserAnswer ? "border-destructive/40 bg-destructive/10" : "border-border/40 bg-surface-2/30"
                                    }`}>
                                      <span className="font-medium mr-2">({opt.label})</span>
                                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}
                                        components={{ p: ({ children }) => <span>{children}</span> }}>
                                        {opt.text}
                                      </ReactMarkdown>
                                      {isCorrectOption && <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-sm">(Correct)</span>}
                                      {isUserAnswer && !isCorrectOption && <span className="ml-2 text-destructive text-sm">(Your Answer)</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {(q.question_type === "numerical" || q.question_type === "integer") && (
                              <div className="space-y-2">
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40">
                                  <span className="font-medium">Correct Answer: </span>
                                  <span className="font-mono">{String(q.correct_answer)}</span>
                                </div>
                                {userAnswer && (
                                  <div className={`p-3 rounded-xl border ${
                                    result === "correct" ? "bg-emerald-500/10 border-emerald-500/40" :
                                    "bg-destructive/10 border-destructive/40"
                                  }`}>
                                    <span className="font-medium">Your Answer: </span>
                                    <span className="font-mono">{String(userAnswer)}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="text-[11px] font-mono uppercase tracking-[0.15em]">
                              {result === "correct" && <span className="text-emerald-600 dark:text-emerald-400">+ {q.marks_positive} marks</span>}
                              {result === "incorrect" && <span className="text-destructive">− {q.marks_negative} mark · negative</span>}
                              {result === "unattempted" && <span className="text-muted-foreground">0 marks · skipped</span>}
                            </div>

                            <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur p-4">
                              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 font-semibold">Solution</p>
                              {q.solution ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {q.solution}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="text-muted-foreground italic">Solution not available for this question.</p>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number | string; tone: "success" | "danger" | "neutral" }) {
  const toneStyles =
    tone === "success" ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
    tone === "danger"  ? "text-destructive border-destructive/20 bg-destructive/5" :
                         "text-muted-foreground border-border/40 bg-surface-2/40";
  return (
    <div className={`rounded-2xl border backdrop-blur p-4 ${toneStyles}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold opacity-80">{label}</span>
      </div>
      <p className="text-3xl font-display font-bold tabular-nums">{value}</p>
    </div>
  );
}
