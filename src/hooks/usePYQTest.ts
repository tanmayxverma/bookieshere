import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  PYQ_BANK, 
  PYQQuestion, 
  JEE_MAIN_YEARS, 
  JEE_MAIN_SHIFTS,
  JEE_ADVANCED_YEARS,
  JEE_ADVANCED_PAPERS,
  TOPICS_BY_SUBJECT,
  getPYQs
} from "@/data/pyqBank";

export type ExamType = "jee_main" | "jee_advanced";
export type TestMode = "year_wise" | "topic_wise";
export type ClassLevel = "11" | "12" | "custom";
export type AttemptMode = "online" | "pdf";

export interface PYQTestState {
  // Configuration
  examType: ExamType;
  testMode: TestMode;
  attemptMode: AttemptMode;
  
  // Year-wise config
  selectedYear: number | null;
  selectedShift: string | null; // For JEE Main
  selectedPaper: number | null; // For JEE Advanced
  
  // Topic-wise config
  classLevel: ClassLevel;
  selectedSubject: "physics" | "chemistry" | "mathematics" | null;
  selectedTopics: string[];
  
  // Test state
  isLoading: boolean;
  loadingProgress: number;
  questions: PYQQuestion[];
  currentQuestionIndex: number;
  userAnswers: Record<string, any>;
  markedForReview: Set<string>;
  timeRemaining: number;
  testStarted: boolean;
  testSubmitted: boolean;
  
  // Results
  score: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
}

