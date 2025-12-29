-- Create enum for exam types
CREATE TYPE public.exam_type AS ENUM ('jee', 'other_pcm');

-- Create enum for subjects
CREATE TYPE public.subject_type AS ENUM ('physics', 'chemistry', 'mathematics');

-- Create enum for resource types
CREATE TYPE public.resource_type AS ENUM ('books', 'notes', 'pyqs', 'practice_sheets');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  exam exam_type NOT NULL,
  subject subject_type NOT NULL,
  resource_type resource_type NOT NULL,
  download_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Materials: Everyone can read
CREATE POLICY "Anyone can view materials"
ON public.materials
FOR SELECT
USING (true);

-- Materials: Only admins can insert
CREATE POLICY "Admins can insert materials"
ON public.materials
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Materials: Only admins can update
CREATE POLICY "Admins can update materials"
ON public.materials
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Materials: Only admins can delete
CREATE POLICY "Admins can delete materials"
ON public.materials
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles: Users can see their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- User roles: Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();