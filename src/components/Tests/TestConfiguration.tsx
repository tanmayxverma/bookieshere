import { useState } from "react";
import { 
  FileText, 
  Target, 
  Clock, 
  BookOpen, 
  Zap, 
  GraduationCap,
  Loader2,
  Download,
  Play,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  useTestBuilder, 
  ExamType, 
  SyllabusType, 
  JEE_CHAPTERS,
  Chapter 
} from "@/hooks/useTestBuilder";

interface TestConfigurationProps {
  testBuilder: ReturnType<typeof useTestBuilder>;
  onStartTest: () => void;
}

export function TestConfiguration({ testBuilder, onStartTest }: TestConfigurationProps) {
  const [mode, setMode] = useState<"online" | "pdf">("online");

  const examDetails = {
    jee_main: {
      title: "JEE Main",
      description: "90 questions • 3 hours • 300 marks",
      pattern: "Single correct MCQs + Numerical",
      difficulty: "Moderate",
      sections: "Physics (30) • Chemistry (30) • Mathematics (30)",
    },
    jee_advanced: {
      title: "JEE Advanced",
      description: "Full paper pattern • 3 hours per paper",
      pattern: "MCQ, Multi-correct, Numerical, Matrix",
      difficulty: "High",
      sections: "Multi-section format with varying marks",
    },
  };

  const handleGenerate = async () => {
    if (mode === "pdf") {
      // Generate PDF directly without going to exam mode
      const success = await testBuilder.generateTest();
      if (success) {
        // Stay on config page but show PDF download options
        handleDownloadPDF();
      }
    } else {
      const success = await testBuilder.generateTest();
      if (success) {
        onStartTest();
      }
    }
  };

  const handleDownloadPDF = () => {
    // Generate and download PDF
    const questions = testBuilder.questions;
    if (questions.length === 0) return;

    // Generate Question Paper PDF
    const questionContent = generateQuestionPaperContent(questions, testBuilder.examType);
    downloadPDF(questionContent, `JEE_${testBuilder.examType === "jee_main" ? "Main" : "Advanced"}_Question_Paper.html`);

    // Generate Solution PDF
    const solutionContent = generateSolutionContent(questions, testBuilder.examType);
    downloadPDF(solutionContent, `JEE_${testBuilder.examType === "jee_main" ? "Main" : "Advanced"}_Solutions.html`);
  };

  const generateQuestionPaperContent = (questions: any[], examType: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>JEE ${examType === "jee_main" ? "Main" : "Advanced"} Question Paper</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <style>
    body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .question { margin: 20px 0; padding: 15px; border: 1px solid #ddd; page-break-inside: avoid; }
    .question-num { font-weight: bold; color: #333; }
    .options { margin-left: 20px; margin-top: 10px; }
    .option { margin: 8px 0; }
    .subject-header { background: #f0f0f0; padding: 10px; margin: 20px 0; font-weight: bold; }
    .marks { float: right; color: #666; font-size: 12px; }
    @media print { .question { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>JEE ${examType === "jee_main" ? "Main" : "Advanced"} - Question Paper</h1>
  <p style="text-align: center;">Total Questions: ${questions.length} | Time: 3 Hours</p>
  
  ${["physics", "chemistry", "mathematics"].map(subject => {
    const subjectQs = questions.filter(q => q.subject === subject);
    if (subjectQs.length === 0) return "";
    return `
      <div class="subject-header">${subject.toUpperCase()} (${subjectQs.length} Questions)</div>
      ${subjectQs.map(q => `
        <div class="question">
          <span class="question-num">Q${q.question_number}.</span>
          <span class="marks">[+${q.marks_positive}/-${q.marks_negative}]</span>
          <div style="margin-top: 10px;">${q.question_text}</div>
          ${q.options ? `
            <div class="options">
              ${q.options.map((opt: any) => `
                <div class="option">(${opt.label}) ${opt.text}</div>
              `).join("")}
            </div>
          ` : '<div style="margin-top: 10px; font-style: italic;">Answer: _____________</div>'}
        </div>
      `).join("")}
    `;
  }).join("")}
  
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      renderMathInElement(document.body, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ]
      });
    });
  </script>
</body>
</html>`;
  };

  const generateSolutionContent = (questions: any[], examType: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>JEE ${examType === "jee_main" ? "Main" : "Advanced"} Solutions</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <style>
    body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .solution { margin: 20px 0; padding: 15px; border: 1px solid #ddd; page-break-inside: avoid; }
    .question-num { font-weight: bold; color: #333; }
    .answer { background: #e8f5e9; padding: 10px; margin: 10px 0; border-radius: 4px; }
    .explanation { margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    .subject-header { background: #f0f0f0; padding: 10px; margin: 20px 0; font-weight: bold; }
    @media print { .solution { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>JEE ${examType === "jee_main" ? "Main" : "Advanced"} - Solutions</h1>
  
  ${["physics", "chemistry", "mathematics"].map(subject => {
    const subjectQs = questions.filter(q => q.subject === subject);
    if (subjectQs.length === 0) return "";
    return `
      <div class="subject-header">${subject.toUpperCase()}</div>
      ${subjectQs.map(q => `
        <div class="solution">
          <span class="question-num">Q${q.question_number}.</span>
          <div style="margin-top: 10px;">${q.question_text}</div>
          <div class="answer">
            <strong>Answer:</strong> ${Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : q.correct_answer}
          </div>
          <div class="explanation">
            <strong>Solution:</strong><br>
            ${q.solution || "Solution not available for this question."}
          </div>
        </div>
      `).join("")}
    `;
  }).join("")}
  
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      renderMathInElement(document.body, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ]
      });
    });
  </script>
</body>
</html>`;
  };

  const downloadPDF = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getChaptersBySubject = (subject: string, classLevel: "11" | "12") => {
    const key = `${subject}_${classLevel}` as keyof typeof JEE_CHAPTERS;
    return JEE_CHAPTERS[key] || [];
  };

  const isChapterSelected = (chapter: Chapter) => {
    return testBuilder.selectedChapters.some(c => c.id === chapter.id);
  };

  const getSelectedCount = (subject: string) => {
    return testBuilder.selectedChapters.filter(c => c.subject === subject).length;
  };

  return (
    <section className="py-12 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="pill pill-primary mb-4">
            <Target className="h-3 w-3" />
            Practice & Excel
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            JEE <span className="text-gradient-glow">Test Builder</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Create authentic JEE Main & Advanced tests from curated question bank. 
            Practice online or download PDFs instantly.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Step 1: Exam Type */}
          <Card className="border-border/50 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <CardTitle className="text-lg">Select Exam Type</CardTitle>
                  <CardDescription>Choose between JEE Main or JEE Advanced</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={testBuilder.examType}
                onValueChange={(v) => testBuilder.setExamType(v as ExamType)}
                className="grid md:grid-cols-2 gap-4"
              >
                {(["jee_main", "jee_advanced"] as ExamType[]).map((type) => (
                  <Label
                    key={type}
                    htmlFor={type}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      testBuilder.examType === type
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={type} id={type} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-semibold">{examDetails[type].title}</span>
                        {type === "jee_advanced" && (
                          <Badge variant="secondary" className="text-xs">Advanced</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{examDetails[type].description}</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {examDetails[type].pattern}
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Difficulty: {examDetails[type].difficulty}
                        </div>
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Step 2: Syllabus Selection */}
          <Card className="border-border/50 animate-fade-in stagger-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <CardTitle className="text-lg">Select Syllabus</CardTitle>
                  <CardDescription>Choose the topics you want to practice</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={testBuilder.syllabusType}
                onValueChange={(v) => testBuilder.setSyllabusType(v as SyllabusType)}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {[
                  { value: "class_11", label: "Class 11", icon: GraduationCap },
                  { value: "class_12", label: "Class 12", icon: GraduationCap },
                  { value: "both", label: "Full Syllabus", icon: BookOpen },
                  { value: "custom", label: "Custom", icon: Target },
                ].map(({ value, label, icon: Icon }) => (
                  <Label
                    key={value}
                    htmlFor={`syllabus-${value}`}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 text-center ${
                      testBuilder.syllabusType === value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={value} id={`syllabus-${value}`} className="sr-only" />
                    <Icon className={`h-5 w-5 ${testBuilder.syllabusType === value ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </Label>
                ))}
              </RadioGroup>

              {/* Chapter Selection (for Custom) */}
              {testBuilder.syllabusType === "custom" && (
                <div className="mt-6 border rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Select Chapters</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{testBuilder.selectedChapters.length} selected</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={testBuilder.clearChapters}
                        className="h-7 text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <Tabs defaultValue="physics" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="physics" className="gap-1">
                        Physics
                        {getSelectedCount("physics") > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 px-1.5">{getSelectedCount("physics")}</Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="chemistry" className="gap-1">
                        Chemistry
                        {getSelectedCount("chemistry") > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 px-1.5">{getSelectedCount("chemistry")}</Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="mathematics" className="gap-1">
                        Mathematics
                        {getSelectedCount("mathematics") > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 px-1.5">{getSelectedCount("mathematics")}</Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    {["physics", "chemistry", "mathematics"].map((subject) => (
                      <TabsContent key={subject} value={subject}>
                        <ScrollArea className="h-[300px] pr-4">
                          <div className="space-y-6">
                            {(["11", "12"] as const).map((classLevel) => (
                              <div key={classLevel}>
                                <h5 className="text-sm font-medium text-muted-foreground mb-3">
                                  Class {classLevel}
                                </h5>
                                <div className="grid gap-2">
                                  {getChaptersBySubject(subject, classLevel).map((chapter) => (
                                    <Label
                                      key={chapter.id}
                                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                                        isChapterSelected(chapter)
                                          ? "border-primary/50 bg-primary/5"
                                          : "border-border hover:bg-muted/50"
                                      }`}
                                    >
                                      <Checkbox
                                        checked={isChapterSelected(chapter)}
                                        onCheckedChange={() => testBuilder.toggleChapter(chapter)}
                                      />
                                      <span className="text-sm">{chapter.name}</span>
                                    </Label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Test Mode */}
          <Card className="border-border/50 animate-fade-in stagger-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <CardTitle className="text-lg">Select Mode</CardTitle>
                  <CardDescription>Choose how you want to practice</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("online")}
                  className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                    mode === "online"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`p-3 rounded-lg ${mode === "online" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <Play className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold mb-1">Online Exam Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Full exam simulator with timer, navigation panel, and instant results
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Timed
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Analysis
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMode("pdf")}
                  className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                    mode === "pdf"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`p-3 rounded-lg ${mode === "pdf" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold mb-1">Download PDF</h4>
                    <p className="text-sm text-muted-foreground">
                      Get printable question paper and detailed solutions PDF
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Printable
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        Solutions
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex flex-col items-center gap-4 pt-4">
            {testBuilder.isGenerating && testBuilder.generationProgress ? (
              <div className="space-y-4 w-full max-w-md animate-fade-in">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                    <span className="text-muted-foreground">{testBuilder.generationProgress.message}</span>
                  </div>
                  <span className="font-medium">
                    {testBuilder.generationProgress.total > 0
                      ? Math.round((testBuilder.generationProgress.completed / testBuilder.generationProgress.total) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={testBuilder.generationProgress.total > 0
                    ? (testBuilder.generationProgress.completed / testBuilder.generationProgress.total) * 100
                    : 0} 
                  className="h-2" 
                />
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {testBuilder.generationProgress.questionsGenerated} questions ready
                  </span>
                </div>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={testBuilder.isGenerating}
                className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 px-8 transition-all hover:scale-105 hover:shadow-xl"
              >
                {testBuilder.isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Preparing...
                  </>
                ) : mode === "online" ? (
                  <>
                    <Play className="h-5 w-5" />
                    Start Test
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Generate PDFs
                  </>
                )}
              </Button>
            )}

            {/* Download buttons for PDF mode after test is generated */}
            {mode === "pdf" && testBuilder.questions.length > 0 && !testBuilder.isGenerating && (
              <div className="flex gap-4 mt-4 animate-fade-in">
                <Button
                  variant="outline"
                  onClick={() => {
                    const content = generateQuestionPaperContent(testBuilder.questions, testBuilder.examType);
                    downloadPDF(content, `JEE_${testBuilder.examType === "jee_main" ? "Main" : "Advanced"}_Questions.html`);
                  }}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Questions PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const content = generateSolutionContent(testBuilder.questions, testBuilder.examType);
                    downloadPDF(content, `JEE_${testBuilder.examType === "jee_main" ? "Main" : "Advanced"}_Solutions.html`);
                  }}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Download Solutions PDF
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground text-center max-w-md">
              {mode === "online" 
                ? "Questions are loaded instantly from our curated bank. No AI generation delay!"
                : "Two separate files will be downloaded: Question Paper and Solutions."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