export function usePYQTest() {
  const [state, setState] = useState<PYQTestState>({
    examType: "jee_main",
    testMode: "year_wise",
    attemptMode: "online",
    selectedYear: null,
    selectedShift: null,
    selectedPaper: null,
    classLevel: "12",
    selectedSubject: null,
    selectedTopics: [],
    isLoading: false,
    loadingProgress: 0,
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    markedForReview: new Set(),
    timeRemaining: 180 * 60, // 3 hours default
    testStarted: false,
    testSubmitted: false,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    unattemptedCount: 0,
  });

  // Configuration setters
  const setExamType = useCallback((type: ExamType) => {
    setState(prev => ({
      ...prev,
      examType: type,
      selectedYear: null,
      selectedShift: null,
      selectedPaper: null,
      selectedSubject: null,
      selectedTopics: [],
    }));
  }, []);

  const setTestMode = useCallback((mode: TestMode) => {
    setState(prev => ({
      ...prev,
      testMode: mode,
      selectedYear: null,
      selectedShift: null,
      selectedPaper: null,
      selectedSubject: null,
      selectedTopics: [],
    }));
  }, []);

  const setAttemptMode = useCallback((mode: AttemptMode) => {
    setState(prev => ({ ...prev, attemptMode: mode }));
  }, []);

  const setSelectedYear = useCallback((year: number) => {
    setState(prev => ({ ...prev, selectedYear: year, selectedShift: null, selectedPaper: null }));
  }, []);

  const setSelectedShift = useCallback((shift: string) => {
    setState(prev => ({ ...prev, selectedShift: shift }));
  }, []);

  const setSelectedPaper = useCallback((paper: number) => {
    setState(prev => ({ ...prev, selectedPaper: paper }));
  }, []);

  const setClassLevel = useCallback((level: ClassLevel) => {
    setState(prev => ({ ...prev, classLevel: level, selectedTopics: [] }));
  }, []);

  const setSelectedSubject = useCallback((subject: "physics" | "chemistry" | "mathematics") => {
    setState(prev => ({ ...prev, selectedSubject: subject, selectedTopics: [] }));
  }, []);

  const toggleTopic = useCallback((topic: string) => {
    setState(prev => {
      const newTopics = prev.selectedTopics.includes(topic)
        ? prev.selectedTopics.filter(t => t !== topic)
        : [...prev.selectedTopics, topic];
      return { ...prev, selectedTopics: newTopics };
    });
  }, []);

  const selectAllTopics = useCallback(() => {
    setState(prev => {
      if (!prev.selectedSubject) return prev;
      const topics = TOPICS_BY_SUBJECT[prev.selectedSubject] || [];
      let filteredTopics = topics;
      
      if (prev.classLevel === "11") {
        filteredTopics = topics.filter(t => t.classLevel === "11");
      } else if (prev.classLevel === "12") {
        filteredTopics = topics.filter(t => t.classLevel === "12");
      }
      
      return { ...prev, selectedTopics: filteredTopics.map(t => t.name) };
    });
  }, []);

  const clearTopics = useCallback(() => {
    setState(prev => ({ ...prev, selectedTopics: [] }));
  }, []);

  // Get available topics based on class level
  const getAvailableTopics = useCallback(() => {
    if (!state.selectedSubject) return [];
    const topics = TOPICS_BY_SUBJECT[state.selectedSubject] || [];
    
    if (state.classLevel === "11") {
      return topics.filter(t => t.classLevel === "11");
    } else if (state.classLevel === "12") {
      return topics.filter(t => t.classLevel === "12");
    }
    return topics; // For custom, show all
  }, [state.selectedSubject, state.classLevel]);

  // Check if configuration is valid
  const isConfigValid = useCallback(() => {
    if (state.testMode === "year_wise") {
      if (!state.selectedYear) return false;
      if (state.examType === "jee_main" && !state.selectedShift) return false;
      if (state.examType === "jee_advanced" && !state.selectedPaper) return false;
      return true;
    } else {
      // Topic-wise
      if (!state.selectedSubject) return false;
      if (state.selectedTopics.length === 0) return false;
      return true;
    }
  }, [state.testMode, state.selectedYear, state.selectedShift, state.selectedPaper, state.examType, state.selectedSubject, state.selectedTopics]);

  // Load questions with fake loading for better UX
  const loadQuestions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, loadingProgress: 0 }));

    // Simulate controlled loading for better UX
    const progressSteps = [5, 10, 15, 25, 40, 60, 80, 95, 100];
    
    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i < 2 ? 300 : 100));
      setState(prev => ({ ...prev, loadingProgress: progressSteps[i] }));
    }

    let questions: PYQQuestion[] = [];

    if (state.testMode === "year_wise") {
      questions = getPYQs({
        examType: state.examType,
        year: state.selectedYear!,
        shift: state.selectedShift || undefined,
        paper: state.selectedPaper || undefined,
      });
    } else {
      // Topic-wise - filter by class level
      if (state.classLevel === "custom") {
        questions = getPYQs({
          examType: state.examType,
          subject: state.selectedSubject!,
          topics: state.selectedTopics,
        });
      } else {
        questions = getPYQs({
          examType: state.examType,
          subject: state.selectedSubject!,
          classLevel: state.classLevel,
          topics: state.selectedTopics,
        });
      }
    }

    // If no questions found, show all questions for the exam type as fallback
    if (questions.length === 0) {
      questions = PYQ_BANK.filter(q => q.examType === state.examType);
      if (questions.length === 0) {
        questions = PYQ_BANK; // Ultimate fallback
      }
    }

    // Shuffle questions for variety
    questions = questions.sort(() => Math.random() - 0.5);

    // Set duration based on exam type
    const duration = state.examType === "jee_main" ? 180 * 60 : 180 * 60; // 3 hours

    setState(prev => ({
      ...prev,
      isLoading: false,
      loadingProgress: 100,
      questions,
      timeRemaining: duration,
      testStarted: state.attemptMode === "online",
      userAnswers: {},
      markedForReview: new Set(),
      currentQuestionIndex: 0,
    }));

    return questions.length > 0;
  }, [state.testMode, state.examType, state.selectedYear, state.selectedShift, state.selectedPaper, state.classLevel, state.selectedSubject, state.selectedTopics, state.attemptMode]);

  // Answer a question
  const answerQuestion = useCallback((answer: any) => {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;

    setState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [currentQ.id]: answer,
      },
    }));
  }, [state.questions, state.currentQuestionIndex]);

  // Toggle mark for review
  const toggleMarkForReview = useCallback(() => {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;

    setState(prev => {
      const newMarked = new Set(prev.markedForReview);
      if (newMarked.has(currentQ.id)) {
        newMarked.delete(currentQ.id);
      } else {
        newMarked.add(currentQ.id);
      }
      return { ...prev, markedForReview: newMarked };
    });
  }, [state.questions, state.currentQuestionIndex]);

  // Clear response
  const clearResponse = useCallback(() => {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;

    setState(prev => {
      const newAnswers = { ...prev.userAnswers };
      delete newAnswers[currentQ.id];
      return { ...prev, userAnswers: newAnswers };
    });
  }, [state.questions, state.currentQuestionIndex]);

  // Set current question
  const setCurrentQuestion = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentQuestionIndex: index }));
  }, []);

  // Update time remaining
  const setTimeRemaining = useCallback((time: number) => {
    setState(prev => ({ ...prev, timeRemaining: time }));
  }, []);

  // Calculate score
  const calculateScore = useCallback(() => {
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    state.questions.forEach(q => {
      const userAnswer = state.userAnswers[q.id];
      
      if (userAnswer === undefined || userAnswer === null || 
          (Array.isArray(userAnswer) && userAnswer.length === 0) ||
          (typeof userAnswer === "string" && userAnswer.trim() === "")) {
        unattempted++;
        return;
      }

      let isCorrect = false;

      if (q.question_type === "single_correct") {
        isCorrect = userAnswer === q.correct_answer;
      } else if (q.question_type === "multi_correct") {
        const correctArr = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer];
        const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        isCorrect = correctArr.length === userArr.length && 
                   correctArr.every(a => userArr.includes(a));
      } else if (q.question_type === "numerical" || q.question_type === "integer") {
        const userNum = parseFloat(userAnswer);
        const correctNum = typeof q.correct_answer === "number" ? q.correct_answer : parseFloat(q.correct_answer as string);
        isCorrect = Math.abs(userNum - correctNum) < 0.01;
      }

      if (isCorrect) {
        score += q.marks_positive;
        correct++;
      } else {
        score -= q.marks_negative;
        incorrect++;
      }
    });

    return { score, correct, incorrect, unattempted };
  }, [state.questions, state.userAnswers]);

  // Submit test
  const submitTest = useCallback(() => {
    const results = calculateScore();
    
    setState(prev => ({
      ...prev,
      testSubmitted: true,
      testStarted: false,
      score: results.score,
      correctCount: results.correct,
      incorrectCount: results.incorrect,
      unattemptedCount: results.unattempted,
    }));

    toast.success(`Test submitted! Score: ${results.score}/${state.questions.reduce((sum, q) => sum + q.marks_positive, 0)}`);
    
    return results;
  }, [calculateScore, state.questions]);

  // Reset test
  const resetTest = useCallback(() => {
    setState({
      examType: "jee_main",
      testMode: "year_wise",
      attemptMode: "online",
      selectedYear: null,
      selectedShift: null,
      selectedPaper: null,
      classLevel: "12",
      selectedSubject: null,
      selectedTopics: [],
      isLoading: false,
      loadingProgress: 0,
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      markedForReview: new Set(),
      timeRemaining: 180 * 60,
      testStarted: false,
      testSubmitted: false,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      unattemptedCount: 0,
    });
  }, []);

  // Get question status
  const getQuestionStatus = useCallback((questionId: string) => {
    const isAnswered = state.userAnswers[questionId] !== undefined;
    const isMarked = state.markedForReview.has(questionId);
    return { isAnswered, isMarked };
  }, [state.userAnswers, state.markedForReview]);

  // Get stats
  const getStats = useCallback(() => {
    const answered = Object.keys(state.userAnswers).length;
    const marked = state.markedForReview.size;
    const total = state.questions.length;
    const notAnswered = total - answered;
    
    return { answered, marked, notAnswered, total };
  }, [state.userAnswers, state.markedForReview, state.questions]);

  return {
    ...state,
    // Configuration
    setExamType,
    setTestMode,
    setAttemptMode,
    setSelectedYear,
    setSelectedShift,
    setSelectedPaper,
    setClassLevel,
    setSelectedSubject,
    toggleTopic,
    selectAllTopics,
    clearTopics,
    getAvailableTopics,
    isConfigValid,
    // Test actions
    loadQuestions,
    answerQuestion,
    toggleMarkForReview,
    clearResponse,
    setCurrentQuestion,
    setTimeRemaining,
    submitTest,
    resetTest,
    getQuestionStatus,
    getStats,
    calculateScore,
    // Constants
    availableYears: state.examType === "jee_main" ? JEE_MAIN_YEARS : JEE_ADVANCED_YEARS,
    availableShifts: JEE_MAIN_SHIFTS,
    availablePapers: JEE_ADVANCED_PAPERS,
  };
}
