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
import { toast } from "sonner";
import { jsPDF } from "jspdf";
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

  const handleDownloadPDF = async () => {
    const questions = testBuilder.questions;
    if (questions.length === 0) return;

    toast.info("Generating PDFs...", { duration: 2000 });

    // Generate Question Paper PDF
    await generateQuestionPaperPDF(questions, testBuilder.examType);
    
    // Generate Solution PDF
    await generateSolutionPDF(questions, testBuilder.examType);
    
    toast.success("PDFs downloaded successfully!");
  };

  const cleanLatex = (text: string): string => {
    // Remove LaTeX delimiters and simplify for PDF
    return text
      .replace(/\$\$(.*?)\$\$/g, '$1')
      .replace(/\$(.*?)\$/g, '$1')
      .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{(.*?)\}/g, '√($1)')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\pm/g, '±')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\pi/g, 'π')
      .replace(/\\theta/g, 'θ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\omega/g, 'ω')
      .replace(/\\mu/g, 'μ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\infty/g, '∞')
      .replace(/\\degree/g, '°')
      .replace(/\^(\d+)/g, '^$1')
      .replace(/\_(\d+)/g, '_$1')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[{}]/g, '')
      .trim();
  };

  const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const generateQuestionPaperPDF = async (questions: any[], examType: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const title = `JEE ${examType === "jee_main" ? "Main" : "Advanced"} - Question Paper`;
    doc.text(title, pageWidth / 2, y, { align: "center" });
    y += 10;

    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Questions: ${questions.length} | Time: 3 Hours`, pageWidth / 2, y, { align: "center" });
    y += 15;

    // Questions by subject
    const subjects = ["physics", "chemistry", "mathematics"];
    
    for (const subject of subjects) {
      const subjectQs = questions.filter(q => q.subject === subject);
      if (subjectQs.length === 0) continue;

      // Subject header
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }
      
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y - 5, contentWidth, 10, "F");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${subject.toUpperCase()} (${subjectQs.length} Questions)`, margin + 5, y + 2);
      y += 15;

      // Questions
      for (const q of subjectQs) {
        const questionText = cleanLatex(q.question_text);
        const wrappedQuestion = wrapText(doc, `Q${q.question_number}. ${questionText}`, contentWidth - 40);
        
        // Check if we need a new page
        const questionHeight = wrappedQuestion.length * 5 + (q.options ? q.options.length * 6 : 10) + 15;
        if (y + questionHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        // Question number and marks
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Q${q.question_number}.`, margin, y);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(`[+${q.marks_positive}/-${q.marks_negative}]`, pageWidth - margin - 20, y);
        y += 5;

        // Question text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        for (const line of wrappedQuestion.slice(0, 1).length ? [wrappedQuestion[0].replace(/^Q\d+\.\s*/, '')] : []) {
          doc.text(line, margin + 8, y);
          y += 5;
        }
        for (let i = 1; i < wrappedQuestion.length; i++) {
          doc.text(wrappedQuestion[i], margin + 8, y);
          y += 5;
        }

        // Options
        if (q.options && q.options.length > 0) {
          y += 2;
          for (const opt of q.options) {
            const optionText = cleanLatex(`(${opt.label}) ${opt.text}`);
            const wrappedOption = wrapText(doc, optionText, contentWidth - 20);
            
            for (const line of wrappedOption) {
              if (y > pageHeight - margin) {
                doc.addPage();
                y = margin;
              }
              doc.text(line, margin + 15, y);
              y += 5;
            }
          }
        } else {
          // Numerical answer space
          doc.text("Answer: _____________", margin + 15, y);
          y += 5;
        }

        y += 8; // Space between questions
      }
    }

    doc.save(`JEE_${examType === "jee_main" ? "Main" : "Advanced"}_Question_Paper.pdf`);
  };

  const generateSolutionPDF = async (questions: any[], examType: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const title = `JEE ${examType === "jee_main" ? "Main" : "Advanced"} - Solutions`;
    doc.text(title, pageWidth / 2, y, { align: "center" });
    y += 15;

    // Questions by subject
    const subjects = ["physics", "chemistry", "mathematics"];
    
    for (const subject of subjects) {
      const subjectQs = questions.filter(q => q.subject === subject);
      if (subjectQs.length === 0) continue;

      // Subject header
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }
      
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y - 5, contentWidth, 10, "F");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${subject.toUpperCase()}`, margin + 5, y + 2);
      y += 15;

      // Solutions
      for (const q of subjectQs) {
        const questionText = cleanLatex(q.question_text);
        const wrappedQuestion = wrapText(doc, `Q${q.question_number}. ${questionText}`, contentWidth - 10);
        const solutionText = q.solution ? cleanLatex(q.solution) : "Solution not available for this question.";
        const wrappedSolution = wrapText(doc, solutionText, contentWidth - 10);
        
        // Calculate height needed
        const totalHeight = wrappedQuestion.length * 5 + 15 + wrappedSolution.length * 5 + 20;
        
        if (y + totalHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        // Question
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        for (const line of wrappedQuestion) {
          doc.text(line, margin, y);
          y += 5;
        }
        y += 3;

        // Answer box
        doc.setFillColor(232, 245, 233);
        doc.rect(margin, y - 4, contentWidth, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const answerText = Array.isArray(q.correct_answer) 
          ? q.correct_answer.join(", ") 
          : String(q.correct_answer);
        doc.text(`Answer: ${answerText}`, margin + 3, y + 1);
        y += 12;

        // Solution
        doc.setFillColor(245, 245, 245);
        const solutionBoxHeight = wrappedSolution.length * 5 + 10;
        doc.rect(margin, y - 4, contentWidth, solutionBoxHeight, "F");
        
        doc.setFont("helvetica", "bold");
        doc.text("Solution:", margin + 3, y + 1);
        y += 6;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        for (const line of wrappedSolution) {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin + 3, y);
          y += 5;
        }

        y += 12; // Space between solutions
      }
    }

    doc.save(`JEE_${examType === "jee_main" ? "Main" : "Advanced"}_Solutions.pdf`);
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
                  onClick={() => generateQuestionPaperPDF(testBuilder.questions, testBuilder.examType)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Questions PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateSolutionPDF(testBuilder.questions, testBuilder.examType)}
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
