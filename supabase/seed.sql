-- Apply4Me Seed Data
-- This file contains sample data for development and testing

-- Insert sample institutions
INSERT INTO institutions (name, type, province, logo_url, description, application_deadline, application_fee, required_documents, contact_email, contact_phone, website_url, is_featured) VALUES
('University of the Witwatersrand', 'university', 'Gauteng', '/logos/wits.svg', 'Leading research university offering diverse undergraduate and postgraduate programs with world-class facilities and academic excellence.', '2024-09-30', 200, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'admissions@wits.ac.za', '+27 11 717 1000', 'https://www.wits.ac.za', true),

('University of Cape Town', 'university', 'Western Cape', '/logos/uct.svg', 'Premier African university with world-class facilities, renowned for academic excellence and research innovation.', '2024-09-30', 250, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'admissions@uct.ac.za', '+27 21 650 9111', 'https://www.uct.ac.za', true),

('Stellenbosch University', 'university', 'Western Cape', '/logos/stellenbosch.svg', 'Innovative university known for research excellence, beautiful campus, and strong academic programs across multiple disciplines.', '2024-09-30', 200, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'info@sun.ac.za', '+27 21 808 9111', 'https://www.sun.ac.za', true),

('University of KwaZulu-Natal', 'university', 'KwaZulu-Natal', '/logos/ukzn.svg', 'Comprehensive university with strong focus on African scholarship, research excellence, and community engagement.', '2024-09-30', 180, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'admissions@ukzn.ac.za', '+27 31 260 1111', 'https://www.ukzn.ac.za', true),

('Tshwane University of Technology', 'university', 'Gauteng', '/logos/tut.svg', 'Technology-focused university offering practical and career-oriented programs with strong industry connections.', '2024-10-31', 150, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'info@tut.ac.za', '+27 12 382 5911', 'https://www.tut.ac.za', true),

('Cape Peninsula University of Technology', 'university', 'Western Cape', '/logos/cput.svg', 'Leading university of technology with industry-relevant programs and excellent graduate employment rates.', '2024-10-31', 150, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'info@cput.ac.za', '+27 21 460 3911', 'https://www.cput.ac.za', true),

('University of Pretoria', 'university', 'Gauteng', '/logos/up.svg', 'One of South Africa''s top research universities with excellent facilities and diverse academic programs.', '2024-09-30', 220, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'admissions@up.ac.za', '+27 12 420 3111', 'https://www.up.ac.za', false),

('Rhodes University', 'university', 'Eastern Cape', '/logos/rhodes.svg', 'Small, prestigious university known for academic excellence and strong student community.', '2024-09-30', 180, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'admissions@ru.ac.za', '+27 46 603 8111', 'https://www.ru.ac.za', false),

('University of the Free State', 'university', 'Free State', '/logos/ufs.svg', 'Comprehensive university offering quality education with strong research focus and community engagement.', '2024-09-30', 160, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'admissions@ufs.ac.za', '+27 51 401 9111', 'https://www.ufs.ac.za', false),

('North-West University', 'university', 'North West', '/logos/nwu.svg', 'Multi-campus university offering diverse programs with focus on innovation and academic excellence.', '2024-09-30', 160, ARRAY['ID Document', 'Matric Certificate', 'Academic Transcript', 'Proof of Payment'], 'admissions@nwu.ac.za', '+27 18 299 1111', 'https://www.nwu.ac.za', false);

-- Insert sample programs
INSERT INTO programs (institution_id, name, field_of_study, qualification_level, duration_years, requirements, career_outcomes) VALUES
((SELECT id FROM institutions WHERE name = 'University of the Witwatersrand' LIMIT 1), 'Bachelor of Science in Computer Science', 'Engineering and Technology', 'Bachelor''s Degree', 3, ARRAY['Mathematics', 'Physical Sciences', 'English'], ARRAY['Software Developer', 'Data Scientist', 'Systems Analyst', 'IT Consultant']),

((SELECT id FROM institutions WHERE name = 'University of Cape Town' LIMIT 1), 'Bachelor of Medicine and Bachelor of Surgery', 'Health Sciences', 'Bachelor''s Degree', 6, ARRAY['Mathematics', 'Physical Sciences', 'Life Sciences', 'English'], ARRAY['Medical Doctor', 'Surgeon', 'Specialist Physician', 'Medical Researcher']),

((SELECT id FROM institutions WHERE name = 'Stellenbosch University' LIMIT 1), 'Bachelor of Engineering in Civil Engineering', 'Engineering and Technology', 'Bachelor''s Degree', 4, ARRAY['Mathematics', 'Physical Sciences', 'English'], ARRAY['Civil Engineer', 'Structural Engineer', 'Project Manager', 'Construction Manager']),

((SELECT id FROM institutions WHERE name = 'University of KwaZulu-Natal' LIMIT 1), 'Bachelor of Education', 'Education', 'Bachelor''s Degree', 4, ARRAY['English', 'Mathematics or Life Sciences', 'Two Teaching Subjects'], ARRAY['Primary School Teacher', 'High School Teacher', 'Education Administrator', 'Curriculum Developer']),

((SELECT id FROM institutions WHERE name = 'Tshwane University of Technology' LIMIT 1), 'National Diploma in Information Technology', 'Engineering and Technology', 'Diploma', 3, ARRAY['Mathematics', 'English', 'Physical Sciences or Life Sciences'], ARRAY['IT Technician', 'Network Administrator', 'Web Developer', 'Database Administrator']);

-- Insert sample bursaries
INSERT INTO bursaries (name, provider, type, field_of_study, eligibility_criteria, amount, application_deadline, application_url, description) VALUES
('NSFAS Bursary', 'National Student Financial Aid Scheme', 'national', ARRAY['All Fields'], ARRAY['South African citizen', 'Household income below R350,000', 'First-time entering higher education'], 100000, '2024-11-30', 'https://www.nsfas.org.za', 'Comprehensive financial aid covering tuition, accommodation, meals, and learning materials for qualifying students.'),

('Sasol Bursary Programme', 'Sasol Limited', 'sector', ARRAY['Engineering and Technology', 'Natural Sciences'], ARRAY['South African citizen', 'Academic excellence', 'Financial need', 'Studying relevant fields'], 150000, '2024-08-31', 'https://www.sasol.com/careers/bursaries', 'Full bursary covering tuition, accommodation, and living expenses for engineering and science students.'),

('Anglo American Bursary', 'Anglo American', 'sector', ARRAY['Engineering and Technology', 'Natural Sciences', 'Business and Management'], ARRAY['South African citizen', 'Academic merit', 'Financial need', 'Leadership potential'], 120000, '2024-09-15', 'https://www.angloamerican.com/careers/bursaries', 'Comprehensive bursary with mentorship and vacation work opportunities.'),

('Gauteng Provincial Bursary', 'Gauteng Provincial Government', 'provincial', ARRAY['All Fields'], ARRAY['Gauteng resident', 'Financial need', 'Academic merit', 'South African citizen'], 80000, '2024-10-31', 'https://www.gauteng.gov.za/bursaries', 'Provincial bursary for Gauteng residents pursuing higher education.'),

('Western Cape Provincial Bursary', 'Western Cape Provincial Government', 'provincial', ARRAY['All Fields'], ARRAY['Western Cape resident', 'Financial need', 'Academic merit', 'South African citizen'], 75000, '2024-10-31', 'https://www.westerncape.gov.za/bursaries', 'Provincial bursary supporting Western Cape students in higher education.');

-- Insert sample career profile data (this would typically be generated by the career profiler)
-- This is just for demonstration purposes
