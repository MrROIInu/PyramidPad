import { supabase } from './supabase';

export const FEE_WALLET = '1LqoPnuUm3kdKvPJrELoe6JY3mJc9C7d1e';

export async function isWalletAllowed(address: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('wallet_addresses')
      .select('address')
      .eq('address', address)
      .single();

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