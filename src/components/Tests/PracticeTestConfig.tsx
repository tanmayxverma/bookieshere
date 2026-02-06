import { useState } from "react";
import { 
  Target, 
  Clock, 
  BookOpen, 
  GraduationCap,
  Download,
  Play,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Layers,
  Info,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { usePracticeTest, TestType, AttemptMode } from "@/hooks/usePracticeTest";
import { SyllabusLevel } from "@/data/practiceBank";

interface PracticeTestConfigProps {
  testState: ReturnType<typeof usePracticeTest>;
  onStartTest: () => void;
}

export function PracticeTestConfig({ testState, onStartTest }: PracticeTestConfigProps) {
  const [step, setStep] = useState(1);
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(null);

  // Custom mode requires topic selection (step 3), otherwise skip to step 4
  const isCustomMode = testState.syllabusLevel === "custom";
  const totalSteps = isCustomMode ? 4 : 3;

  // Map visual step to actual step number for non-custom mode
  const getActualStep = (visualStep: number) => {
    if (isCustomMode) return visualStep;
    // Non-custom: step 1=type, step 2=syllabus+subjects, step 3=attempt mode (skip topics)
    if (visualStep >= 3) return 4; // attempt mode
    return visualStep;
  };

  const handleGenerate = async () => {
    if (!testState.isConfigValid()) {
      toast.error("Please complete all required selections");
      return;
    }

    setUnavailableMessage(null);
    window.scrollTo({ top: 0, behavior: "instant" });
    const result = await testState.loadQuestions();
    
    if (result.success) {
      if (testState.attemptMode === "online") {
        onStartTest();
      } else {
        handleDownloadPDF();
      }
    } else {
      setUnavailableMessage(result.message || "No questions available for the selected configuration.");
    }
  };

  const cleanLatex = (text: string): string => {
    return text
      .replace(/\$\$(.*?)\$\$/g, '$1')
      .replace(/\$(.*?)\$/g, '$1')
      .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{(.*?)\}/g, '√($1)')
      .replace(/\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/gs, '[$1]')
      .replace(/\\begin\{vmatrix\}(.*?)\\end\{vmatrix\}/gs, '|$1|')
      .replace(/\\\\/g, '; ')
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
      .replace(/\\varepsilon/g, 'ε')
      .replace(/\\phi/g, 'φ')
      .replace(/\\infty/g, '∞')
      .replace(/\\degree/g, '°')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\rightleftharpoons/g, '⇌')
      .replace(/\\xrightarrow\{.*?\}/g, '→')
      .replace(/\\hat\{([a-zA-Z])\}/g, '$1̂')
      .replace(/\\vec\{([a-zA-Z])\}/g, '$1⃗')
      .replace(/\\binom\{(.*?)\}\{(.*?)\}/g, 'C($1,$2)')
      .replace(/\\Big\|/g, '|')
      .replace(/\\left/g, '')
      .replace(/\\right/g, '')
      .replace(/\\cdot/g, '·')
      .replace(/\\sin/g, 'sin')
      .replace(/\\cos/g, 'cos')
      .replace(/\\tan/g, 'tan')
      .replace(/\\cot/g, 'cot')
      .replace(/\\ln/g, 'ln')
      .replace(/\\log/g, 'log')
      .replace(/\\lim/g, 'lim')
      .replace(/\\int/g, '∫')
      .replace(/\^{(.*?)}/g, '^($1)')
      .replace(/_{(.*?)}/g, '_($1)')
      .replace(/\^(\d+)/g, '^$1')
      .replace(/_(\d+)/g, '_$1')
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
      if (doc.getTextWidth(testLine) > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleDownloadPDF = () => {
    const questions = testState.questions;
    if (questions.length === 0) {
      toast.error("No questions to generate PDF");
      return;
    }

    toast.info("Generating PDFs...", { duration: 2000 });

    const qDoc = new jsPDF();
    const pageWidth = qDoc.internal.pageSize.getWidth();
    const pageHeight = qDoc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const typeName = testState.testType === "jee_main" ? "JEE Main Type" : "JEE Advanced Type";
    const title = `${typeName} Practice Test`;

    qDoc.setFontSize(16);
    qDoc.setFont("helvetica", "bold");
    qDoc.text(title, pageWidth / 2, y, { align: "center" });
    y += 8;
    qDoc.setFontSize(9);
    qDoc.setFont("helvetica", "italic");
    qDoc.text("Practice questions curated for concept relevance and quality", pageWidth / 2, y, { align: "center" });
    y += 6;
    qDoc.setFontSize(8);
    qDoc.text("Marking: +4 (Correct) / -1 (Incorrect) / 0 (Unattempted)", pageWidth / 2, y, { align: "center" });
    y += 12;

    const subjects = ["physics", "chemistry", "mathematics"] as const;
    for (const subject of subjects) {
      const subjectQs = questions.filter(q => q.subject === subject);
      if (subjectQs.length === 0) continue;

      if (y > pageHeight - 40) { qDoc.addPage(); y = margin; }
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
        if (y + questionHeight > pageHeight - margin) { qDoc.addPage(); y = margin; }

        qDoc.setFontSize(9);
        qDoc.setFont("helvetica", "normal");
        wrappedQuestion.forEach(line => { qDoc.text(line, margin, y); y += 5; });

        if (q.options) {
          y += 2;
          q.options.forEach(opt => {
            const optText = cleanLatex(`(${opt.label}) ${opt.text}`);
            const wrappedOpt = wrapText(qDoc, optText, contentWidth - 20);
            wrappedOpt.forEach(line => { qDoc.text(line, margin + 10, y); y += 5; });
          });
        } else {
          qDoc.text("Answer: _____________", margin + 10, y);
          y += 5;
        }

        qDoc.setFontSize(7);
        qDoc.setTextColor(100, 100, 100);
        qDoc.text("[+4 / -1]", margin, y);
        qDoc.setTextColor(0, 0, 0);
        qDoc.setFontSize(9);
        y += 8;
      });
    }
    qDoc.save(`${typeName}_Practice_Questions.pdf`);

    // Solution PDF
    const sDoc = new jsPDF();
    y = margin;
    sDoc.setFontSize(16);
    sDoc.setFont("helvetica", "bold");
    sDoc.text(`${title} - Solutions`, pageWidth / 2, y, { align: "center" });
    y += 12;

    for (const subject of subjects) {
      const subjectQs = questions.filter(q => q.subject === subject);
      if (subjectQs.length === 0) continue;

      if (y > pageHeight - 40) { sDoc.addPage(); y = margin; }
      sDoc.setFillColor(240, 240, 240);
      sDoc.rect(margin, y - 5, contentWidth, 10, "F");
      sDoc.setFontSize(11);
      sDoc.setFont("helvetica", "bold");
      sDoc.text(subject.toUpperCase(), margin + 5, y + 2);
      y += 15;

      subjectQs.forEach((q, idx) => {
        if (y > pageHeight - 50) { sDoc.addPage(); y = margin; }

        sDoc.setFontSize(9);
        sDoc.setFont("helvetica", "bold");
        sDoc.text(`Q${idx + 1}.`, margin, y);

        const answerText = Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : String(q.correct_answer);
        sDoc.setFillColor(232, 245, 233);
        sDoc.rect(margin + 15, y - 4, 40, 7, "F");
        sDoc.text(`Answer: ${answerText}`, margin + 17, y);
        y += 10;

        const solutionText = q.solution ? cleanLatex(q.solution) : "Solution not available for this question.";
        const wrappedSolution = wrapText(sDoc, solutionText, contentWidth - 20);
        sDoc.setFont("helvetica", "normal");
        sDoc.setFontSize(8);
        wrappedSolution.forEach(line => {
          if (y > pageHeight - margin) { sDoc.addPage(); y = margin; }
          sDoc.text(line, margin + 5, y);
          y += 4;
        });
        y += 10;
      });
    }
    sDoc.save(`${typeName}_Practice_Solutions.pdf`);
    toast.success("PDFs downloaded successfully!");
  };

  const goToStep = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // When moving from step 2, auto-select all topics if not custom mode
  const handleStep2Continue = () => {
    if (testState.selectedSubjects.length === 0) return;
    if (isCustomMode) {
      goToStep(3); // Show topic selection
    } else {
      // Auto-select all topics for the selected subjects + syllabus level
      testState.selectAllTopics();
      goToStep(4); // Skip directly to attempt mode
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
        const actualStep = isCustomMode ? s : (s >= 3 ? 4 : s);
        const isBefore = isCustomMode ? s < step : (actualStep < step);
        const isCurrent = isCustomMode ? s === step : (actualStep === step);
        return (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              isBefore ? "bg-primary text-primary-foreground" :
              isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
              "bg-muted text-muted-foreground"
            }`}>
              {isBefore ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < totalSteps && <div className={`w-12 h-0.5 mx-1 ${isBefore ? "bg-primary" : "bg-muted"}`} />}
          </div>
        );
      })}
    </div>
  );

  if (testState.isLoading) {
    return (
      <section className="py-12 min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h2 className="font-display text-2xl font-bold">Loading Questions...</h2>
            <p className="text-muted-foreground">Compiling your practice test</p>
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
            Practice Test Engine
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            JEE <span className="text-gradient-glow">Practice Tests</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Quality practice questions curated for concept relevance and difficulty matching. Every test feels different.
          </p>
        </div>

        {renderStepIndicator()}

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Select Test Type */}
          {step === 1 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</div>
                  Select Test Type
                </CardTitle>
                <CardDescription>Choose the difficulty and pattern for your practice</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={testState.testType}
                  onValueChange={(v) => testState.setTestType(v as TestType)}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="jee_main"
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      testState.testType === "jee_main" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="jee_main" id="jee_main" className="mt-1" />
                    <div>
                      <span className="font-display font-semibold">JEE Main Type</span>
                      <p className="text-sm text-muted-foreground mt-1">Moderate difficulty • Single correct MCQs + Numerical</p>
                      <p className="text-xs text-muted-foreground mt-1">Application-based, solvable in reasonable time</p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="jee_advanced"
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      testState.testType === "jee_advanced" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="jee_advanced" id="jee_advanced" className="mt-1" />
                    <div>
                      <span className="font-display font-semibold">JEE Advanced Type</span>
                      <Badge variant="secondary" className="ml-2 text-xs">Harder</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Deep thinking • Multi-concept • Multi-correct, Numerical</p>
                      <p className="text-xs text-muted-foreground mt-1">Requires combining multiple concepts</p>
                    </div>
                  </Label>
                </RadioGroup>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => goToStep(2)} className="gap-2">
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Syllabus & Subjects */}
          {step === 2 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</div>
                  Select Syllabus & Subjects
                </CardTitle>
                <CardDescription>Choose class level and subjects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Syllabus Level */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Syllabus Level</Label>
                  <RadioGroup
                    value={testState.syllabusLevel}
                    onValueChange={(v) => testState.setSyllabusLevel(v as SyllabusLevel)}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {[
                      { value: "11", label: "Class 11 Only", icon: GraduationCap },
                      { value: "12", label: "Class 12 Only", icon: GraduationCap },
                      { value: "both", label: "Class 11 + 12", icon: Layers },
                      { value: "custom", label: "Custom", icon: Target },
                    ].map(({ value, label, icon: Icon }) => (
                      <Label
                        key={value}
                        htmlFor={`syl-${value}`}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 text-center ${
                          testState.syllabusLevel === value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={value} id={`syl-${value}`} className="sr-only" />
                        <Icon className={`h-5 w-5 ${testState.syllabusLevel === value ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-xs font-medium">{label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Subjects */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Select Subject(s)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const all: ("physics" | "chemistry" | "mathematics")[] = ["physics", "chemistry", "mathematics"];
                        const allSelected = all.every(s => testState.selectedSubjects.includes(s));
                        if (allSelected) {
                          // Deselect all
                          all.forEach(s => {
                            if (testState.selectedSubjects.includes(s)) testState.toggleSubject(s);
                          });
                        } else {
                          // Select all
                          all.forEach(s => {
                            if (!testState.selectedSubjects.includes(s)) testState.toggleSubject(s);
                          });
                        }
                      }}
                    >
                      {["physics", "chemistry", "mathematics"].every(s => testState.selectedSubjects.includes(s as any))
                        ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["physics", "chemistry", "mathematics"] as const).map(subject => (
                      <Button
                        key={subject}
                        variant={testState.selectedSubjects.includes(subject) ? "default" : "outline"}
                        onClick={() => testState.toggleSubject(subject)}
                        className="capitalize transition-all hover:scale-105"
                      >
                        {subject}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {testState.selectedSubjects.length} subject(s) selected
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => goToStep(1)}>Back</Button>
                  <Button 
                    onClick={handleStep2Continue} 
                    className="gap-2"
                    disabled={testState.selectedSubjects.length === 0}
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Topics (ONLY for Custom mode) */}
          {step === 3 && isCustomMode && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</div>
                  Select Topics
                </CardTitle>
                <CardDescription>Choose specific chapters for your practice — ONLY these topics will be included</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Topics</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={testState.selectAllTopics}>Select All</Button>
                    <Button variant="ghost" size="sm" onClick={testState.clearTopics}>Clear</Button>
                  </div>
                </div>
                <ScrollArea className="h-64 border rounded-lg p-3">
                  <div className="space-y-2">
                    {testState.getAvailableTopics().map(topic => (
                      <Label
                        key={topic.name}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          testState.selectedTopics.includes(topic.name) ? "bg-primary/5" : "hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={testState.selectedTopics.includes(topic.name)}
                          onCheckedChange={() => testState.toggleTopic(topic.name)}
                        />
                        <span className="text-sm flex-1">{topic.name}</span>
                        <Badge variant="outline" className="text-xs">Class {topic.classLevel}</Badge>
                      </Label>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-xs text-muted-foreground">{testState.selectedTopics.length} topic(s) selected</p>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => goToStep(2)}>Back</Button>
                  <Button 
                    onClick={() => goToStep(4)} 
                    className="gap-2"
                    disabled={testState.selectedTopics.length === 0}
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4 (or 3 for non-custom): Attempt Mode */}
          {step === 4 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{totalSteps}</div>
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
                      testState.attemptMode === "online" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="online" id="online" className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="h-5 w-5 text-primary" />
                        <span className="font-display font-semibold text-lg">Online CBT</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Simulated CBT environment with timer, question palette, and mark-for-review.
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
                      testState.attemptMode === "pdf" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="pdf" id="pdf" className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="h-5 w-5 text-primary" />
                        <span className="font-display font-semibold text-lg">Download PDF</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Download Question Paper and Solution PDFs for offline practice.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Question PDF</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Solution PDF</span>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>

                {/* Test Summary */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-medium mb-3">Test Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{testState.testType === "jee_main" ? "JEE Main Type" : "JEE Advanced Type"}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Syllabus:</span>
                      <Badge variant="outline">
                        {testState.syllabusLevel === "11" ? "Class 11" : testState.syllabusLevel === "12" ? "Class 12" : testState.syllabusLevel === "both" ? "Class 11+12" : "Custom"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Subjects:</span>
                      <span className="capitalize">{testState.selectedSubjects.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Marking:</span>
                      <span className="text-sm font-medium">+4 / −1 / 0</span>
                    </div>
                  </div>
                </div>

                {unavailableMessage && (
                  <Alert variant="destructive" className="animate-fade-in">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Not Enough Questions</AlertTitle>
                    <AlertDescription>{unavailableMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Marking Scheme Notice */}
                <Alert className="bg-muted/50 border-primary/20">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-sm">Marking Scheme (Fixed)</AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground">
                    +4 for correct answer • −1 for incorrect answer • 0 for skipped. Negative scores are shown as-is.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => { goToStep(isCustomMode ? 3 : 2); setUnavailableMessage(null); }}>Back</Button>
                  <Button 
                    onClick={handleGenerate}
                    className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:shadow-lg"
                    size="lg"
                  >
                    {testState.attemptMode === "online" ? (
                      <><Play className="h-4 w-4" /> Start Test</>
                    ) : (
                      <><Download className="h-4 w-4" /> Download PDFs</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PYQ Redirect - Secondary Card */}
          <Card className="mt-8 border-dashed animate-fade-in">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Looking for PYQ-only practice?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Attempt official Previous Year Questions separately</p>
              </div>
              <a
                href="https://novatra.in/exams/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Try PYQ Practice
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}