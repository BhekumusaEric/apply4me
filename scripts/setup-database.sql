-- Apply4Me Database Setup Script
-- This script sets up the student profiles tables with proper RLS policies

-- Enable RLS on auth.users (if not already enabled)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create student_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Personal Information (JSON)
    personal_info JSONB DEFAULT '{}',
    contact_info JSONB DEFAULT '{}',
    academic_history JSONB DEFAULT '{}',
    study_preferences JSONB DEFAULT '{}',
    
    -- Extracted fields for easier querying
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    id_number TEXT,
    
    -- Profile metadata
    profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
    readiness_score INTEGER DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Document information
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    mime_type TEXT,
    
    -- Verification status
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on our tables
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.student_profiles;

DROP POLICY IF EXISTS "Users can view own documents" ON public.student_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.student_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.student_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.student_documents;

-- Create RLS policies for student_profiles
CREATE POLICY "Users can view own profile" ON public.student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.student_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.student_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.student_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for student_documents
CREATE POLICY "Users can view own documents" ON public.student_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.student_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.student_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.student_documents
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_profile_id ON public.student_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_user_id ON public.student_documents(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_documents_updated_at ON public.student_documents;
CREATE TRIGGER update_student_documents_updated_at
    BEFORE UPDATE ON public.student_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_documents TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
