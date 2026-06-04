import { useState, useEffect } from "react";
import {
  Target, Clock, BookOpen, GraduationCap, Download, Play,
  ChevronRight, ChevronLeft, CheckCircle2, Loader2, Layers,
  AlertTriangle, Sparkles, Atom, FlaskConical, Sigma,
  Zap, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const isCustomMode = testState.syllabusLevel === "custom";
  const totalSteps = isCustomMode ? 4 : 3;
  const stepLabels = isCustomMode
    ? ["Test Type", "Syllabus", "Topics", "Attempt"]
    : ["Test Type", "Syllabus", "Attempt"];

  // Restore last config from localStorage (UX polish)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bookie:lastPracticeConfig");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.testType) testState.setTestType(saved.testType);
      if (saved.syllabusLevel) testState.setSyllabusLevel(saved.syllabusLevel);
      if (saved.attemptMode) testState.setAttemptMode(saved.attemptMode);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bookie:lastPracticeConfig", JSON.stringify({
        testType: testState.testType,
        syllabusLevel: testState.syllabusLevel,
        attemptMode: testState.attemptMode,
      }));
    } catch { /* ignore */ }
  }, [testState.testType, testState.syllabusLevel, testState.attemptMode]);

  const handleGenerate = async () => {
    if (!testState.isConfigValid()) {
      toast.error("Please complete all required selections");
      return;
    }
    setUnavailableMessage(null);
    window.scrollTo({ top: 0, behavior: "instant" });
    const result = await testState.loadQuestions();
    if (!result.success) {
      setUnavailableMessage(result.message || "Not enough questions available for the selected criteria.");
      return;
    }
    if (testState.attemptMode === "online") onStartTest();
  };

  const [pendingPdf, setPendingPdf] = useState(false);
  const handleGenerateWithPdf = async () => {
    if (!testState.isConfigValid()) { toast.error("Please complete all required selections"); return; }
    if (testState.attemptMode === "pdf") setPendingPdf(true);
    await handleGenerate();
  };
  useEffect(() => {
    if (pendingPdf && testState.questions.length > 0 && !testState.isLoading) {
      setPendingPdf(false);
      handleDownloadPDF();
    }
  }, [pendingPdf, testState.questions.length, testState.isLoading]);

  const cleanLatex = (text: string): string => text
    .replace(/\$\$(.*?)\$\$/g, "$1").replace(/\$(.*?)\$/g, "$1")
    .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, "($1)/($2)").replace(/\\sqrt\{(.*?)\}/g, "√($1)")
    .replace(/\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/gs, "[$1]")
    .replace(/\\begin\{vmatrix\}(.*?)\\end\{vmatrix\}/gs, "|$1|")
    .replace(/\\\\/g, "; ").replace(/\\times/g, "×").replace(/\\div/g, "÷").replace(/\\pm/g, "±")
    .replace(/\\leq/g, "≤").replace(/\\geq/g, "≥").replace(/\\neq/g, "≠")
    .replace(/\\pi/g, "π").replace(/\\theta/g, "θ").replace(/\\alpha/g, "α").replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ").replace(/\\delta/g, "δ").replace(/\\omega/g, "ω").replace(/\\mu/g, "μ")
    .replace(/\\lambda/g, "λ").replace(/\\varepsilon/g, "ε").replace(/\\phi/g, "φ").replace(/\\infty/g, "∞")
    .replace(/\\degree/g, "°").replace(/\\rightarrow/g, "→").replace(/\\rightleftharpoons/g, "⇌")
    .replace(/\\xrightarrow\{.*?\}/g, "→").replace(/\\hat\{([a-zA-Z])\}/g, "$1̂").replace(/\\vec\{([a-zA-Z])\}/g, "$1⃗")
    .replace(/\\binom\{(.*?)\}\{(.*?)\}/g, "C($1,$2)").replace(/\\Big\|/g, "|")
    .replace(/\\left/g, "").replace(/\\right/g, "").replace(/\\cdot/g, "·")
    .replace(/\\sin/g, "sin").replace(/\\cos/g, "cos").replace(/\\tan/g, "tan").replace(/\\cot/g, "cot")
    .replace(/\\ln/g, "ln").replace(/\\log/g, "log").replace(/\\lim/g, "lim").replace(/\\int/g, "∫")
    .replace(/\^{(.*?)}/g, "^($1)").replace(/_{(.*?)}/g, "_($1)")
    .replace(/\^(\d+)/g, "^$1").replace(/_(\d+)/g, "_$1")
    .replace(/\\[a-zA-Z]+/g, "").replace(/[{}]/g, "").trim();

  const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    const words = text.split(" ");
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (doc.getTextWidth(testLine) > maxWidth && currentLine) { lines.push(currentLine); currentLine = word; }
      else currentLine = testLine;
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleDownloadPDF = () => {
    const questions = testState.questions;
    if (questions.length === 0) { toast.error("No questions to generate PDF"); return; }
    toast.info("Generating PDFs...", { duration: 2000 });
    const qDoc = new jsPDF();
    const pageWidth = qDoc.internal.pageSize.getWidth();
    const pageHeight = qDoc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;
    const typeName = testState.testType === "jee_main" ? "JEE Main Type" : "JEE Advanced Type";
    const title = `${typeName} Practice Test`;
    qDoc.setFontSize(16); qDoc.setFont("helvetica", "bold");
    qDoc.text(title, pageWidth / 2, y, { align: "center" }); y += 8;
    qDoc.setFontSize(9); qDoc.setFont("helvetica", "italic");
    qDoc.text("Practice questions curated for concept relevance and quality", pageWidth / 2, y, { align: "center" }); y += 6;
    qDoc.setFontSize(8);
    qDoc.text("Marking: +4 (Correct) / -1 (Incorrect) / 0 (Unattempted)", pageWidth / 2, y, { align: "center" }); y += 12;
    const subjects = ["physics", "chemistry", "mathematics"] as const;
    for (const subject of subjects) {
      const subjectQs = questions.filter(q => q.subject === subject);
      if (subjectQs.length === 0) continue;
      if (y > pageHeight - 40) { qDoc.addPage(); y = margin; }
      qDoc.setFillColor(240, 240, 240); qDoc.rect(margin, y - 5, contentWidth, 10, "F");
      qDoc.setFontSize(11); qDoc.setFont("helvetica", "bold");
      qDoc.text(`${subject.toUpperCase()} (${subjectQs.length} Questions)`, margin + 5, y + 2); y += 15;
      subjectQs.forEach((q, idx) => {
        const questionText = cleanLatex(q.question_text);
        const wrappedQuestion = wrapText(qDoc, `${idx + 1}. ${questionText}`, contentWidth - 10);
        const questionHeight = wrappedQuestion.length * 5 + (q.options ? q.options.length * 6 : 10) + 15;
        if (y + questionHeight > pageHeight - margin) { qDoc.addPage(); y = margin; }
        qDoc.setFontSize(9); qDoc.setFont("helvetica", "normal");
        wrappedQuestion.forEach(line => { qDoc.text(line, margin, y); y += 5; });
        if (q.options) {
          y += 2;
          q.options.forEach(opt => {
            const optText = cleanLatex(`(${opt.label}) ${opt.text}`);
            const wrappedOpt = wrapText(qDoc, optText, contentWidth - 20);
            wrappedOpt.forEach(line => { qDoc.text(line, margin + 10, y); y += 5; });
          });
        } else { qDoc.text("Answer: _____________", margin + 10, y); y += 5; }
        qDoc.setFontSize(7); qDoc.setTextColor(100, 100, 100);
        qDoc.text("[+4 / -1]", margin, y);
        qDoc.setTextColor(0, 0, 0); qDoc.setFontSize(9); y += 8;
      });
    }
    qDoc.save(`${typeName}_Practice_Questions.pdf`);

    const sDoc = new jsPDF(); y = margin;
    sDoc.setFontSize(16); sDoc.setFont("helvetica", "bold");
    sDoc.text(`${title} - Solutions`, pageWidth / 2, y, { align: "center" }); y += 12;
    for (const subject of subjects) {
      const subjectQs = questions.filter(q => q.subject === subject);
      if (subjectQs.length === 0) continue;
      if (y > pageHeight - 40) { sDoc.addPage(); y = margin; }
      sDoc.setFillColor(240, 240, 240); sDoc.rect(margin, y - 5, contentWidth, 10, "F");
      sDoc.setFontSize(11); sDoc.setFont("helvetica", "bold");
      sDoc.text(subject.toUpperCase(), margin + 5, y + 2); y += 15;
      subjectQs.forEach((q, idx) => {
        if (y > pageHeight - 50) { sDoc.addPage(); y = margin; }
        sDoc.setFontSize(9); sDoc.setFont("helvetica", "bold");
        sDoc.text(`Q${idx + 1}.`, margin, y);
        const answerText = Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : String(q.correct_answer);
        sDoc.setFillColor(232, 245, 233); sDoc.rect(margin + 15, y - 4, 40, 7, "F");
        sDoc.text(`Answer: ${answerText}`, margin + 17, y); y += 10;
        const solutionText = q.solution ? cleanLatex(q.solution) : "Solution not available for this question.";
        const wrappedSolution = wrapText(sDoc, solutionText, contentWidth - 20);
        sDoc.setFont("helvetica", "normal"); sDoc.setFontSize(8);
        wrappedSolution.forEach(line => {
          if (y > pageHeight - margin) { sDoc.addPage(); y = margin; }
          sDoc.text(line, margin + 5, y); y += 4;
        });
        y += 10;
      });
    }
    sDoc.save(`${typeName}_Practice_Solutions.pdf`);
    toast.success("PDFs downloaded successfully!");
  };

  const goToStep = (s: number) => { setStep(s); window.scrollTo({ top: 0, behavior: "instant" }); };

  const handleStep2Continue = () => {
    if (testState.selectedSubjects.length === 0) return;
    if (isCustomMode) goToStep(3);
    else { testState.selectAllTopics(); goToStep(4); }
  };

  const renderStepIndicator = () => (
    <div className="mx-auto mb-10 max-w-2xl">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s, idx) => {
          const actualStep = isCustomMode ? s : (s >= 3 ? 4 : s);
          const isBefore = isCustomMode ? s < step : (actualStep < step);
          const isCurrent = isCustomMode ? s === step : (actualStep === step);
          const clickable = isBefore;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && goToStep(actualStep)}
                className={`group relative flex flex-col items-center gap-2 ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <span className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  isCurrent ? "bg-foreground text-background shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]"
                  : isBefore ? "bg-primary/15 text-primary border border-primary/30 group-hover:bg-primary/25"
                  : "bg-surface-2/60 text-muted-foreground border border-border/40"
                }`}>
                  {isBefore ? <CheckCircle2 className="h-4 w-4" /> : s}
                </span>
                <span className={`hidden sm:block text-[10px] uppercase tracking-[0.18em] ${
                  isCurrent ? "text-foreground font-semibold" : "text-muted-foreground/70"
                }`}>{stepLabels[idx]}</span>
              </button>
              {s < totalSteps && (
                <div className="flex-1 mx-2 h-px bg-border/40 relative -mt-5">
                  <div className={`absolute inset-y-0 left-0 bg-primary transition-all duration-500 ${isBefore ? "w-full" : "w-0"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (testState.isLoading) {
    return (
      <section className="relative py-24 min-h-[calc(100vh-200px)] overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[140px]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-md mx-auto text-center space-y-6 animate-fade-in">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-card/60 backdrop-blur-xl border border-border/40 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Compiling</p>
              <h2 className="font-display text-3xl font-bold italic tracking-tight">Building your paper.</h2>
              <p className="text-sm text-muted-foreground mt-2">Hand-picking questions across the chosen syllabus.</p>
            </div>
            <div className="rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 p-4">
              <Progress value={testState.loadingProgress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-2 font-mono">{testState.loadingProgress}% complete</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 md:py-16 min-h-[calc(100vh-200px)] overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="container mx-auto px-4 relative">
        {/* Editorial Hero */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-14">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2/60 backdrop-blur border border-border/40 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              <Target className="h-3 w-3 text-primary" /> Practice Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2/60 backdrop-blur border border-border/40 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              <Sparkles className="h-3 w-3 text-accent" /> Curated Questions
            </span>
          </div>
          <h1 className="text-center font-display text-4xl md:text-6xl font-bold tracking-tight leading-[0.95]">
            <span className="italic">Practice</span>
            <span className="text-muted-foreground/60"> like the </span>
            <span className="italic">real exam</span>
            <span className="text-foreground">.</span>
          </h1>
          <p className="text-center text-muted-foreground/80 max-w-xl mx-auto mt-5 text-sm md:text-base leading-relaxed">
            Quality questions curated for concept relevance and difficulty matching. Every test you generate feels distinctly fresh.
          </p>
        </div>

        {renderStepIndicator()}

        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <GlassPanel step="01" title="Choose your battlefield" description="Pick the difficulty and pattern that mirrors your target exam.">
              <RadioGroup value={testState.testType} onValueChange={(v) => testState.setTestType(v as TestType)} className="grid md:grid-cols-2 gap-4">
                <TestTypeCard value="jee_main" active={testState.testType === "jee_main"} icon={<Zap className="h-5 w-5" />}
                  title="JEE Main Type" tagline="Moderate difficulty"
                  bullets={["Single correct MCQs + Numerical", "Application-based, time-friendly"]} />
                <TestTypeCard value="jee_advanced" active={testState.testType === "jee_advanced"} icon={<Target className="h-5 w-5" />}
                  title="JEE Advanced Type" tagline="Deep reasoning" badge="Harder"
                  bullets={["Multi-concept · Multi-correct + Numerical", "Requires combining ideas"]} />
              </RadioGroup>
              <FooterNav>
                <span />
                <Button onClick={() => goToStep(2)} className="gap-2 rounded-xl">Continue <ChevronRight className="h-4 w-4" /></Button>
              </FooterNav>
            </GlassPanel>
          )}

          {step === 2 && (
            <GlassPanel step="02" title="Define the scope" description="Lock the syllabus level and the subjects to be drawn from.">
              <div className="space-y-7">
                <div>
                  <SectionLabel>Syllabus Level</SectionLabel>
                  <RadioGroup value={testState.syllabusLevel} onValueChange={(v) => testState.setSyllabusLevel(v as SyllabusLevel)} className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { value: "11", label: "Class 11 Only", icon: GraduationCap },
                      { value: "12", label: "Class 12 Only", icon: GraduationCap },
                      { value: "both", label: "Class 11 + 12", icon: Layers },
                      { value: "custom", label: "Custom", icon: Target },
                    ].map(({ value, label, icon: Icon }) => (
                      <Label key={value} htmlFor={`syl-${value}`}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-300 text-center backdrop-blur ${
                          testState.syllabusLevel === value
                            ? "border-primary/50 bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                            : "border-border/40 bg-surface-2/40 hover:border-primary/30 hover:bg-surface-2/70"
                        }`}>
                        <RadioGroupItem value={value} id={`syl-${value}`} className="sr-only" />
                        <Icon className={`h-5 w-5 transition-colors ${testState.syllabusLevel === value ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-[11px] font-medium tracking-wide">{label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel className="mb-0">Select Subject(s)</SectionLabel>
                    <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-[0.15em] h-7"
                      onClick={() => {
                        const all: ("physics" | "chemistry" | "mathematics")[] = ["physics", "chemistry", "mathematics"];
                        const allSelected = all.every(s => testState.selectedSubjects.includes(s));
                        if (allSelected) all.forEach(s => testState.selectedSubjects.includes(s) && testState.toggleSubject(s));
                        else all.forEach(s => !testState.selectedSubjects.includes(s) && testState.toggleSubject(s));
                      }}>
                      {["physics", "chemistry", "mathematics"].every(s => testState.selectedSubjects.includes(s as any))
                        ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {([
                      { key: "physics", label: "Physics", icon: Atom },
                      { key: "chemistry", label: "Chemistry", icon: FlaskConical },
                      { key: "mathematics", label: "Mathematics", icon: Sigma },
                    ] as const).map(({ key, label, icon: Icon }) => {
                      const active = testState.selectedSubjects.includes(key);
                      return (
                        <button key={key} onClick={() => testState.toggleSubject(key)}
                          className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border backdrop-blur transition-all duration-300 ${
                            active ? "border-primary/50 bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                            : "border-border/40 bg-surface-2/40 hover:border-primary/30 hover:bg-surface-2/70"
                          }`}>
                          <Icon className={`h-5 w-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                          {active && <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mt-3 tracking-wide">
                    {testState.selectedSubjects.length} of 3 subjects selected
                  </p>
                </div>
              </div>
              <FooterNav>
                <Button variant="outline" onClick={() => goToStep(1)} className="rounded-xl gap-2"><ChevronLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={handleStep2Continue} className="gap-2 rounded-xl" disabled={testState.selectedSubjects.length === 0}>
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </FooterNav>
            </GlassPanel>
          )}

          {step === 3 && isCustomMode && (
            <GlassPanel step="03" title="Hand-pick the topics" description="Only the chapters you tick will appear in this paper.">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <SectionLabel className="mb-0">Available Chapters</SectionLabel>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={testState.selectAllTopics} className="text-[10px] uppercase tracking-[0.15em] h-7">Select All</Button>
                    <Button variant="ghost" size="sm" onClick={testState.clearTopics} className="text-[10px] uppercase tracking-[0.15em] h-7">Clear</Button>
                  </div>
                </div>
                <ScrollArea className="h-72 rounded-2xl border border-border/40 bg-surface-2/30 backdrop-blur p-2">
                  <div className="space-y-1">
                    {testState.getAvailableTopics().map(topic => {
                      const active = testState.selectedTopics.includes(topic.name);
                      return (
                        <Label key={topic.name}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                            active ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-card/60"
                          }`}>
                          <Checkbox checked={active} onCheckedChange={() => testState.toggleTopic(topic.name)} />
                          <span className={`text-sm flex-1 ${active ? "text-foreground" : "text-muted-foreground"}`}>{topic.name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono border-border/40">Class {topic.classLevel}</Badge>
                        </Label>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 px-1">
                  <span>{testState.selectedTopics.length} topic{testState.selectedTopics.length === 1 ? "" : "s"} selected</span>
                  <span className="font-mono">{testState.getAvailableTopics().length} available</span>
                </div>
              </div>
              <FooterNav>
                <Button variant="outline" onClick={() => goToStep(2)} className="rounded-xl gap-2"><ChevronLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={() => goToStep(4)} className="gap-2 rounded-xl" disabled={testState.selectedTopics.length === 0}>
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </FooterNav>
            </GlassPanel>
          )}

          {step === 4 && (
            <GlassPanel step={String(totalSteps).padStart(2, "0")} title="Pick how you'll attempt" description="Live CBT simulator or printable PDF — same questions, your call.">
              <RadioGroup value={testState.attemptMode} onValueChange={(v) => testState.setAttemptMode(v as AttemptMode)} className="grid md:grid-cols-2 gap-4">
                <AttemptModeCard value="online" active={testState.attemptMode === "online"} icon={<Play className="h-5 w-5" />}
                  title="Online CBT" description="Simulated test environment with timer, palette, and mark-for-review."
                  meta={[{ icon: <Clock className="h-3 w-3" />, label: "Timed" }, { icon: <Target className="h-3 w-3" />, label: "Auto-graded" }]} />
                <AttemptModeCard value="pdf" active={testState.attemptMode === "pdf"} icon={<Download className="h-5 w-5" />}
                  title="PDF Paper" description="Question paper and solutions, ready for offline pen-and-paper practice."
                  meta={[{ icon: <BookOpen className="h-3 w-3" />, label: "Question PDF" }, { icon: <BookOpen className="h-3 w-3" />, label: "Solution PDF" }]} />
              </RadioGroup>

              <div className="mt-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border/30 bg-surface-2/40 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Test Summary</span>
                  <span className="text-[10px] font-mono text-muted-foreground">PRESET LOCKED</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/30">
                  <SummaryCell label="Type" value={testState.testType === "jee_main" ? "Main" : "Advanced"} />
                  <SummaryCell label="Syllabus" value={testState.syllabusLevel === "11" ? "Class 11" : testState.syllabusLevel === "12" ? "Class 12" : testState.syllabusLevel === "both" ? "11 + 12" : "Custom"} />
                  <SummaryCell label="Subjects" value={`${testState.selectedSubjects.length} of 3`} />
                  <SummaryCell label="Marking" value="+4 / −1 / 0" mono />
                </div>
              </div>

              {unavailableMessage && (
                <Alert variant="destructive" className="mt-4 rounded-2xl border-destructive/30 bg-destructive/5 animate-fade-in">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Not Enough Questions</AlertTitle>
                  <AlertDescription>{unavailableMessage}</AlertDescription>
                </Alert>
              )}

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border/40 bg-surface-2/30 backdrop-blur p-4">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground/90 leading-relaxed">
                  <span className="font-semibold text-foreground">Fixed marking.</span>{" "}
                  +4 for correct, −1 for incorrect, 0 for skipped. Numerical / Integer questions carry zero negative marking.
                </div>
              </div>

              <FooterNav>
                <Button variant="outline" onClick={() => { goToStep(isCustomMode ? 3 : 2); setUnavailableMessage(null); }} className="rounded-xl gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={testState.attemptMode === "pdf" ? handleGenerateWithPdf : handleGenerate}
                  className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 shadow-[0_8px_30px_-10px_hsl(var(--primary)/0.5)]" size="lg">
                  {testState.attemptMode === "online"
                    ? <><Play className="h-4 w-4" /> Start Test</>
                    : <><Download className="h-4 w-4" /> Generate PDFs</>}
                </Button>
              </FooterNav>
            </GlassPanel>
          )}

        </div>
      </div>
    </section>
  );
}

