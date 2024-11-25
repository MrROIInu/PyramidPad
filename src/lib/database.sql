-- Drop existing tables
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create orders table
CREATE TABLE public.orders (
  id BIGSERIAL PRIMARY KEY,
  from_token TEXT NOT NULL,
  to_token TEXT NOT NULL,
  from_amount NUMERIC NOT NULL,
  to_amount NUMERIC NOT NULL,
  swap_tx TEXT NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claim_count INTEGER DEFAULT 0,
  price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.orders
  FOR SELECT TO anon USING (true);

CREATE POLICY "Enable insert for all users" ON public.orders
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.orders
  FOR UPDATE TO anon USING (true);