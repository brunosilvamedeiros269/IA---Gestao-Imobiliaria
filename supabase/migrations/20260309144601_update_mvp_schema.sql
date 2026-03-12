-- Create Enum for Property Status
CREATE TYPE property_status AS ENUM ('active', 'inactive', 'sold', 'rented', 'suspended');

-- Update Agencies Table
ALTER TABLE agencies 
ADD COLUMN cnpj TEXT UNIQUE,
ADD COLUMN address TEXT;

-- Update Users Profile Table
ALTER TABLE users_profile 
ADD COLUMN avatar_url TEXT;

-- Update Properties Table
-- First, add new columns
ALTER TABLE properties 
ADD COLUMN property_type TEXT NOT NULL DEFAULT 'house',
ADD COLUMN condominio_fee NUMERIC DEFAULT 0,
ADD COLUMN iptu NUMERIC DEFAULT 0,
ADD COLUMN useful_area NUMERIC,
ADD COLUMN parking_spots INTEGER DEFAULT 0,
ADD COLUMN address_zipcode TEXT,
ADD COLUMN address_street TEXT,
ADD COLUMN address_number TEXT,
ADD COLUMN address_neighborhood TEXT,
ADD COLUMN address_city TEXT,
ADD COLUMN address_state TEXT,
ADD COLUMN status property_status DEFAULT 'active'::property_status NOT NULL,
ADD COLUMN internal_notes TEXT;

-- Second, migrate `is_active` to `status` (if true -> active, false -> inactive)
UPDATE properties SET status = CASE WHEN is_active THEN 'active'::property_status ELSE 'inactive'::property_status END;

-- Third, drop `is_active` column
ALTER TABLE properties DROP COLUMN is_active;
