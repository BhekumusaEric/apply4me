-- Apply4Me Database Schema
-- Comprehensive Student Profile System

-- Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  id_number TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  race TEXT,
  nationality TEXT DEFAULT 'South African',
  home_language TEXT,
  current_province TEXT,
  citizenship TEXT DEFAULT 'South African',
  
  -- Contact Information
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternative_phone TEXT,
  current_address JSONB,
  permanent_address JSONB,
  emergency_contact JSONB,
  preferred_contact_method TEXT DEFAULT 'Email',
  
  -- Academic Information
  matric_info JSONB,
  previous_studies JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  career_interests JSONB DEFAULT '[]'::jsonb,
  
  -- Preferences
  study_preferences JSONB,
  financial_preferences JSONB,
  notification_preferences JSONB,
  
  -- Profile Status
  profile_completeness INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  readiness_score INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Student Documents Table
CREATE TABLE IF NOT EXISTS student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  expiry_date DATE,
  notes TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Profile Verification Log
CREATE TABLE IF NOT EXISTS profile_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL, -- 'identity', 'academic', 'documents'
  status TEXT NOT NULL, -- 'pending', 'verified', 'failed'
  verified_by UUID REFERENCES auth.users(id),
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Application Readiness Log
CREATE TABLE IF NOT EXISTS application_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  readiness_score INTEGER NOT NULL,
  missing_documents TEXT[],
  missing_information TEXT[],
  eligible_for_university BOOLEAN DEFAULT false,
  eligible_for_tvet BOOLEAN DEFAULT false,
  eligible_for_bursaries BOOLEAN DEFAULT false,
  assessment_date TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_id_number ON student_profiles(id_number);
CREATE INDEX IF NOT EXISTS idx_student_profiles_completeness ON student_profiles(profile_completeness);
CREATE INDEX IF NOT EXISTS idx_student_profiles_verified ON student_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_student_documents_profile_id ON student_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_type ON student_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_profile_verifications_profile_id ON profile_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_application_readiness_profile_id ON application_readiness(profile_id);

-- Row Level Security (RLS) Policies
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_readiness ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON student_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON student_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only access their own documents
CREATE POLICY "Users can view own documents" ON student_documents
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own documents" ON student_documents
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own documents" ON student_documents
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

-- Users can view their verification status
CREATE POLICY "Users can view own verifications" ON profile_verifications
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

-- Users can view their readiness assessments
CREATE POLICY "Users can view own readiness" ON application_readiness
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

-- Admin policies (for staff to verify profiles)
CREATE POLICY "Admins can view all profiles" ON student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can verify profiles" ON profile_verifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

-- Function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completeness_score INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM student_profiles WHERE id = profile_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Personal Info (30 points)
  IF profile_record.id_number IS NOT NULL THEN completeness_score := completeness_score + 5; END IF;
  IF profile_record.first_name IS NOT NULL THEN completeness_score := completeness_score + 3; END IF;
  IF profile_record.last_name IS NOT NULL THEN completeness_score := completeness_score + 3; END IF;
  IF profile_record.date_of_birth IS NOT NULL THEN completeness_score := completeness_score + 2; END IF;
  IF profile_record.home_language IS NOT NULL THEN completeness_score := completeness_score + 2; END IF;
  IF profile_record.current_province IS NOT NULL THEN completeness_score := completeness_score + 2; END IF;
  IF profile_record.personal_info IS NOT NULL THEN completeness_score := completeness_score + 13; END IF;
  
  -- Contact Info (20 points)
  IF profile_record.email IS NOT NULL THEN completeness_score := completeness_score + 5; END IF;
  IF profile_record.phone IS NOT NULL THEN completeness_score := completeness_score + 5; END IF;
  IF profile_record.current_address IS NOT NULL THEN completeness_score := completeness_score + 5; END IF;
  IF profile_record.emergency_contact IS NOT NULL THEN completeness_score := completeness_score + 5; END IF;
  
  -- Academic History (25 points)
  IF profile_record.matric_info IS NOT NULL THEN completeness_score := completeness_score + 25; END IF;
  
  -- Documents (25 points)
  -- Check if required documents exist
  IF EXISTS (SELECT 1 FROM student_documents WHERE profile_id = profile_record.id AND document_type = 'ID_DOCUMENT') THEN
    completeness_score := completeness_score + 6;
  END IF;
  IF EXISTS (SELECT 1 FROM student_documents WHERE profile_id = profile_record.id AND document_type = 'PASSPORT_PHOTO') THEN
    completeness_score := completeness_score + 4;
  END IF;
  IF EXISTS (SELECT 1 FROM student_documents WHERE profile_id = profile_record.id AND document_type = 'MATRIC_CERTIFICATE') THEN
    completeness_score := completeness_score + 6;
  END IF;
  IF EXISTS (SELECT 1 FROM student_documents WHERE profile_id = profile_record.id AND document_type = 'MATRIC_RESULTS') THEN
    completeness_score := completeness_score + 6;
  END IF;
  IF EXISTS (SELECT 1 FROM student_documents WHERE profile_id = profile_record.id AND document_type = 'INCOME_STATEMENT') THEN
    completeness_score := completeness_score + 3;
  END IF;
  
  RETURN LEAST(completeness_score, 100);
END;
$$ LANGUAGE plpgsql;
