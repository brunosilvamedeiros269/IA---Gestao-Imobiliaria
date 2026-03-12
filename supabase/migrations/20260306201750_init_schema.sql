-- Create Enum for Roles
CREATE TYPE user_role AS ENUM ('admin', 'broker');

-- Create Enum for Listing Type
CREATE TYPE listing_type AS ENUM ('sale', 'rent');

-- Create Enum for Funnel Status
CREATE TYPE funnel_status AS ENUM ('new', 'in_progress', 'visit', 'won', 'lost');

-- Create Agencies Table
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Users Profile Table
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  role user_role DEFAULT 'broker'::user_role NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Properties Table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  broker_id UUID REFERENCES users_profile(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  listing_type listing_type NOT NULL,
  price NUMERIC NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  address_summary TEXT,
  is_active BOOLEAN DEFAULT true,
  photos TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  funnel_status funnel_status DEFAULT 'new'::funnel_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Helper function to get current user's agency_id without triggering RLS infinitely
CREATE OR REPLACE FUNCTION get_user_agency_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT agency_id FROM users_profile WHERE id = auth.uid();
$$;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS(SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin');
$$;

-- Agencies Policies
CREATE POLICY "Users can view their own agency"
ON agencies
FOR SELECT
USING (id = get_user_agency_id());

CREATE POLICY "Authenticated users can create agency"
ON agencies
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update their own agency"
ON agencies
FOR UPDATE
USING (id = get_user_agency_id() AND is_admin());

-- Users Profile Policies
CREATE POLICY "Users can view profiles in their agency"
ON users_profile
FOR SELECT
USING (agency_id = get_user_agency_id() OR id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON users_profile
FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can insert user profiles"
ON users_profile
FOR INSERT
WITH CHECK (agency_id = get_user_agency_id() AND is_admin());

CREATE POLICY "Users can update their own profile"
ON users_profile
FOR UPDATE
USING (id = auth.uid() OR (agency_id = get_user_agency_id() AND is_admin()));

-- Properties Policies
CREATE POLICY "Users can view agency properties"
ON properties
FOR SELECT
USING (agency_id = get_user_agency_id());

CREATE POLICY "Users can insert agency properties"
ON properties
FOR INSERT
WITH CHECK (agency_id = get_user_agency_id());

CREATE POLICY "Users can update agency properties"
ON properties
FOR UPDATE
USING (agency_id = get_user_agency_id());

CREATE POLICY "Users can delete agency properties"
ON properties
FOR DELETE
USING (agency_id = get_user_agency_id());

-- Leads Policies
CREATE POLICY "Users can view agency leads"
ON leads
FOR SELECT
USING (agency_id = get_user_agency_id());

CREATE POLICY "Public can insert leads"
ON leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update agency leads"
ON leads
FOR UPDATE
USING (agency_id = get_user_agency_id());
