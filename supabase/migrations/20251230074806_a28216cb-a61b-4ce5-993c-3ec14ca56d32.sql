-- Add new resource types to the enum
ALTER TYPE public.resource_type ADD VALUE IF NOT EXISTS 'test_series';
ALTER TYPE public.resource_type ADD VALUE IF NOT EXISTS 'modules';
ALTER TYPE public.resource_type ADD VALUE IF NOT EXISTS 'crux';

-- Add combined subject type for materials that span all subjects
ALTER TYPE public.subject_type ADD VALUE IF NOT EXISTS 'combined';