/* ---------- Local presentational helpers ---------- */

function GlassPanel({ step, title, description, children }: { step: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="relative animate-fade-in">
      <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl blur-2xl opacity-60" aria-hidden />
      <div className="relative rounded-3xl border border-border/40 bg-card/50 backdrop-blur-xl shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.25)] overflow-hidden">
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-border/30">
          <div className="flex items-start gap-4">
            <span className="font-mono text-[11px] tracking-[0.2em] text-primary mt-1.5">{step}</span>
            <div className="flex-1">
              <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="text-sm text-muted-foreground/80 mt-1">{description}</p>
            </div>
          </div>
        </div>
        <div className="px-6 md:px-8 py-6 md:py-7">{children}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-3 ${className}`}>{children}</p>;
}

function FooterNav({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/30">{children}</div>;
}

function TestTypeCard({ value, active, icon, title, tagline, badge, bullets }: {
  value: string; active: boolean; icon: React.ReactNode; title: string; tagline: string; badge?: string; bullets: string[];
}) {
  return (
    <Label htmlFor={value}
      className={`group relative flex flex-col gap-3 p-5 rounded-2xl border cursor-pointer transition-all duration-300 backdrop-blur ${
        active ? "border-primary/50 bg-primary/10 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.4)]"
        : "border-border/40 bg-surface-2/40 hover:border-primary/30 hover:bg-surface-2/70"
      }`}>
      <RadioGroupItem value={value} id={value} className="sr-only" />
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-foreground"}`}>{icon}</span>
        {badge && <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-semibold tracking-wider uppercase border border-accent/20">{badge}</span>}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-1">{tagline}</p>
        <p className="font-display font-semibold text-lg">{title}</p>
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {active && <div className="absolute top-3 right-3"><CheckCircle2 className="h-4 w-4 text-primary" /></div>}
    </Label>
  );
}

function AttemptModeCard({ value, active, icon, title, description, meta }: {
  value: string; active: boolean; icon: React.ReactNode; title: string; description: string;
  meta: { icon: React.ReactNode; label: string }[];
}) {
  return (
    <Label htmlFor={value}
      className={`group relative flex flex-col gap-3 p-5 rounded-2xl border cursor-pointer transition-all duration-300 backdrop-blur ${
        active ? "border-primary/50 bg-primary/10 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.4)]"
        : "border-border/40 bg-surface-2/40 hover:border-primary/30 hover:bg-surface-2/70"
      }`}>
      <RadioGroupItem value={value} id={value} className="sr-only" />
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-foreground"}`}>{icon}</span>
        <span className="font-display font-semibold text-lg">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="flex items-center gap-3 pt-1 mt-auto">
        {meta.map((m, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/80">
            {m.icon} {m.label}
          </span>
        ))}
      </div>
      {active && <div className="absolute top-3 right-3"><CheckCircle2 className="h-4 w-4 text-primary" /></div>}
    </Label>
  );
}

function SummaryCell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-4 py-3 first:pl-5 last:pr-5">
      <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
