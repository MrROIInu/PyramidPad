-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tokens;
DROP POLICY IF EXISTS "Enable update for all users" ON public.tokens;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.tokens;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.token_price_history;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.token_price_history;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.wallet_addresses;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.wallet_addresses;

-- Drop existing tables
DROP TABLE IF EXISTS public.token_price_history CASCADE;
DROP TABLE IF EXISTS public.tokens CASCADE;
DROP TABLE IF EXISTS public.wallet_addresses CASCADE;