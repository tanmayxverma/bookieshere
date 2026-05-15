
-- Tests: tighten policies
DROP POLICY IF EXISTS "Anyone can create tests" ON public.tests;
DROP POLICY IF EXISTS "Users can delete own tests" ON public.tests;
DROP POLICY IF EXISTS "Users can update own tests" ON public.tests;
DROP POLICY IF EXISTS "Users can view own tests" ON public.tests;

CREATE POLICY "Users can view own tests"
  ON public.tests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own tests"
  ON public.tests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tests"
  ON public.tests FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own tests"
  ON public.tests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Test questions: drop all public access; service role (edge functions) bypasses RLS
DROP POLICY IF EXISTS "Anyone can delete questions for their tests" ON public.test_questions;
DROP POLICY IF EXISTS "Anyone can insert questions" ON public.test_questions;
DROP POLICY IF EXISTS "Anyone can update questions for their tests" ON public.test_questions;
DROP POLICY IF EXISTS "Anyone can view questions for their tests" ON public.test_questions;

-- Allow authenticated users to view ONLY questions of their own COMPLETED tests
-- (so answers/solutions are revealed only after grading). Edge functions still use
-- service_role and bypass RLS for in-test fetches and grading.
CREATE POLICY "Users can view questions of completed own tests"
  ON public.test_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tests t
      WHERE t.id = test_questions.test_id
        AND t.user_id = auth.uid()
        AND t.status = 'completed'
    )
  );
