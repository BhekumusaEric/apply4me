-- Apply4Me Base Schema
-- Creates all core tables before any ALTER TABLE migrations run

-- Profiles (no auth.users dependency for local dev)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    id_number TEXT,
    province TEXT,
    role TEXT DEFAULT 'student',
    notification_preferences JSONB DEFAULT '{"newBursaries":true,"deadlineReminders":true,"newInstitutions":true,"weeklyDigest":true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutions
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'university',
    province TEXT NOT NULL DEFAULT 'Gauteng',
    logo_url TEXT,
    description TEXT NOT NULL DEFAULT '',
    application_deadline DATE,
    application_fee INTEGER DEFAULT 0,
    required_documents TEXT[] DEFAULT '{}',
    contact_email TEXT DEFAULT '',
    contact_phone TEXT DEFAULT '',
    website_url TEXT DEFAULT '',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    field_of_study TEXT,
    qualification_level TEXT,
    duration_years INTEGER,
    requirements TEXT[] DEFAULT '{}',
    career_outcomes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bursaries
CREATE TABLE IF NOT EXISTS public.bursaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT '',
    provider TEXT NOT NULL DEFAULT '',
    type TEXT DEFAULT 'national',
    description TEXT NOT NULL DEFAULT '',
    amount TEXT DEFAULT 'Varies',
    max_amount DECIMAL(10,2),
    field_of_study TEXT[] DEFAULT '{}',
    eligibility_criteria TEXT[] DEFAULT '{}',
    application_deadline DATE,
    application_url TEXT DEFAULT '',
    contact_email TEXT DEFAULT '',
    contact_phone TEXT DEFAULT '',
    website_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, provider)
);

-- Applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    payment_reference TEXT,
    payment_method TEXT,
    payment_date TIMESTAMPTZ,
    service_type TEXT DEFAULT 'standard',
    notes TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin settings
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration log
CREATE TABLE IF NOT EXISTS public.migration_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT UNIQUE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_institutions_province ON public.institutions(province);
CREATE INDEX IF NOT EXISTS idx_bursaries_active ON public.bursaries(is_active);
CREATE INDEX IF NOT EXISTS idx_bursaries_deadline ON public.bursaries(application_deadline);
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
