-- Add enhanced program fields for Apply4Me
-- This migration adds the missing fields to support program-specific applications

-- Add new columns to programs table
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS application_deadline DATE,
ADD COLUMN IF NOT EXISTS available_spots INTEGER,
ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing programs to have some sample data
UPDATE programs SET 
  is_popular = (RANDOM() > 0.7),
  application_deadline = CASE 
    WHEN RANDOM() > 0.5 THEN '2024-09-30'::DATE
    ELSE '2024-11-15'::DATE
  END,
  available_spots = (RANDOM() * 100 + 25)::INTEGER,
  application_fee = CASE 
    WHEN qualification_level ILIKE '%bachelor%' THEN (RANDOM() * 500 + 300)::DECIMAL(10,2)
    WHEN qualification_level ILIKE '%master%' THEN (RANDOM() * 600 + 400)::DECIMAL(10,2)
    WHEN qualification_level ILIKE '%diploma%' THEN (RANDOM() * 400 + 200)::DECIMAL(10,2)
    ELSE (RANDOM() * 400 + 200)::DECIMAL(10,2)
  END,
  description = 'Comprehensive program designed to provide students with practical skills and theoretical knowledge in ' || field_of_study || '.'
WHERE is_popular IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_programs_popular ON programs(is_popular);
CREATE INDEX IF NOT EXISTS idx_programs_deadline ON programs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_programs_available ON programs(is_available);

-- Update the schema to match the new structure
COMMENT ON COLUMN programs.is_popular IS 'Indicates if this is a popular/featured program';
COMMENT ON COLUMN programs.application_deadline IS 'Application deadline for this program';
COMMENT ON COLUMN programs.available_spots IS 'Number of available spots for this program';
COMMENT ON COLUMN programs.application_fee IS 'Application fee specific to this program';
COMMENT ON COLUMN programs.description IS 'Detailed description of the program';
