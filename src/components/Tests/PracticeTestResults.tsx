import { 
  CheckCircle2, XCircle, MinusCircle, Trophy, BarChart3, RotateCcw, ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const totalMarks = testState.questions.reduce((sum, q) => sum + q.marks_positive, 0);
  const percentage = totalMarks > 0 ? Math.round((testState.score / totalMarks) * 100) : 0;

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

  // Calculate negative marking impact
  const negativeMarksLost = testState.questions.reduce((total, q) => {
    const result = getQuestionResult(q);
    if (result === "incorrect") return total + q.marks_negative;
    return total;
  }, 0);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-8 overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-primary to-violet-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold mb-1">Test Completed!</h1>
                <p className="text-white/80">
                  {testState.testType === "jee_main" ? "JEE Main" : "JEE Advanced"} Type Practice
                </p>
              </div>
              <Trophy className="h-12 w-12 text-yellow-300" />
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor()}`}>{testState.score}</div>
                <div className="text-sm text-muted-foreground">out of {totalMarks}</div>
                <Progress value={Math.max(0, percentage)} className="mt-2 h-2" />
                <div className="text-xs text-muted-foreground mt-1">{percentage}%</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-500">{testState.correctCount}</span>
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-2xl font-bold text-destructive">{testState.incorrectCount}</span>
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MinusCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold text-muted-foreground">{testState.unattemptedCount}</span>
                </div>
                <div className="text-sm text-muted-foreground">Unattempted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">-{negativeMarksLost}</div>
                <div className="text-sm text-muted-foreground">Neg. Marks</div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button onClick={onNewTest} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Take Another Test
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Solutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {testState.questions.map((q, index) => {
                  const result = getQuestionResult(q);
                  const isExpanded = expandedQuestions.has(q.id);
                  const userAnswer = testState.userAnswers[q.id];

                  return (
                    <Collapsible key={q.id} open={isExpanded} onOpenChange={() => toggleQuestion(q.id)}>
                      <Card className={`border-l-4 ${
                        result === "correct" ? "border-l-green-500" :
                        result === "incorrect" ? "border-l-destructive" :
                        "border-l-muted-foreground"
                      }`}>
                        <CollapsibleTrigger asChild>
                          <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-lg">Q{index + 1}</span>
                                <Badge variant="secondary" className="capitalize">{q.subject}</Badge>
                                {result === "correct" && <Badge className="bg-green-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Correct</Badge>}
                                {result === "incorrect" && <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Incorrect</Badge>}
                                {result === "unattempted" && <Badge variant="outline"><MinusCircle className="h-3 w-3 mr-1" />Unattempted</Badge>}
                              </div>
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-4 border-t pt-4">
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
                                    <div key={opt.label} className={`p-3 rounded-lg border-2 ${
                                      isCorrectOption ? "border-green-500 bg-green-50 dark:bg-green-950/20" :
                                      isUserAnswer ? "border-destructive bg-destructive/10" : "border-border"
                                    }`}>
                                      <span className="font-medium mr-2">({opt.label})</span>
                                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}
                                        components={{ p: ({ children }) => <span>{children}</span> }}>
                                        {opt.text}
                                      </ReactMarkdown>
                                      {isCorrectOption && <span className="ml-2 text-green-600 text-sm">(Correct)</span>}
                                      {isUserAnswer && !isCorrectOption && <span className="ml-2 text-destructive text-sm">(Your Answer)</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {(q.question_type === "numerical" || q.question_type === "integer") && (
                              <div className="space-y-2">
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border-2 border-green-500">
                                  <span className="font-medium">Correct Answer: </span>
                                  <span className="font-mono">{String(q.correct_answer)}</span>
                                </div>
                                {userAnswer && (
                                  <div className={`p-3 rounded-lg ${
                                    result === "correct" ? "bg-green-50 dark:bg-green-950/20 border-2 border-green-500" :
                                    "bg-destructive/10 border-2 border-destructive"
                                  }`}>
                                    <span className="font-medium">Your Answer: </span>
                                    <span className="font-mono">{String(userAnswer)}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Marking impact */}
                            <div className="text-xs text-muted-foreground">
                              {result === "correct" && <span className="text-green-600">+{q.marks_positive} marks</span>}
                              {result === "incorrect" && <span className="text-destructive">-{q.marks_negative} marks (negative marking)</span>}
                              {result === "unattempted" && <span>0 marks (not attempted)</span>}
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4">
                              <h4 className="font-semibold mb-2">Solution</h4>
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
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
