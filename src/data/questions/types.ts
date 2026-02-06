export interface PracticeQuestion {
  id: string;
  subject: "physics" | "chemistry" | "mathematics";
  chapter: string;
  classLevel: "11" | "12";
  question_type: "single_correct" | "multi_correct" | "numerical" | "integer";
  question_text: string;
  options: { label: string; text: string }[] | null;
  correct_answer: string | string[] | number;
  marks_positive: number;
  marks_negative: number;
  solution: string | null;
  diagram_url?: string;
  difficulty: "main" | "advanced";
}
