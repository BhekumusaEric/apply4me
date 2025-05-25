-- Apply4Me Database Schema
-- This schema creates all the necessary tables for the Apply4Me platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    id_number TEXT UNIQUE,
    province TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin'))
);

-- Institutions table
CREATE TABLE public.institutions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('university', 'college', 'tvet')),
    province TEXT NOT NULL,
    logo_url TEXT,
    description TEXT NOT NULL,
    application_deadline DATE,
    application_fee DECIMAL(10,2),
    required_documents TEXT[] DEFAULT '{}',
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE public.programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    qualification_level TEXT NOT NULL,
    duration_years INTEGER NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    career_outcomes TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'processing', 'completed')),
    personal_details JSONB DEFAULT '{}',
    academic_records JSONB DEFAULT '{}',
    documents JSONB DEFAULT '{}',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    payment_reference TEXT,
    service_type TEXT DEFAULT 'standard' CHECK (service_type IN ('standard', 'express')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bursaries table
CREATE TABLE public.bursaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('national', 'provincial', 'sector', 'institutional')),
    field_of_study TEXT[] DEFAULT '{}',
    eligibility_criteria TEXT[] DEFAULT '{}',
    amount DECIMAL(12,2),
    application_deadline DATE,
    application_url TEXT,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career profiles table
CREATE TABLE public.career_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interests TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    subjects TEXT[] DEFAULT '{}',
    work_preferences TEXT[] DEFAULT '{}',
    recommended_careers TEXT[] DEFAULT '{}',
    recommended_programs TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE public.programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    qualification_type TEXT NOT NULL,
    duration TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    career_outcomes TEXT[] DEFAULT '{}',
    field_of_study TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    personal_info JSONB NOT NULL,
    academic_info JSONB NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('standard', 'express')),
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'processing', 'completed', 'rejected')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_institutions_type ON institutions(type);
CREATE INDEX idx_institutions_province ON institutions(province);
CREATE INDEX idx_institutions_featured ON institutions(is_featured);
CREATE INDEX idx_programs_institution ON programs(institution_id);
CREATE INDEX idx_programs_field ON programs(field_of_study);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_bursaries_active ON bursaries(is_active);
CREATE INDEX idx_bursaries_type ON bursaries(type);

-- Row Level Security Policies

-- Users can only see and edit their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Institutions are publicly readable, admin writable
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institutions are publicly readable" ON institutions FOR SELECT USING (true);
CREATE POLICY "Only admins can modify institutions" ON institutions FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Programs are publicly readable, admin writable
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programs are publicly readable" ON programs FOR SELECT USING (true);
CREATE POLICY "Only admins can modify programs" ON programs FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Applications are private to users and admins
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications" ON applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Bursaries are publicly readable, admin writable
ALTER TABLE bursaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bursaries are publicly readable" ON bursaries FOR SELECT USING (true);
CREATE POLICY "Only admins can modify bursaries" ON bursaries FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Career profiles are private to users
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own career profile" ON career_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own career profile" ON career_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own career profile" ON career_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bursaries_updated_at BEFORE UPDATE ON bursaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_profiles_updated_at BEFORE UPDATE ON career_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
