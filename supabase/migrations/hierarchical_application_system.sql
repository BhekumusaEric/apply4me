-- Hierarchical Application System Migration
-- Phase 1: Database Schema Enhancement
-- This migration adds program-specific application support while maintaining backward compatibility

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PHASE 1.1: ENHANCE PROGRAMS TABLE
-- =====================================================

-- Add program-specific application fields
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS application_deadline DATE,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS available_spots INTEGER,
ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS entry_requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'open' CHECK (application_status IN ('open', 'closed', 'full', 'pending')),
ADD COLUMN IF NOT EXISTS min_requirements JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS program_coordinator_email TEXT,
ADD COLUMN IF NOT EXISTS program_coordinator_phone TEXT,
ADD COLUMN IF NOT EXISTS application_opens_at DATE,
ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add program metadata for better management
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0.0;

-- =====================================================
-- PHASE 1.2: ENHANCE APPLICATIONS TABLE (BACKWARD COMPATIBLE)
-- =====================================================

-- Add program-specific application fields
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS program_specific_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS program_requirements_met JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS program_application_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS application_type TEXT DEFAULT 'institution' CHECK (application_type IN ('institution', 'program')),
ADD COLUMN IF NOT EXISTS program_deadline DATE,
ADD COLUMN IF NOT EXISTS program_status TEXT DEFAULT 'draft' CHECK (program_status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'));

-- Add constraint for new applications to require program_id (backward compatible)
-- This constraint only applies to applications created after the migration date
ALTER TABLE applications 
ADD CONSTRAINT applications_program_required 
CHECK (
  program_id IS NOT NULL 
  OR created_at < '2024-12-01'::timestamp 
  OR application_type = 'institution'
);

-- =====================================================
-- PHASE 1.3: CREATE PERFORMANCE INDEXES
-- =====================================================

-- Programs table indexes
CREATE INDEX IF NOT EXISTS idx_programs_deadline ON programs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_programs_available ON programs(is_available);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(application_status);
CREATE INDEX IF NOT EXISTS idx_programs_popular ON programs(is_popular);
CREATE INDEX IF NOT EXISTS idx_programs_opens_at ON programs(application_opens_at);
CREATE INDEX IF NOT EXISTS idx_programs_institution_available ON programs(institution_id, is_available);

-- Applications table indexes
CREATE INDEX IF NOT EXISTS idx_applications_program ON applications(program_id);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(application_type);
CREATE INDEX IF NOT EXISTS idx_applications_program_status ON applications(program_status);
CREATE INDEX IF NOT EXISTS idx_applications_program_deadline ON applications(program_deadline);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_programs_institution_status_deadline ON programs(institution_id, application_status, application_deadline);
CREATE INDEX IF NOT EXISTS idx_applications_user_program ON applications(user_id, program_id);

-- =====================================================
-- PHASE 1.4: UPDATE EXISTING DATA WITH REALISTIC VALUES
-- =====================================================

-- Update existing programs with realistic application data
UPDATE programs SET 
  application_deadline = CASE 
    WHEN RANDOM() > 0.6 THEN '2025-09-30'::DATE  -- Main application period
    WHEN RANDOM() > 0.3 THEN '2025-11-15'::DATE  -- Late application period
    ELSE '2025-07-31'::DATE                      -- Early application period
  END,
  application_opens_at = CASE 
    WHEN RANDOM() > 0.5 THEN '2025-03-01'::DATE  -- Standard opening
    ELSE '2025-02-01'::DATE                      -- Early opening
  END,
  is_available = (RANDOM() > 0.15), -- 85% of programs available
  available_spots = CASE 
    WHEN qualification_level ILIKE '%bachelor%' THEN (RANDOM() * 200 + 50)::INTEGER
    WHEN qualification_level ILIKE '%master%' THEN (RANDOM() * 50 + 15)::INTEGER
    WHEN qualification_level ILIKE '%phd%' OR qualification_level ILIKE '%doctorate%' THEN (RANDOM() * 20 + 5)::INTEGER
    ELSE (RANDOM() * 100 + 25)::INTEGER
  END,
  application_fee = CASE 
    WHEN qualification_level ILIKE '%bachelor%' THEN (RANDOM() * 400 + 200)::DECIMAL(10,2)
    WHEN qualification_level ILIKE '%master%' THEN (RANDOM() * 600 + 300)::DECIMAL(10,2)
    WHEN qualification_level ILIKE '%phd%' OR qualification_level ILIKE '%doctorate%' THEN (RANDOM() * 800 + 400)::DECIMAL(10,2)
    WHEN qualification_level ILIKE '%diploma%' THEN (RANDOM() * 300 + 150)::DECIMAL(10,2)
    WHEN qualification_level ILIKE '%certificate%' THEN (RANDOM() * 200 + 100)::DECIMAL(10,2)
    ELSE (RANDOM() * 350 + 175)::DECIMAL(10,2)
  END,
  application_status = CASE 
    WHEN RANDOM() > 0.9 THEN 'closed'   -- 10% closed
    WHEN RANDOM() > 0.98 THEN 'full'    -- 2% full
    WHEN RANDOM() > 0.95 THEN 'pending' -- 3% pending
    ELSE 'open'                         -- 85% open
  END,
  is_popular = (RANDOM() > 0.75), -- 25% popular programs
  priority_level = CASE 
    WHEN RANDOM() > 0.8 THEN 5  -- High priority
    WHEN RANDOM() > 0.6 THEN 4  -- Above average
    WHEN RANDOM() > 0.4 THEN 3  -- Average
    WHEN RANDOM() > 0.2 THEN 2  -- Below average
    ELSE 1                      -- Low priority
  END,
  description = CASE 
    WHEN field_of_study IS NOT NULL THEN 
      'Comprehensive ' || qualification_level || ' program in ' || field_of_study || 
      '. This program provides students with both theoretical knowledge and practical skills needed for success in the field.'
    ELSE 
      'Comprehensive ' || qualification_level || ' program designed to provide students with the knowledge and skills needed for their chosen career path.'
  END,
  entry_requirements = CASE 
    WHEN qualification_level ILIKE '%bachelor%' THEN 
      ARRAY['NSC with Bachelor''s pass', 'Mathematics (Level 4)', 'English (Level 4)', 'Subject-specific requirements']
    WHEN qualification_level ILIKE '%master%' THEN 
      ARRAY['Relevant Bachelor''s degree', 'Minimum 65% average', 'Research proposal', 'Academic references']
    WHEN qualification_level ILIKE '%phd%' OR qualification_level ILIKE '%doctorate%' THEN 
      ARRAY['Relevant Master''s degree', 'Minimum 70% average', 'Research proposal', 'Academic supervisor', 'Academic references']
    WHEN qualification_level ILIKE '%diploma%' THEN 
      ARRAY['NSC with Diploma pass', 'Mathematics (Level 3)', 'English (Level 3)', 'Subject-specific requirements']
    WHEN qualification_level ILIKE '%certificate%' THEN 
      ARRAY['NSC or equivalent', 'English (Level 2)', 'Basic mathematics literacy']
    ELSE 
      ARRAY['NSC or equivalent', 'English proficiency', 'Subject-specific requirements']
  END,
  min_requirements = jsonb_build_object(
    'minimum_aps', CASE 
      WHEN qualification_level ILIKE '%bachelor%' THEN 30 + (RANDOM() * 10)::INTEGER
      WHEN qualification_level ILIKE '%diploma%' THEN 20 + (RANDOM() * 8)::INTEGER
      ELSE 15 + (RANDOM() * 10)::INTEGER
    END,
    'english_level', CASE 
      WHEN qualification_level ILIKE '%bachelor%' OR qualification_level ILIKE '%master%' THEN 4
      WHEN qualification_level ILIKE '%diploma%' THEN 3
      ELSE 2
    END,
    'mathematics_level', CASE 
      WHEN field_of_study ILIKE '%engineering%' OR field_of_study ILIKE '%science%' OR field_of_study ILIKE '%mathematics%' THEN 5
      WHEN field_of_study ILIKE '%business%' OR field_of_study ILIKE '%commerce%' THEN 4
      ELSE 3
    END
  ),
  last_updated_at = NOW()
WHERE application_deadline IS NULL;

-- =====================================================
-- PHASE 1.5: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get available programs for an institution
CREATE OR REPLACE FUNCTION get_available_programs(institution_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  qualification_level TEXT,
  field_of_study TEXT,
  application_deadline DATE,
  application_fee DECIMAL(10,2),
  available_spots INTEGER,
  application_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.qualification_level,
    p.field_of_study,
    p.application_deadline,
    p.application_fee,
    p.available_spots,
    p.application_status
  FROM programs p
  WHERE p.institution_id = institution_uuid
    AND p.is_available = TRUE
    AND p.application_status = 'open'
    AND (p.application_deadline IS NULL OR p.application_deadline > CURRENT_DATE)
    AND (p.application_opens_at IS NULL OR p.application_opens_at <= CURRENT_DATE)
  ORDER BY p.is_popular DESC, p.priority_level DESC, p.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a program is currently accepting applications
CREATE OR REPLACE FUNCTION is_program_accepting_applications(program_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  program_record RECORD;
BEGIN
  SELECT 
    is_available,
    application_status,
    application_deadline,
    application_opens_at,
    available_spots,
    application_count
  INTO program_record
  FROM programs
  WHERE id = program_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check all conditions for accepting applications
  RETURN (
    program_record.is_available = TRUE
    AND program_record.application_status = 'open'
    AND (program_record.application_deadline IS NULL OR program_record.application_deadline > CURRENT_DATE)
    AND (program_record.application_opens_at IS NULL OR program_record.application_opens_at <= CURRENT_DATE)
    AND (program_record.available_spots IS NULL OR program_record.application_count < program_record.available_spots)
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PHASE 1.6: CREATE TRIGGERS FOR DATA CONSISTENCY
-- =====================================================

-- Trigger to update last_updated_at on programs
CREATE OR REPLACE FUNCTION update_program_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER programs_update_timestamp
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_program_timestamp();

-- Trigger to update application count when applications are created/deleted
CREATE OR REPLACE FUNCTION update_program_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.program_id IS NOT NULL THEN
    UPDATE programs 
    SET application_count = application_count + 1
    WHERE id = NEW.program_id;
  ELSIF TG_OP = 'DELETE' AND OLD.program_id IS NOT NULL THEN
    UPDATE programs 
    SET application_count = GREATEST(0, application_count - 1)
    WHERE id = OLD.program_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.program_id != NEW.program_id THEN
    -- Handle program change
    IF OLD.program_id IS NOT NULL THEN
      UPDATE programs 
      SET application_count = GREATEST(0, application_count - 1)
      WHERE id = OLD.program_id;
    END IF;
    IF NEW.program_id IS NOT NULL THEN
      UPDATE programs 
      SET application_count = application_count + 1
      WHERE id = NEW.program_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_update_program_count
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_program_application_count();

-- =====================================================
-- PHASE 1.7: ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN programs.application_deadline IS 'Deadline for applications to this specific program';
COMMENT ON COLUMN programs.is_available IS 'Whether this program is currently available for applications';
COMMENT ON COLUMN programs.available_spots IS 'Number of available spots for this program';
COMMENT ON COLUMN programs.application_fee IS 'Application fee specific to this program';
COMMENT ON COLUMN programs.application_status IS 'Current application status: open, closed, full, pending';
COMMENT ON COLUMN programs.entry_requirements IS 'Array of entry requirements for this program';
COMMENT ON COLUMN programs.min_requirements IS 'JSON object with minimum requirements (APS, subject levels, etc.)';
COMMENT ON COLUMN programs.is_popular IS 'Whether this is a popular/featured program';
COMMENT ON COLUMN programs.priority_level IS 'Priority level for display ordering (1-5)';
COMMENT ON COLUMN programs.application_count IS 'Current number of applications for this program';

COMMENT ON COLUMN applications.program_specific_info IS 'Program-specific information provided by the applicant';
COMMENT ON COLUMN applications.program_requirements_met IS 'JSON tracking which program requirements have been met';
COMMENT ON COLUMN applications.application_type IS 'Type of application: institution or program-based';
COMMENT ON COLUMN applications.program_status IS 'Program-specific application status';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
INSERT INTO public.migration_log (migration_name, completed_at, description) 
VALUES (
  'hierarchical_application_system', 
  NOW(), 
  'Added program-specific application support with backward compatibility'
) ON CONFLICT (migration_name) DO UPDATE SET 
  completed_at = NOW(),
  description = EXCLUDED.description;

-- Create migration log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.migration_log (
  id SERIAL PRIMARY KEY,
  migration_name TEXT UNIQUE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);
