-- Create enum for exam type (JEE Main vs JEE Advanced)
CREATE TYPE public.jee_exam_type AS ENUM ('jee_main', 'jee_advanced');

-- Create enum for test status
CREATE TYPE public.test_status AS ENUM ('draft', 'in_progress', 'completed', 'abandoned');

-- Create enum for question type
CREATE TYPE public.question_type AS ENUM (
  'single_correct',      -- JEE Main & Advanced
  'multi_correct',       -- JEE Advanced
  'numerical',           -- Both exams
  'integer',             -- JEE Advanced
  'matrix_match',        -- JEE Advanced
  'paragraph'            -- JEE Advanced
);

-- Create tests table to store generated tests
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  exam_type jee_exam_type NOT NULL,
  syllabus JSONB NOT NULL DEFAULT '{}',
  status test_status NOT NULL DEFAULT 'draft',
  total_questions INTEGER NOT NULL DEFAULT 0,
  total_marks INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 180,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  correct_count INTEGER,
  incorrect_count INTEGER,
  unattempted_count INTEGER
);

-- Create questions table for generated questions
CREATE TABLE public.test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  subject subject_type NOT NULL,
  chapter TEXT,
  question_type question_type NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB NOT NULL,
  user_answer JSONB,
  is_marked_for_review BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  marks_positive INTEGER NOT NULL DEFAULT 4,
  marks_negative NUMERIC(3,2) NOT NULL DEFAULT 1,
  partial_marking BOOLEAN DEFAULT false,
  solution TEXT,
  diagram_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_test_questions_test_id ON public.test_questions(test_id);
CREATE INDEX idx_tests_user_id ON public.tests(user_id);
CREATE INDEX idx_tests_status ON public.tests(status);

-- Enable RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

-- Tests policies: Anyone can create tests (for anonymous users)
-- Users can only see their own tests if logged in, or see tests they created
CREATE POLICY "Anyone can create tests"
ON public.tests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own tests"
ON public.tests
FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own tests"
ON public.tests
FOR UPDATE
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete own tests"
ON public.tests
FOR DELETE
USING (user_id = auth.uid() OR user_id IS NULL);

-- Questions policies
CREATE POLICY "Anyone can insert questions"
ON public.test_questions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view questions for their tests"
ON public.test_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tests 
    WHERE tests.id = test_questions.test_id 
    AND (tests.user_id = auth.uid() OR tests.user_id IS NULL)
  )
);

CREATE POLICY "Anyone can update questions for their tests"
ON public.test_questions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tests 
    WHERE tests.id = test_questions.test_id 
    AND (tests.user_id = auth.uid() OR tests.user_id IS NULL)
  )
);

CREATE POLICY "Anyone can delete questions for their tests"
ON public.test_questions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tests 
    WHERE tests.id = test_questions.test_id 
    AND (tests.user_id = auth.uid() OR tests.user_id IS NULL)
  )
);