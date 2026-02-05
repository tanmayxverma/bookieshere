 import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import { useAuth } from "@/hooks/useAuth";
 
 export type ExamType = "jee_main" | "jee_advanced";
 export type SyllabusType = "class_11" | "class_12" | "both" | "custom";
 
 export interface Chapter {
   id: string;
   name: string;
   subject: "physics" | "chemistry" | "mathematics";
 }
 
 export interface QuestionData {
   id: string;
   question_number: number;
   subject: "physics" | "chemistry" | "mathematics" | "combined";
   chapter: string | null;
   question_type: string;
   question_text: string;
   options: { label: string; text: string }[] | null;
   correct_answer: any;
   user_answer: any;
   is_marked_for_review: boolean;
   is_answered: boolean;
   marks_positive: number;
   marks_negative: number;
   partial_marking: boolean;
   solution: string | null;
   diagram_url: string | null;
 }
 
 export interface TestData {
   id: string;
   exam_type: ExamType;
   syllabus: any;
   status: string;
   total_questions: number;
   total_marks: number;
   duration_minutes: number;
   started_at: string | null;
   completed_at: string | null;
   score: number | null;
   correct_count: number | null;
   incorrect_count: number | null;
   unattempted_count: number | null;
 }
 
 export interface TestBuilderState {
   examType: ExamType;
   syllabusType: SyllabusType;
   selectedChapters: Chapter[];
   isGenerating: boolean;
   currentTest: TestData | null;
   questions: QuestionData[];
   currentQuestionIndex: number;
   timeRemaining: number;
   isSubmitting: boolean;
  generationProgress: {
    completed: number;
    total: number;
    message: string;
    questionsGenerated: number;
  } | null;
 }
 
 // JEE Chapters by class and subject
 export const JEE_CHAPTERS: Record<string, Chapter[]> = {
   physics_11: [
     { id: "ph11_1", name: "Units and Measurements", subject: "physics" },
     { id: "ph11_2", name: "Motion in a Straight Line", subject: "physics" },
     { id: "ph11_3", name: "Motion in a Plane", subject: "physics" },
     { id: "ph11_4", name: "Laws of Motion", subject: "physics" },
     { id: "ph11_5", name: "Work, Energy and Power", subject: "physics" },
     { id: "ph11_6", name: "System of Particles and Rotational Motion", subject: "physics" },
     { id: "ph11_7", name: "Gravitation", subject: "physics" },
     { id: "ph11_8", name: "Mechanical Properties of Solids", subject: "physics" },
     { id: "ph11_9", name: "Mechanical Properties of Fluids", subject: "physics" },
     { id: "ph11_10", name: "Thermal Properties of Matter", subject: "physics" },
     { id: "ph11_11", name: "Thermodynamics", subject: "physics" },
     { id: "ph11_12", name: "Kinetic Theory", subject: "physics" },
     { id: "ph11_13", name: "Oscillations", subject: "physics" },
     { id: "ph11_14", name: "Waves", subject: "physics" },
   ],
   physics_12: [
     { id: "ph12_1", name: "Electric Charges and Fields", subject: "physics" },
     { id: "ph12_2", name: "Electrostatic Potential and Capacitance", subject: "physics" },
     { id: "ph12_3", name: "Current Electricity", subject: "physics" },
     { id: "ph12_4", name: "Moving Charges and Magnetism", subject: "physics" },
     { id: "ph12_5", name: "Magnetism and Matter", subject: "physics" },
     { id: "ph12_6", name: "Electromagnetic Induction", subject: "physics" },
     { id: "ph12_7", name: "Alternating Current", subject: "physics" },
     { id: "ph12_8", name: "Electromagnetic Waves", subject: "physics" },
     { id: "ph12_9", name: "Ray Optics and Optical Instruments", subject: "physics" },
     { id: "ph12_10", name: "Wave Optics", subject: "physics" },
     { id: "ph12_11", name: "Dual Nature of Radiation and Matter", subject: "physics" },
     { id: "ph12_12", name: "Atoms", subject: "physics" },
     { id: "ph12_13", name: "Nuclei", subject: "physics" },
     { id: "ph12_14", name: "Semiconductor Electronics", subject: "physics" },
   ],
   chemistry_11: [
     { id: "ch11_1", name: "Some Basic Concepts of Chemistry", subject: "chemistry" },
     { id: "ch11_2", name: "Structure of Atom", subject: "chemistry" },
     { id: "ch11_3", name: "Classification of Elements", subject: "chemistry" },
     { id: "ch11_4", name: "Chemical Bonding and Molecular Structure", subject: "chemistry" },
     { id: "ch11_5", name: "States of Matter", subject: "chemistry" },
     { id: "ch11_6", name: "Thermodynamics", subject: "chemistry" },
     { id: "ch11_7", name: "Equilibrium", subject: "chemistry" },
     { id: "ch11_8", name: "Redox Reactions", subject: "chemistry" },
     { id: "ch11_9", name: "Hydrogen", subject: "chemistry" },
     { id: "ch11_10", name: "s-Block Elements", subject: "chemistry" },
     { id: "ch11_11", name: "p-Block Elements (Group 13-14)", subject: "chemistry" },
     { id: "ch11_12", name: "Organic Chemistry Basic Principles", subject: "chemistry" },
     { id: "ch11_13", name: "Hydrocarbons", subject: "chemistry" },
     { id: "ch11_14", name: "Environmental Chemistry", subject: "chemistry" },
   ],
   chemistry_12: [
     { id: "ch12_1", name: "Solid State", subject: "chemistry" },
     { id: "ch12_2", name: "Solutions", subject: "chemistry" },
     { id: "ch12_3", name: "Electrochemistry", subject: "chemistry" },
     { id: "ch12_4", name: "Chemical Kinetics", subject: "chemistry" },
     { id: "ch12_5", name: "Surface Chemistry", subject: "chemistry" },
     { id: "ch12_6", name: "General Principles of Isolation", subject: "chemistry" },
     { id: "ch12_7", name: "p-Block Elements", subject: "chemistry" },
     { id: "ch12_8", name: "d and f Block Elements", subject: "chemistry" },
     { id: "ch12_9", name: "Coordination Compounds", subject: "chemistry" },
     { id: "ch12_10", name: "Haloalkanes and Haloarenes", subject: "chemistry" },
     { id: "ch12_11", name: "Alcohols, Phenols and Ethers", subject: "chemistry" },
     { id: "ch12_12", name: "Aldehydes, Ketones and Carboxylic Acids", subject: "chemistry" },
     { id: "ch12_13", name: "Amines", subject: "chemistry" },
     { id: "ch12_14", name: "Biomolecules", subject: "chemistry" },
     { id: "ch12_15", name: "Polymers", subject: "chemistry" },
     { id: "ch12_16", name: "Chemistry in Everyday Life", subject: "chemistry" },
   ],
   mathematics_11: [
     { id: "ma11_1", name: "Sets", subject: "mathematics" },
     { id: "ma11_2", name: "Relations and Functions", subject: "mathematics" },
     { id: "ma11_3", name: "Trigonometric Functions", subject: "mathematics" },
     { id: "ma11_4", name: "Principle of Mathematical Induction", subject: "mathematics" },
     { id: "ma11_5", name: "Complex Numbers and Quadratic Equations", subject: "mathematics" },
     { id: "ma11_6", name: "Linear Inequalities", subject: "mathematics" },
     { id: "ma11_7", name: "Permutations and Combinations", subject: "mathematics" },
     { id: "ma11_8", name: "Binomial Theorem", subject: "mathematics" },
     { id: "ma11_9", name: "Sequences and Series", subject: "mathematics" },
     { id: "ma11_10", name: "Straight Lines", subject: "mathematics" },
     { id: "ma11_11", name: "Conic Sections", subject: "mathematics" },
     { id: "ma11_12", name: "Introduction to Three Dimensional Geometry", subject: "mathematics" },
     { id: "ma11_13", name: "Limits and Derivatives", subject: "mathematics" },
     { id: "ma11_14", name: "Mathematical Reasoning", subject: "mathematics" },
     { id: "ma11_15", name: "Statistics", subject: "mathematics" },
     { id: "ma11_16", name: "Probability", subject: "mathematics" },
   ],
   mathematics_12: [
     { id: "ma12_1", name: "Relations and Functions", subject: "mathematics" },
     { id: "ma12_2", name: "Inverse Trigonometric Functions", subject: "mathematics" },
     { id: "ma12_3", name: "Matrices", subject: "mathematics" },
     { id: "ma12_4", name: "Determinants", subject: "mathematics" },
     { id: "ma12_5", name: "Continuity and Differentiability", subject: "mathematics" },
     { id: "ma12_6", name: "Application of Derivatives", subject: "mathematics" },
     { id: "ma12_7", name: "Integrals", subject: "mathematics" },
     { id: "ma12_8", name: "Application of Integrals", subject: "mathematics" },
     { id: "ma12_9", name: "Differential Equations", subject: "mathematics" },
     { id: "ma12_10", name: "Vector Algebra", subject: "mathematics" },
     { id: "ma12_11", name: "Three Dimensional Geometry", subject: "mathematics" },
     { id: "ma12_12", name: "Linear Programming", subject: "mathematics" },
     { id: "ma12_13", name: "Probability", subject: "mathematics" },
   ],
 };
 
 export function useTestBuilder() {
   const { toast } = useToast();
   const { user } = useAuth();
   
   const [state, setState] = useState<TestBuilderState>({
     examType: "jee_main",
     syllabusType: "both",
     selectedChapters: [],
     isGenerating: false,
     currentTest: null,
     questions: [],
     currentQuestionIndex: 0,
     timeRemaining: 180 * 60,
     isSubmitting: false,
    generationProgress: null,
   });
 
   const setExamType = useCallback((type: ExamType) => {
     setState(prev => ({ ...prev, examType: type }));
   }, []);
 
   const setSyllabusType = useCallback((type: SyllabusType) => {
     setState(prev => ({ ...prev, syllabusType: type }));
   }, []);
 
   const toggleChapter = useCallback((chapter: Chapter) => {
     setState(prev => {
       const exists = prev.selectedChapters.some(c => c.id === chapter.id);
       return {
         ...prev,
         selectedChapters: exists
           ? prev.selectedChapters.filter(c => c.id !== chapter.id)
           : [...prev.selectedChapters, chapter],
       };
     });
   }, []);
 
   const selectAllChapters = useCallback((chapters: Chapter[]) => {
     setState(prev => ({ ...prev, selectedChapters: chapters }));
   }, []);
 
   const clearChapters = useCallback(() => {
     setState(prev => ({ ...prev, selectedChapters: [] }));
   }, []);
 
   const getChaptersForSyllabus = useCallback(() => {
     const all: Chapter[] = [];
     if (state.syllabusType === "class_11" || state.syllabusType === "both" || state.syllabusType === "custom") {
       all.push(...JEE_CHAPTERS.physics_11, ...JEE_CHAPTERS.chemistry_11, ...JEE_CHAPTERS.mathematics_11);
     }
     if (state.syllabusType === "class_12" || state.syllabusType === "both" || state.syllabusType === "custom") {
       all.push(...JEE_CHAPTERS.physics_12, ...JEE_CHAPTERS.chemistry_12, ...JEE_CHAPTERS.mathematics_12);
     }
     return all;
   }, [state.syllabusType]);
 
   const generateTest = useCallback(async () => {
     setState(prev => ({ ...prev, isGenerating: true }));
    setState(prev => ({ ...prev, generationProgress: { completed: 0, total: 0, message: "Initializing...", questionsGenerated: 0 } }));
     
     try {
       const chapters = state.syllabusType === "custom" 
         ? state.selectedChapters 
         : getChaptersForSyllabus();
       
       if (chapters.length === 0) {
         toast({ variant: "destructive", title: "Please select at least one chapter" });
         setState(prev => ({ ...prev, isGenerating: false }));
         return;
       }
 
      // Use streaming for progress updates
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          examType: state.examType,
          syllabusType: state.syllabusType,
          chapters: chapters.map(c => ({ name: c.name, subject: c.subject })),
          userId: user?.id || null,
          stream: true,
        }),
       });
 
      if (!response.ok || !response.body) {
        throw new Error("Failed to start test generation");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData: { test: any; questions: any[] } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            
            if (event.type === "progress" || event.type === "start" || event.type === "saving") {
              setState(prev => ({
                ...prev,
                generationProgress: {
                  completed: event.completed || 0,
                  total: event.total || 0,
                  message: event.message || "",
                  questionsGenerated: event.questionsGenerated || 0,
                },
              }));
            } else if (event.type === "complete") {
              finalData = { test: event.test, questions: event.questions };
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch (parseErr) {
            // Skip invalid JSON
          }
        }
      }

      if (!finalData) {
        throw new Error("No response received from server");
      }
 
       setState(prev => ({
         ...prev,
         isGenerating: false,
        generationProgress: null,
        currentTest: finalData!.test,
        questions: finalData!.questions,
        timeRemaining: finalData!.test.duration_minutes * 60,
       }));
 
      toast({ title: "Test generated!", description: `${finalData.questions.length} questions ready` });
       return true;
     } catch (error: any) {
       console.error("Generate test error:", error);
       toast({ 
         variant: "destructive", 
         title: "Failed to generate test",
         description: error.message || "Please try again"
       });
      setState(prev => ({ ...prev, isGenerating: false, generationProgress: null }));
       return false;
     }
   }, [state.examType, state.syllabusType, state.selectedChapters, getChaptersForSyllabus, user, toast]);
 
   const setCurrentQuestion = useCallback((index: number) => {
     setState(prev => ({ ...prev, currentQuestionIndex: index }));
   }, []);
 
   const answerQuestion = useCallback((answer: any) => {
     setState(prev => {
       const newQuestions = [...prev.questions];
       newQuestions[prev.currentQuestionIndex] = {
         ...newQuestions[prev.currentQuestionIndex],
         user_answer: answer,
         is_answered: answer !== null && answer !== undefined && 
           (Array.isArray(answer) ? answer.length > 0 : String(answer).length > 0),
       };
       return { ...prev, questions: newQuestions };
     });
   }, []);
 
   const toggleMarkForReview = useCallback(() => {
     setState(prev => {
       const newQuestions = [...prev.questions];
       newQuestions[prev.currentQuestionIndex] = {
         ...newQuestions[prev.currentQuestionIndex],
         is_marked_for_review: !newQuestions[prev.currentQuestionIndex].is_marked_for_review,
       };
       return { ...prev, questions: newQuestions };
     });
   }, []);
 
   const clearResponse = useCallback(() => {
     setState(prev => {
       const newQuestions = [...prev.questions];
       newQuestions[prev.currentQuestionIndex] = {
         ...newQuestions[prev.currentQuestionIndex],
         user_answer: null,
         is_answered: false,
       };
       return { ...prev, questions: newQuestions };
     });
   }, []);
 
   const setTimeRemaining = useCallback((time: number) => {
     setState(prev => ({ ...prev, timeRemaining: time }));
   }, []);
 
   const submitTest = useCallback(async () => {
     if (!state.currentTest) return;
     
     setState(prev => ({ ...prev, isSubmitting: true }));
 
     try {
       const { data, error } = await supabase.functions.invoke("submit-test", {
         body: {
           testId: state.currentTest.id,
           answers: state.questions.map(q => ({
             questionId: q.id,
             userAnswer: q.user_answer,
           })),
         },
       });
 
       if (error) throw error;
 
       setState(prev => ({
         ...prev,
         isSubmitting: false,
         currentTest: data.test,
         questions: data.questions,
       }));
 
       toast({ title: "Test submitted!", description: `Score: ${data.test.score}/${data.test.total_marks}` });
       return true;
     } catch (error: any) {
       console.error("Submit test error:", error);
       toast({ variant: "destructive", title: "Failed to submit test" });
       setState(prev => ({ ...prev, isSubmitting: false }));
       return false;
     }
   }, [state.currentTest, state.questions, toast]);
 
   const resetTest = useCallback(() => {
     setState({
       examType: "jee_main",
       syllabusType: "both",
       selectedChapters: [],
       isGenerating: false,
       currentTest: null,
       questions: [],
       currentQuestionIndex: 0,
       timeRemaining: 180 * 60,
       isSubmitting: false,
      generationProgress: null,
     });
   }, []);
 
   return {
     ...state,
     setExamType,
     setSyllabusType,
     toggleChapter,
     selectAllChapters,
     clearChapters,
     getChaptersForSyllabus,
     generateTest,
     setCurrentQuestion,
     answerQuestion,
     toggleMarkForReview,
     clearResponse,
     setTimeRemaining,
     submitTest,
     resetTest,
   };
 }