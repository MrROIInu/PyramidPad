-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables
DROP TABLE IF EXISTS public.rxd20_token_prices CASCADE;
DROP TABLE IF EXISTS public.rxd20_price_history CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create token prices table
CREATE TABLE IF NOT EXISTS public.rxd20_token_prices (
    symbol TEXT PRIMARY KEY,
    price_usd NUMERIC NOT NULL DEFAULT 0,
    price_change_24h NUMERIC DEFAULT 0,
    volume_24h NUMERIC DEFAULT 0,
    last_trade_at TIMESTAMPTZ DEFAULT now(),
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- Create price history table
CREATE TABLE IF NOT EXISTS public.rxd20_price_history (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    price_usd NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    from_token TEXT NOT NULL,
    to_token TEXT NOT NULL,
    from_amount NUMERIC NOT NULL,
    to_amount NUMERIC NOT NULL,
    swap_tx TEXT NOT NULL,
    claimed BOOLEAN DEFAULT false,
    claim_count INTEGER DEFAULT 0,
    wallet_address TEXT,
    claimed_by TEXT,
    claimed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_token_prices_symbol ON public.rxd20_token_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_timestamp ON public.rxd20_price_history(symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tokens ON public.orders(from_token, to_token);
CREATE INDEX IF NOT EXISTS idx_orders_wallet ON public.orders(wallet_address);

-- Enable RLS
ALTER TABLE public.rxd20_token_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rxd20_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.rxd20_token_prices FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON public.rxd20_token_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.rxd20_token_prices FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.rxd20_price_history FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON public.rxd20_price_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.orders FOR UPDATE USING (true);

-- Create function to update price history
CREATE OR REPLACE FUNCTION update_price_history()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price_usd <> OLD.price_usd THEN
        INSERT INTO public.rxd20_price_history (symbol, price_usd)
        VALUES (NEW.symbol, NEW.price_usd);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price history
DROP TRIGGER IF EXISTS trigger_update_price_history ON public.rxd20_token_prices;
CREATE TRIGGER trigger_update_price_history
    AFTER UPDATE OF price_usd ON public.rxd20_token_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_price_history();