import { supabase } from './supabase';
import { INITIAL_LIQUIDITY } from '../data/liquidityPool';

export async function initializeDatabase() {
  try {
    // Initialize liquidity pool with initial values
    const updates = Object.entries(INITIAL_LIQUIDITY).map(([token, amount]) => ({
      token,
      amount
    }));

    const { error: liquidityError } = await supabase
      .from('liquidity_pool')
      .upsert(updates, { onConflict: 'token' });

    if (liquidityError) throw liquidityError;

    return true;
  } catch (error) {
    console.error('Error initializing liquidity pool:', error);
    return false;
  }
}

export async function getLiquidity(token: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('liquidity_pool')
      .select('amount')
      .eq('token', token)
      .single();

    if (error) throw error;
    return data?.amount || INITIAL_LIQUIDITY[token] || 0;
  } catch (error) {
    console.error('Error getting liquidity:', error);
    return INITIAL_LIQUIDITY[token] || 0;
  }
}

export async function updateLiquidityPool() {
  try {
    const updates = Object.entries(INITIAL_LIQUIDITY).map(([token, amount]) => ({
      token,
      amount
    }));

    const { error } = await supabase
      .from('liquidity_pool')
      .upsert(updates, { onConflict: 'token' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating liquidity pool:', error);
    return false;
  }
}