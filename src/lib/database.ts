import { supabase } from './supabase';
import { INITIAL_LIQUIDITY } from '../data/liquidityPool';

interface SwapData {
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  tax_amount?: number;
  wallet_address?: string;
  transaction_id?: string;
}

interface OrderData {
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  swap_tx: string;
}

export async function initializeDatabase() {
  try {
    // Call create_tables RPC
    const { error: tablesError } = await supabase.rpc('create_tables');
    if (tablesError) throw tablesError;

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
    console.error('Database initialization error:', error);
    return false;
  }
}

export async function saveSwap(data: SwapData) {
  try {
    const { error } = await supabase
      .from('swaps')
      .insert([{
        ...data,
        tax_amount: data.tax_amount || 0,
        status: 'pending'
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving swap:', error);
    throw error;
  }
}

export async function saveOrder(data: OrderData) {
  try {
    const { error } = await supabase
      .from('orders')
      .insert([{
        ...data,
        claimed: false,
        claim_count: 0
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

export async function getOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: number, claimed: boolean) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        claimed,
        claim_count: claimed ? supabase.rpc('increment_claim_count') : undefined
      })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
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