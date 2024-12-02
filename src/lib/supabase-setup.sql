-- Add last_updated column to tokens table if it doesn't exist
ALTER TABLE public.tokens ADD COLUMN IF NOT EXISTS last_updated timestamptz DEFAULT now();

-- Create or replace the update_token_price function
CREATE OR REPLACE FUNCTION update_token_price()
RETURNS TRIGGER AS $$
DECLARE
  impact_factor DECIMAL := 0.001; -- 0.1% price impact
BEGIN
  -- Update prices when order is claimed
  IF TG_OP = 'UPDATE' AND NEW.claimed = true AND OLD.claimed = false THEN
    -- Update from_token price (decrease)
    IF NEW.from_token != 'RXD' THEN
      UPDATE tokens 
      SET 
        price_usd = price_usd * (1 - impact_factor),
        last_updated = now()
      WHERE symbol = NEW.from_token;
    END IF;
    
    -- Update to_token price (increase)
    IF NEW.to_token != 'RXD' THEN
      UPDATE tokens 
      SET 
        price_usd = price_usd * (1 + impact_factor),
        last_updated = now()
      WHERE symbol = NEW.to_token;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS update_token_prices ON public.orders;
CREATE TRIGGER update_token_prices
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_token_price();