-- Function to reset the entire pricing system
CREATE OR REPLACE FUNCTION reset_pricing_system()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Disable triggers temporarily
  ALTER TABLE tokens DISABLE TRIGGER ALL;
  ALTER TABLE token_price_history DISABLE TRIGGER ALL;

  -- Clear existing data
  TRUNCATE TABLE token_price_history;
  TRUNCATE TABLE tokens;

  -- Re-enable triggers
  ALTER TABLE tokens ENABLE TRIGGER ALL;
  ALTER TABLE token_price_history ENABLE TRIGGER ALL;
END;
$$;

-- Function to update price after claim
CREATE OR REPLACE FUNCTION update_price_after_claim()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only process on claim
  IF NEW.claimed = true AND OLD.claimed = false THEN
    -- Decrease from_token price by 0.1%
    IF NEW.from_token != 'RXD' THEN
      UPDATE tokens
      SET 
        price_usd = GREATEST(price_usd * 0.999, 0.000001),
        last_updated = NOW()
      WHERE symbol = NEW.from_token;

      -- Add price history entry
      INSERT INTO token_price_history (symbol, price_usd)
      SELECT symbol, price_usd FROM tokens WHERE symbol = NEW.from_token;
    END IF;

    -- Increase to_token price by 0.1%
    IF NEW.to_token != 'RXD' THEN
      UPDATE tokens
      SET 
        price_usd = price_usd * 1.001,
        last_updated = NOW()
      WHERE symbol = NEW.to_token;

      -- Add price history entry
      INSERT INTO token_price_history (symbol, price_usd)
      SELECT symbol, price_usd FROM tokens WHERE symbol = NEW.to_token;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for price updates
DROP TRIGGER IF EXISTS trigger_update_price_after_claim ON orders;
CREATE TRIGGER trigger_update_price_after_claim
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_price_after_claim();