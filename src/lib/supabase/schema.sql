-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.token_price_history CASCADE;
DROP TABLE IF EXISTS public.tokens CASCADE;

-- Create tokens table
CREATE TABLE IF NOT EXISTS public.tokens (
    symbol TEXT PRIMARY KEY,
    price_usd NUMERIC NOT NULL DEFAULT 0,
    market_cap NUMERIC NOT NULL DEFAULT 0,
    price_change_24h NUMERIC DEFAULT 0,
    volume_24h NUMERIC DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create token price history table
CREATE TABLE IF NOT EXISTS public.token_price_history (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    price_usd NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_token_price_history_symbol_timestamp 
    ON public.token_price_history(symbol, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_tokens_symbol 
    ON public.tokens(symbol);

-- Function to calculate price change
CREATE OR REPLACE FUNCTION calculate_price_change()
RETURNS TRIGGER AS $$
BEGIN
    WITH price_24h_ago AS (
        SELECT price_usd
        FROM public.token_price_history
        WHERE symbol = NEW.symbol
        AND timestamp >= (NOW() - INTERVAL '24 hours')
        ORDER BY timestamp ASC
        LIMIT 1
    )
    UPDATE public.tokens
    SET price_change_24h = (
        CASE 
            WHEN price_24h_ago.price_usd > 0 
            THEN ((NEW.price_usd - price_24h_ago.price_usd) / price_24h_ago.price_usd * 100)
            ELSE 0
        END
    )
    FROM price_24h_ago
    WHERE tokens.symbol = NEW.symbol;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price change calculation
DROP TRIGGER IF EXISTS trigger_calculate_price_change ON public.tokens;
CREATE TRIGGER trigger_calculate_price_change
    AFTER UPDATE OF price_usd ON public.tokens
    FOR EACH ROW
    EXECUTE FUNCTION calculate_price_change();

-- Enable Row Level Security
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_price_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.tokens
    FOR SELECT TO anon USING (true);

CREATE POLICY "Enable update for users" ON public.tokens
    FOR UPDATE TO anon USING (true);

CREATE POLICY "Enable insert for users" ON public.tokens
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.token_price_history
    FOR SELECT TO anon USING (true);

CREATE POLICY "Enable insert for users" ON public.token_price_history
    FOR INSERT TO anon WITH CHECK (true);