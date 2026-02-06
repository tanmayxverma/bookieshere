import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  PracticeQuestion, 
  TOPICS_BY_SUBJECT,
  getFilteredQuestions,
  SyllabusLevel,
} from "@/data/practiceBank";

export type TestType = "jee_main" | "jee_advanced";
export type AttemptMode = "online" | "pdf";

export interface PracticeTestState {
  testType: TestType;
  attemptMode: AttemptMode;
  syllabusLevel: SyllabusLevel;
  selectedSubjects: ("physics" | "chemistry" | "mathematics")[];
  selectedTopics: string[];

  isLoading: boolean;
  loadingProgress: number;
  questions: PracticeQuestion[];
  currentQuestionIndex: number;
  userAnswers: Record<string, any>;
  markedForReview: Set<string>;
  timeRemaining: number;
  testStarted: boolean;
  testSubmitted: boolean;

  score: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
}

export function usePracticeTest() {
  const [state, setState] = useState<PracticeTestState>({
    testType: "jee_main",
    attemptMode: "online",
    syllabusLevel: "both",
    selectedSubjects: [],
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

  const setTestType = useCallback((type: TestType) => {
    setState(prev => ({ ...prev, testType: type }));
  }, []);

  const setAttemptMode = useCallback((mode: AttemptMode) => {
    setState(prev => ({ ...prev, attemptMode: mode }));
  }, []);

  const setSyllabusLevel = useCallback((level: SyllabusLevel) => {
    setState(prev => ({ ...prev, syllabusLevel: level, selectedTopics: [] }));
  }, []);

  const toggleSubject = useCallback((subject: "physics" | "chemistry" | "mathematics") => {
    setState(prev => {
      const subjects = prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject];
      return { ...prev, selectedSubjects: subjects, selectedTopics: [] };
    });
  }, []);

  const toggleTopic = useCallback((topic: string) => {
    setState(prev => {
      const topics = prev.selectedTopics.includes(topic)
        ? prev.selectedTopics.filter(t => t !== topic)
        : [...prev.selectedTopics, topic];
      return { ...prev, selectedTopics: topics };
    });
  }, []);

  const selectAllTopics = useCallback(() => {
    setState(prev => {
      const allTopics: string[] = [];
      for (const subj of prev.selectedSubjects) {
        const topics = TOPICS_BY_SUBJECT[subj] || [];
        let filtered = topics;
        if (prev.syllabusLevel === "11") filtered = topics.filter(t => t.classLevel === "11");
        else if (prev.syllabusLevel === "12") filtered = topics.filter(t => t.classLevel === "12");
        allTopics.push(...filtered.map(t => t.name));
      }
      return { ...prev, selectedTopics: allTopics };
    });
  }, []);

  const clearTopics = useCallback(() => {
    setState(prev => ({ ...prev, selectedTopics: [] }));
  }, []);

  const getAvailableTopics = useCallback(() => {
    const topics: { name: string; classLevel: "11" | "12" }[] = [];
    for (const subj of state.selectedSubjects) {
      const subjTopics = TOPICS_BY_SUBJECT[subj] || [];
      let filtered = subjTopics;
      if (state.syllabusLevel === "11") filtered = subjTopics.filter(t => t.classLevel === "11");
      else if (state.syllabusLevel === "12") filtered = subjTopics.filter(t => t.classLevel === "12");
      topics.push(...filtered);
    }
    return topics;
  }, [state.selectedSubjects, state.syllabusLevel]);

  const isConfigValid = useCallback(() => {
    if (state.selectedSubjects.length === 0) return false;
    if (state.selectedTopics.length === 0) return false;
    return true;
  }, [state.selectedSubjects, state.selectedTopics]);

  const loadQuestions = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, loadingProgress: 0 }));

    // Controlled fake-loading for UX
    const steps = [5, 10, 20, 40, 65, 85, 95, 100];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, i < 2 ? 250 : 80));
      setState(prev => ({ ...prev, loadingProgress: steps[i] }));
    }

    const questions = getFilteredQuestions({
      testType: state.testType,
      syllabusLevel: state.syllabusLevel,
      subjects: state.selectedSubjects,
      topics: state.selectedTopics,
    });

    if (questions.length === 0) {
      setState(prev => ({ ...prev, isLoading: false, loadingProgress: 0, questions: [] }));
      return {
        success: false,
        message: "No questions available for the selected topics. Try selecting more topics or a different syllabus level."
      };
    }

    const duration = state.testType === "jee_main" ? 180 * 60 : 180 * 60;

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

    return { success: true };
  }, [state.testType, state.syllabusLevel, state.selectedSubjects, state.selectedTopics, state.attemptMode]);

  const answerQuestion = useCallback((answer: any) => {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;
    setState(prev => ({
      ...prev,
      userAnswers: { ...prev.userAnswers, [currentQ.id]: answer },
    }));
  }, [state.questions, state.currentQuestionIndex]);

  const toggleMarkForReview = useCallback(() => {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;
    setState(prev => {
      const newMarked = new Set(prev.markedForReview);
      if (newMarked.has(currentQ.id)) newMarked.delete(currentQ.id);
      else newMarked.add(currentQ.id);
      return { ...prev, markedForReview: newMarked };
    });
  }, [state.questions, state.currentQuestionIndex]);

  const clearResponse = useCallback(() => {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;
    setState(prev => {
      const newAnswers = { ...prev.userAnswers };
      delete newAnswers[currentQ.id];
      return { ...prev, userAnswers: newAnswers };
    });
  }, [state.questions, state.currentQuestionIndex]);

  const setCurrentQuestion = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentQuestionIndex: index }));
  }, []);

  const setTimeRemaining = useCallback((time: number) => {
    setState(prev => ({ ...prev, timeRemaining: time }));
  }, []);

  const calculateScore = useCallback(() => {
    let score = 0, correct = 0, incorrect = 0, unattempted = 0;
    const MARKS_CORRECT = 4;
    const MARKS_INCORRECT = 1;

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
        isCorrect = correctArr.length === userArr.length && correctArr.every(a => userArr.includes(a));
      } else if (q.question_type === "numerical" || q.question_type === "integer") {
        const userNum = parseFloat(userAnswer);
        const correctNum = typeof q.correct_answer === "number" ? q.correct_answer : parseFloat(q.correct_answer as string);
        isCorrect = Math.abs(userNum - correctNum) < 0.01;
      }

      if (isCorrect) { score += MARKS_CORRECT; correct++; }
      else { score -= MARKS_INCORRECT; incorrect++; }
    });

    // Score can be negative — DO NOT clamp to zero
    return { score, correct, incorrect, unattempted };
  }, [state.questions, state.userAnswers]);

  const submitTest = useCallback(() => {
    const results = calculateScore();
    // SCORE VALIDATION: Independent recalculation
    const verify = calculateScore();
    if (results.score !== verify.score || results.correct !== verify.correct) {
      toast.error("Score validation failed. Please try again.");
      return results;
    }
    const totalMarks = state.questions.length * 4;
    setState(prev => ({
      ...prev,
      testSubmitted: true,
      testStarted: false,
      score: results.score,
      correctCount: results.correct,
      incorrectCount: results.incorrect,
      unattemptedCount: results.unattempted,
    }));
    toast.success(`Test submitted! Score: ${results.score}/${totalMarks}`);
    return results;
  }, [calculateScore, state.questions]);

  const resetTest = useCallback(() => {
    setState({
      testType: "jee_main",
      attemptMode: "online",
      syllabusLevel: "both",
      selectedSubjects: [],
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

  const getQuestionStatus = useCallback((questionId: string) => {
    return {
      isAnswered: state.userAnswers[questionId] !== undefined,
      isMarked: state.markedForReview.has(questionId),
    };
  }, [state.userAnswers, state.markedForReview]);

  const getStats = useCallback(() => {
    const answered = Object.keys(state.userAnswers).length;
    const marked = state.markedForReview.size;
    const total = state.questions.length;
    return { answered, marked, notAnswered: total - answered, total };
  }, [state.userAnswers, state.markedForReview, state.questions]);

  return {
    ...state,
    setTestType,
    setAttemptMode,
    setSyllabusLevel,
    toggleSubject,
    toggleTopic,
    selectAllTopics,
    clearTopics,
    getAvailableTopics,
    isConfigValid,
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
  };
}
