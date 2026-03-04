-- Fix RLS policies to allow reading data
-- This ensures that both logged-in and anonymous users can see institutions, programs, and bursaries

-- Enable RLS on core tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bursaries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access on institutions" ON public.institutions;
DROP POLICY IF EXISTS "Allow public read access on programs" ON public.programs;
DROP POLICY IF EXISTS "Allow public read access on bursaries" ON public.bursaries;

-- Add new policies for public read access (anon and authenticated)
CREATE POLICY "Allow public read access on institutions" 
ON public.institutions FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow public read access on programs" 
ON public.programs FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow public read access on bursaries" 
ON public.bursaries FOR SELECT 
TO public 
USING (true);

-- Ensure profiles can be read by their own users
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'email' = email);
