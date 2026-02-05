 import { useState } from "react";
 import { 
   FileText, 
   Target, 
   Clock, 
   BookOpen, 
   Zap, 
   GraduationCap,
   ChevronRight,
   Loader2,
   Download,
   Play,
   CheckCircle,
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
     const success = await testBuilder.generateTest();
     if (success) {
       onStartTest();
     }
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
             Create authentic JEE Main & Advanced tests with AI-generated questions. 
             Practice online or download PDFs.
           </p>
         </div>
 
         <div className="max-w-5xl mx-auto space-y-8">
           {/* Step 1: Exam Type */}
           <Card className="border-border/50">
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
                     className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                       testBuilder.examType === type
                         ? "border-primary bg-primary/5"
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
           <Card className="border-border/50">
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
                     className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                       testBuilder.syllabusType === value
                         ? "border-primary bg-primary/5"
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
                 <div className="mt-6 border rounded-xl p-4">
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
                                       className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
           <Card className="border-border/50">
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
                   className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                     mode === "online"
                       ? "border-primary bg-primary/5"
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
                   className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                     mode === "pdf"
                       ? "border-primary bg-primary/5"
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
             <Button
               size="lg"
               onClick={handleGenerate}
               disabled={testBuilder.isGenerating || (testBuilder.syllabusType === "custom" && testBuilder.selectedChapters.length === 0)}
               className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 px-8"
             >
               {testBuilder.isGenerating ? (
                 <>
                   <Loader2 className="h-5 w-5 animate-spin" />
                   Generating Questions...
                 </>
               ) : (
                 <>
                   <Sparkles className="h-5 w-5" />
                   Generate {mode === "online" ? "& Start Test" : "& Download PDF"}
                   <ChevronRight className="h-4 w-4" />
                 </>
               )}
             </Button>
             
             <p className="text-xs text-muted-foreground flex items-center gap-1">
               <CheckCircle className="h-3 w-3" />
               AI-generated questions with detailed solutions
             </p>
           </div>
         </div>
       </div>
     </section>
   );
 }