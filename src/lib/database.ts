import { supabase } from './supabase';
import { INITIAL_LIQUIDITY } from '../data/liquidityPool';
import { INITIAL_ORDERS } from '../data/orders';

interface SwapData {
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  tax_amount: number;
  wallet_address: string;
  transaction_id: string;
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
    // Initialize tables
    const { error: tablesError } = await supabase.rpc('create_tables');
    if (tablesError) throw tablesError;

    // Initialize orders with initial data
    const { error: deleteOrdersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', 0);
    
    if (deleteOrdersError) throw deleteOrdersError;

    const { error: ordersError } = await supabase
      .from('orders')
      .insert(INITIAL_ORDERS);

    if (ordersError) throw ordersError;

    // Initialize liquidity pool with initial values
    const updates = Object.entries(INITIAL_LIQUIDITY).map(([token, amount]) => ({
      token,
      amount
    }));

    const { error: deleteError } = await supabase
      .from('liquidity_pool')
      .delete()
      .neq('token', '');

    if (deleteError) throw deleteError;

    const { error: liquidityError } = await supabase
      .from('liquidity_pool')
      .insert(updates);

    if (liquidityError) throw liquidityError;

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

export async function updateLiquidityPool() {
  try {
    const updates = Object.entries(INITIAL_LIQUIDITY).map(([token, amount]) => ({
      token,
      amount
    }));

    const { error: deleteError } = await supabase
      .from('liquidity_pool')
      .delete()
      .neq('token', '');

    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase
      .from('liquidity_pool')
      .insert(updates);

    if (insertError) throw insertError;

    return true;
  } catch (error) {
    console.error('Error updating liquidity pool:', error);
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

export async function updateLiquidity(token: string, amount: number) {
  try {
    const { error } = await supabase
      .from('liquidity_pool')
      .upsert({ token, amount });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating liquidity:', error);
  }
}

export async function saveSwap(swapData: SwapData): Promise<boolean> {
  try {
    // First check if we have enough liquidity
    const currentLiquidity = await getLiquidity(swapData.to_token);
    if (swapData.to_amount > currentLiquidity / 2) {
      throw new Error('Insufficient liquidity');
    }

    const { error } = await supabase
      .from('swaps')
      .insert([{
        from_token: swapData.from_token,
        to_token: swapData.to_token,
        from_amount: swapData.from_amount,
        to_amount: swapData.to_amount,
        tax_amount: swapData.tax_amount,
        wallet_address: swapData.wallet_address,
        transaction_id: swapData.transaction_id,
        status: 'pending'
      }]);

    if (error) throw error;

    // Update liquidity after successful swap
    await updateLiquidity(
      swapData.to_token,
      currentLiquidity - swapData.to_amount
    );

    return true;
  } catch (error) {
    console.error('Error saving swap:', error);
    throw error;
  }
}

export async function saveOrder(orderData: OrderData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .insert([{
        from_token: orderData.from_token,
        to_token: orderData.to_token,
        from_amount: orderData.from_amount,
        to_amount: orderData.to_amount,
        swap_tx: orderData.swap_tx,
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