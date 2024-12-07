import { supabase } from '../supabase';

export const FEE_WALLET = '1LqoPnuUm3kdKvPJrELoe6JY3mJc9C7d1e';

export async function isWalletAllowed(address: string): Promise<boolean> {
  try {
    if (!address) return false;

    const { data, error } = await supabase
      .from('wallet_addresses')
      .select('*')
      .eq('address', address)
      .maybeSingle();

    if (error) {
      console.error('Error checking wallet:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking wallet:', error);
    return false;
  }
}

export async function addWalletToAllowlist(address: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wallet_addresses')
      .insert([{ address }]);

    return !error;
  } catch (error) {
    console.error('Error adding wallet to allowlist:', error);
    return false;
  }
}