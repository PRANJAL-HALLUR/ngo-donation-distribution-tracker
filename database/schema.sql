-- ==============================================================================
-- FundHub: Cloud-Based NGO Donation & Distribution Tracker
-- Complete Supabase PostgreSQL Schema with Row Level Security & Seed Data
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table (Maps 1-to-1 with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('donor', 'ngo_admin', 'app_admin')),
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Donors Profile Table
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. NGOs Table
CREATE TABLE IF NOT EXISTS public.ngos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mission TEXT,
    registration_id VARCHAR(100),
    contact_email VARCHAR(255),
    phone_number VARCHAR(20),
    category VARCHAR(100) DEFAULT 'Education',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    verification_document_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    total_received NUMERIC(12, 2) DEFAULT 0,
    image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Donations Table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ngo_id UUID REFERENCES public.ngos(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    type VARCHAR(50) DEFAULT 'Money',
    status VARCHAR(20) DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'completed', 'allocated', 'distributed', 'verified')),
    razorpay_order_id VARCHAR(255),
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Distributions Table (Proof of fund usage)
CREATE TABLE IF NOT EXISTS public.distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID REFERENCES public.ngos(id) ON DELETE CASCADE,
    donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    beneficiary_name VARCHAR(255) NOT NULL,
    amount_spent NUMERIC(12, 2) NOT NULL,
    proof_image_url VARCHAR(500),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'distributed' CHECK (status IN ('distributed', 'verified')),
    distributed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Notifications Log Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    email_to VARCHAR(255),
    subject VARCHAR(255),
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Audit Logs Table (Admin fraud & monitoring trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write for authenticated users & anon demo
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Insert Users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Public Read Donors" ON public.donors FOR SELECT USING (true);
CREATE POLICY "Public Insert Donors" ON public.donors FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read NGOs" ON public.ngos FOR SELECT USING (true);
CREATE POLICY "Public Insert NGOs" ON public.ngos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update NGOs" ON public.ngos FOR UPDATE USING (true);

CREATE POLICY "Public Read Donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Public Insert Donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Donations" ON public.donations FOR UPDATE USING (true);

CREATE POLICY "Public Read Distributions" ON public.distributions FOR SELECT USING (true);
CREATE POLICY "Public Insert Distributions" ON public.distributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Distributions" ON public.distributions FOR UPDATE USING (true);

CREATE POLICY "Public Read Notification Logs" ON public.notification_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Notification Logs" ON public.notification_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Audit Logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Audit Logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- Sample Verified NGOs Seed Data (Instantly populate Browse & Maps)
-- ==============================================================================
INSERT INTO public.ngos (id, name, description, mission, category, contact_email, phone_number, city, state, country, status, total_received, image)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Care & Hope Foundation',
    'Providing nutritional meals, healthcare kits, and shelter support to underprivileged children and families across urban slums.',
    'Eliminating hunger and empowering the next generation through health and education.',
    'Food & Healthcare',
    'contact@careandhope.org',
    '+91 9876543210',
    'Mumbai',
    'Maharashtra',
    'India',
    'approved',
    4250.00,
    '🍲'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'BrightFuture Literacy Initiative',
    'Distributing textbooks, setting up solar-powered computer labs, and sponsoring tuition for rural primary schools.',
    'Bridging the digital and educational divide for rural children.',
    'Education',
    'info@brightfuture.org',
    '+91 9876543211',
    'Bangalore',
    'Karnataka',
    'India',
    'approved',
    7800.00,
    '📚'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'GreenEarth Disaster Relief',
    'Rapid response units providing clean drinking water filtration systems, emergency blankets, and medical aid during natural disasters.',
    'Delivering swift, verified humanitarian relief where disaster strikes.',
    'Disaster Relief',
    'relief@greenearth.org',
    '+91 9876543212',
    'Kochi',
    'Kerala',
    'India',
    'approved',
    12400.00,
    '🌍'
  )
ON CONFLICT (id) DO NOTHING;
