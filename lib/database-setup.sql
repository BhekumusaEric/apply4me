-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL,
  personal_info JSONB,
  academic_info JSONB,
  service_type VARCHAR(50) DEFAULT 'standard',
  total_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'draft',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institutions table if it doesn't exist
CREATE TABLE IF NOT EXISTS institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  location VARCHAR(255),
  description TEXT,
  application_fee DECIMAL(10,2) DEFAULT 0,
  requirements TEXT[],
  programs JSONB,
  contact_info JSONB,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users profile table to extend auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  province VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for applications
CREATE POLICY "Users can view their own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" ON applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for institutions (public read)
CREATE POLICY "Anyone can view institutions" ON institutions
  FOR SELECT USING (true);

-- Create policies for users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Insert sample institutions
INSERT INTO institutions (id, name, type, location, description, application_fee, requirements, programs, contact_info, logo_url, website_url) VALUES
(
  'e9a5ac09-7e39-4290-b2e0-73a76706a725',
  'University of the Witwatersrand',
  'University',
  'Johannesburg, Gauteng',
  'A leading research university in South Africa, known for excellence in education and innovation.',
  150.00,
  ARRAY['Matric Certificate', 'ID Document', 'Academic Transcript'],
  '{"undergraduate": ["BCom", "BSc", "BA", "BEng"], "postgraduate": ["MBA", "MSc", "MA", "PhD"]}',
  '{"email": "admissions@wits.ac.za", "phone": "+27 11 717 1000", "address": "1 Jan Smuts Avenue, Braamfontein, Johannesburg"}',
  '/images/institutions/wits-logo.png',
  'https://www.wits.ac.za'
),
(
  '46d39230-86f5-4efb-887b-0b03b43ab705',
  'University of Cape Town',
  'University',
  'Cape Town, Western Cape',
  'Africa''s leading university, consistently ranked among the top universities globally.',
  200.00,
  ARRAY['Matric Certificate', 'ID Document', 'Academic Transcript', 'Personal Statement'],
  '{"undergraduate": ["BCom", "BSc", "BA", "BEng", "MBChB"], "postgraduate": ["MBA", "MSc", "MA", "PhD", "LLM"]}',
  '{"email": "admissions@uct.ac.za", "phone": "+27 21 650 9111", "address": "Private Bag X3, Rondebosch, Cape Town"}',
  '/images/institutions/uct-logo.png',
  'https://www.uct.ac.za'
),
(
  '12345678-1234-1234-1234-123456789012',
  'University of Pretoria',
  'University',
  'Pretoria, Gauteng',
  'One of South Africa''s top research universities with a strong focus on innovation and excellence.',
  120.00,
  ARRAY['Matric Certificate', 'ID Document', 'Academic Transcript'],
  '{"undergraduate": ["BCom", "BSc", "BA", "BEng", "BVSc"], "postgraduate": ["MBA", "MSc", "MA", "PhD"]}',
  '{"email": "admissions@up.ac.za", "phone": "+27 12 420 3111", "address": "Lynnwood Rd, Hatfield, Pretoria"}',
  '/images/institutions/up-logo.png',
  'https://www.up.ac.za'
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
