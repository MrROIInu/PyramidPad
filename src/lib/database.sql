-- Drop existing objects
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tokens;
DROP POLICY IF EXISTS "Enable update for all users" ON public.tokens;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.tokens;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.token_price_history;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.token_price_history;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.wallet_addresses;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.wallet_addresses;

-- Create tokens table
CREATE TABLE IF NOT EXISTS public.tokens (
  symbol TEXT PRIMARY KEY,
  price_usd NUMERIC NOT NULL DEFAULT 0,
  market_cap NUMERIC NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create token price history table
CREATE TABLE IF NOT EXISTS public.token_price_history (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  symbol TEXT NOT NULL,
  price_usd NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_token_price_history_symbol_timestamp 
  ON token_price_history (symbol, timestamp);

-- Create wallet_addresses table
CREATE TABLE IF NOT EXISTS public.wallet_addresses (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  address TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add columns to orders table
ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS claimed_by TEXT,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.tokens
  FOR SELECT TO anon USING (true);

CREATE POLICY "Enable update for all users" ON public.tokens
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Enable insert for all users" ON public.tokens
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.token_price_history
  FOR SELECT TO anon USING (true);

CREATE POLICY "Enable insert for all users" ON public.token_price_history
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.wallet_addresses
  FOR SELECT TO anon USING (true);

CREATE POLICY "Enable insert for all users" ON public.wallet_addresses
  FOR INSERT TO anon WITH CHECK (true);

-- Add test wallets
INSERT INTO public.wallet_addresses (address, is_active) VALUES
('1PhM4yjL9PXGoJxo6qfx8JbaEM3NPaF5Bt', true),
('1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N', true),
('1LqoPnuUm3kdKvPJrELoe6JY3mJc9C7d1e', true)
ON CONFLICT (address) DO UPDATE SET is_active = true;