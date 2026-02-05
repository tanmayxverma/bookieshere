import { useState } from "react";
import { 
  FileText, 
  Target, 
  Clock, 
  BookOpen, 
  Calendar,
  GraduationCap,
  Download,
  Play,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { usePYQTest, ExamType, TestMode, AttemptMode, ClassLevel } from "@/hooks/usePYQTest";

interface PYQTestConfigProps {
  testState: ReturnType<typeof usePYQTest>;
  onStartTest: () => void;
}

export function PYQTestConfig({ testState, onStartTest }: PYQTestConfigProps) {
  const [step, setStep] = useState(1);

  const handleGenerate = async () => {
    if (!testState.isConfigValid()) {
      toast.error("Please complete all required selections");
      return;
    }

    const success = await testState.loadQuestions();
    if (success) {
      if (testState.attemptMode === "online") {
        onStartTest();
      } else {
        // Generate PDFs
        handleDownloadPDF();
      }
    } else {
      toast.error("No questions found for the selected criteria");
    }
  };

  const cleanLatex = (text: string): string => {
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
    
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleDownloadPDF = async () => {
    const questions = testState.questions;
    if (questions.length === 0) {
      toast.error("No questions to generate PDF");
      return;
    }

    toast.info("Generating PDFs...", { duration: 2000 });

    // Generate Question Paper
    const qDoc = new jsPDF();
    const pageWidth = qDoc.internal.pageSize.getWidth();
    const pageHeight = qDoc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Title
    qDoc.setFontSize(16);
    qDoc.setFont("helvetica", "bold");
    const examName = testState.examType === "jee_main" ? "JEE Main" : "JEE Advanced";
    let title = `${examName} - Official PYQ`;
    if (testState.testMode === "year_wise" && testState.selectedYear) {
      title += ` ${testState.selectedYear}`;
      if (testState.selectedShift) title += ` (${testState.selectedShift} Shift)`;
      if (testState.selectedPaper) title += ` Paper ${testState.selectedPaper}`;
    }
    qDoc.text(title, pageWidth / 2, y, { align: "center" });
    y += 8;

    qDoc.setFontSize(9);
    qDoc.setFont("helvetica", "italic");
    qDoc.text("Questions sourced from official JEE examinations", pageWidth / 2, y, { align: "center" });
    y += 12;

    // Questions grouped by subject
    const subjects = ["physics", "chemistry", "mathematics"] as const;
    
    for (const subject of subjects) {
      const subjectQs = questions.filter(q => q.subject === subject);
      if (subjectQs.length === 0) continue;

      if (y > pageHeight - 40) {
        qDoc.addPage();
        y = margin;
      }
      
      qDoc.setFillColor(240, 240, 240);
      qDoc.rect(margin, y - 5, contentWidth, 10, "F");
      qDoc.setFontSize(11);
      qDoc.setFont("helvetica", "bold");
      qDoc.text(`${subject.toUpperCase()} (${subjectQs.length} Questions)`, margin + 5, y + 2);
      y += 15;

      subjectQs.forEach((q, idx) => {
        const questionText = cleanLatex(q.question_text);
        const wrappedQuestion = wrapText(qDoc, `${idx + 1}. ${questionText}`, contentWidth - 10);
        
        const questionHeight = wrappedQuestion.length * 5 + (q.options ? q.options.length * 6 : 10) + 15;
        if (y + questionHeight > pageHeight - margin) {
          qDoc.addPage();
          y = margin;
        }

        qDoc.setFontSize(9);
        qDoc.setFont("helvetica", "normal");
        wrappedQuestion.forEach(line => {
          qDoc.text(line, margin, y);
          y += 5;
        });

        if (q.options) {
          y += 2;
          q.options.forEach(opt => {
            const optText = cleanLatex(`(${opt.label}) ${opt.text}`);
            qDoc.text(optText.substring(0, 80), margin + 10, y);
            y += 5;
          });
        } else {
          qDoc.text("Answer: _____________", margin + 10, y);
          y += 5;
        }
        
        y += 8;
      });
    }

    qDoc.save(`${examName}_PYQ_Questions.pdf`);

    // Generate Solutions PDF
    const sDoc = new jsPDF();
    y = margin;

    sDoc.setFontSize(16);
    sDoc.setFont("helvetica", "bold");
    sDoc.text(`${title} - Solutions`, pageWidth / 2, y, { align: "center" });
    y += 15;

    for (const subject of subjects) {
      const subjectQs = questions.filter(q => q.subject === subject);
      if (subjectQs.length === 0) continue;

      if (y > pageHeight - 40) {
        sDoc.addPage();
        y = margin;
      }
      
      sDoc.setFillColor(240, 240, 240);
      sDoc.rect(margin, y - 5, contentWidth, 10, "F");
      sDoc.setFontSize(11);
      sDoc.setFont("helvetica", "bold");
      sDoc.text(`${subject.toUpperCase()}`, margin + 5, y + 2);
      y += 15;

      subjectQs.forEach((q, idx) => {
        if (y > pageHeight - 50) {
          sDoc.addPage();
          y = margin;
        }

        sDoc.setFontSize(9);
        sDoc.setFont("helvetica", "bold");
        sDoc.text(`Q${idx + 1}.`, margin, y);
        
        const answerText = Array.isArray(q.correct_answer) 
          ? q.correct_answer.join(", ") 
          : String(q.correct_answer);
        
        sDoc.setFillColor(232, 245, 233);
        sDoc.rect(margin + 15, y - 4, 40, 7, "F");
        sDoc.text(`Answer: ${answerText}`, margin + 17, y);
        y += 10;

        const solutionText = q.solution 
          ? cleanLatex(q.solution) 
          : "Solution not available for this question.";
        const wrappedSolution = wrapText(sDoc, solutionText, contentWidth - 20);
        
        sDoc.setFont("helvetica", "normal");
        sDoc.setFontSize(8);
        wrappedSolution.forEach(line => {
          if (y > pageHeight - margin) {
            sDoc.addPage();
            y = margin;
          }
          sDoc.text(line, margin + 5, y);
          y += 4;
        });

        y += 10;
      });
    }

    sDoc.save(`${examName}_PYQ_Solutions.pdf`);
    toast.success("PDFs downloaded successfully!");
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              s < step ? "bg-primary text-primary-foreground" :
              s === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
              "bg-muted text-muted-foreground"
            }`}
          >
            {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
          </div>
          {s < 4 && (
            <div className={`w-12 h-0.5 mx-1 ${s < step ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );

  // Loading state
  if (testState.isLoading) {
    return (
      <section className="py-12 min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h2 className="font-display text-2xl font-bold">Loading Questions...</h2>
            <p className="text-muted-foreground">Fetching official PYQs from our database</p>
            <Progress value={testState.loadingProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">{testState.loadingProgress}% complete</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="pill pill-primary mb-4">
            <Target className="h-3 w-3" />
            Official PYQ Practice
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            JEE <span className="text-gradient-glow">Test Series</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            All questions sourced from official JEE Main and JEE Advanced examinations conducted by the respective authorities.
          </p>
        </div>

        {renderStepIndicator()}

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Select Exam */}
          {step === 1 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</div>
                  Select Exam
                </CardTitle>
                <CardDescription>Choose between JEE Main or JEE Advanced</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={testState.examType}
                  onValueChange={(v) => testState.setExamType(v as ExamType)}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="jee_main"
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      testState.examType === "jee_main"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="jee_main" id="jee_main" className="mt-1" />
                    <div>
                      <span className="font-display font-semibold">JEE Main</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        90 questions • 3 hours • 300 marks
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Single correct MCQs + Numerical
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="jee_advanced"
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      testState.examType === "jee_advanced"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="jee_advanced" id="jee_advanced" className="mt-1" />
                    <div>
                      <span className="font-display font-semibold">JEE Advanced</span>
                      <Badge variant="secondary" className="ml-2 text-xs">Advanced</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Full paper pattern • 3 hours per paper
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        MCQ, Multi-correct, Numerical, Matrix
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setStep(2)} className="gap-2">
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select Mode */}
          {step === 2 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</div>
                  Select Mode
                </CardTitle>
                <CardDescription>Choose how you want to practice</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={testState.testMode}
                  onValueChange={(v) => testState.setTestMode(v as TestMode)}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="year_wise"
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      testState.testMode === "year_wise"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="year_wise" id="year_wise" className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-display font-semibold">Year-wise</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Practice full papers from a specific year and shift/paper
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="topic_wise"
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      testState.testMode === "topic_wise"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="topic_wise" id="topic_wise" className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="font-display font-semibold">Topic-wise</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Practice questions from specific topics and chapters
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} className="gap-2">
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Select Year/Topics */}
          {step === 3 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</div>
                  {testState.testMode === "year_wise" ? "Select Year & Shift" : "Select Topics"}
                </CardTitle>
                <CardDescription>
                  {testState.testMode === "year_wise" 
                    ? "Choose the year and shift/paper you want to practice"
                    : "Choose class level, subject, and topics"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {testState.testMode === "year_wise" ? (
                  <>
                    {/* Year Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Select Year</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {testState.availableYears.map(year => (
                          <Button
                            key={year}
                            variant={testState.selectedYear === year ? "default" : "outline"}
                            size="sm"
                            onClick={() => testState.setSelectedYear(year)}
                            className="transition-all hover:scale-105"
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Shift/Paper Selection */}
                    {testState.selectedYear && (
                      <div className="animate-fade-in">
                        <Label className="text-sm font-medium mb-3 block">
                          {testState.examType === "jee_main" ? "Select Shift" : "Select Paper"}
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          {testState.examType === "jee_main" ? (
                            testState.availableShifts.map(shift => (
                              <Button
                                key={shift}
                                variant={testState.selectedShift === shift ? "default" : "outline"}
                                onClick={() => testState.setSelectedShift(shift)}
                                className="gap-2 h-auto py-4 transition-all hover:scale-[1.02]"
                              >
                                {shift === "Morning" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                {shift} Shift
                              </Button>
                            ))
                          ) : (
                            testState.availablePapers.map(paper => (
                              <Button
                                key={paper}
                                variant={testState.selectedPaper === paper ? "default" : "outline"}
                                onClick={() => testState.setSelectedPaper(paper)}
                                className="gap-2 h-auto py-4 transition-all hover:scale-[1.02]"
                              >
                                <FileText className="h-4 w-4" />
                                Paper {paper}
                              </Button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Class Level Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Select Class Level</Label>
                      <RadioGroup
                        value={testState.classLevel}
                        onValueChange={(v) => testState.setClassLevel(v as ClassLevel)}
                        className="grid grid-cols-3 gap-3"
                      >
                        {[
                          { value: "11", label: "Class 11 only", icon: GraduationCap },
                          { value: "12", label: "Class 12 only", icon: GraduationCap },
                          { value: "custom", label: "Custom", icon: Layers },
                        ].map(({ value, label, icon: Icon }) => (
                          <Label
                            key={value}
                            htmlFor={`class-${value}`}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 text-center ${
                              testState.classLevel === value
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem value={value} id={`class-${value}`} className="sr-only" />
                            <Icon className={`h-5 w-5 ${testState.classLevel === value ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-sm font-medium">{label}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Subject Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Select Subject</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(["physics", "chemistry", "mathematics"] as const).map(subject => (
                          <Button
                            key={subject}
                            variant={testState.selectedSubject === subject ? "default" : "outline"}
                            onClick={() => testState.setSelectedSubject(subject)}
                            className="capitalize transition-all hover:scale-105"
                          >
                            {subject}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Topic Selection */}
                    {testState.selectedSubject && (
                      <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium">Select Topics</Label>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={testState.selectAllTopics}>
                              Select All
                            </Button>
                            <Button variant="ghost" size="sm" onClick={testState.clearTopics}>
                              Clear
                            </Button>
                          </div>
                        </div>
                        <ScrollArea className="h-48 border rounded-lg p-3">
                          <div className="space-y-2">
                            {testState.getAvailableTopics().map(topic => (
                              <Label
                                key={topic.name}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                  testState.selectedTopics.includes(topic.name)
                                    ? "bg-primary/5"
                                    : "hover:bg-muted/50"
                                }`}
                              >
                                <Checkbox
                                  checked={testState.selectedTopics.includes(topic.name)}
                                  onCheckedChange={() => testState.toggleTopic(topic.name)}
                                />
                                <span className="text-sm flex-1">{topic.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  Class {topic.classLevel}
                                </Badge>
                              </Label>
                            ))}
                          </div>
                        </ScrollArea>
                        <p className="text-xs text-muted-foreground mt-2">
                          {testState.selectedTopics.length} topic(s) selected
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button 
                    onClick={() => setStep(4)} 
                    className="gap-2"
                    disabled={!testState.isConfigValid()}
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Select Attempt Mode */}
          {step === 4 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</div>
                  Select Attempt Mode
                </CardTitle>
                <CardDescription>Choose how you want to attempt this test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={testState.attemptMode}
                  onValueChange={(v) => testState.setAttemptMode(v as AttemptMode)}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="online"
                    className={`flex items-start gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      testState.attemptMode === "online"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="online" id="online" className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="h-5 w-5 text-primary" />
                        <span className="font-display font-semibold text-lg">Online CBT</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Attempt the test in a simulated Computer Based Test environment with timer, question palette, and mark-for-review features.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Timed</span>
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Auto-graded</span>
                      </div>
                    </div>
                  </Label>
                  <Label
                    htmlFor="pdf"
                    className={`flex items-start gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      testState.attemptMode === "pdf"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="pdf" id="pdf" className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="h-5 w-5 text-primary" />
                        <span className="font-display font-semibold text-lg">Download PDF</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Download separate Question Paper and Solution PDFs for offline practice. Perfect for pen-and-paper practice.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Question PDF</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Solution PDF</span>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>

                {/* Summary */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-medium mb-3">Test Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Exam:</span>
                      <Badge variant="outline">
                        {testState.examType === "jee_main" ? "JEE Main" : "JEE Advanced"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Mode:</span>
                      <Badge variant="outline">
                        {testState.testMode === "year_wise" ? "Year-wise" : "Topic-wise"}
                      </Badge>
                    </div>
                    {testState.testMode === "year_wise" && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Year:</span>
                          <span>{testState.selectedYear}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {testState.examType === "jee_main" ? "Shift:" : "Paper:"}
                          </span>
                          <span>
                            {testState.examType === "jee_main" 
                              ? testState.selectedShift 
                              : `Paper ${testState.selectedPaper}`}
                          </span>
                        </div>
                      </>
                    )}
                    {testState.testMode === "topic_wise" && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Subject:</span>
                          <span className="capitalize">{testState.selectedSubject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Topics:</span>
                          <span>{testState.selectedTopics.length} selected</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button 
                    onClick={handleGenerate}
                    className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:shadow-lg"
                    size="lg"
                  >
                    {testState.attemptMode === "online" ? (
                      <>
                        <Play className="h-4 w-4" />
                        Start Test
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDFs
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
