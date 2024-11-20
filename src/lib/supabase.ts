import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmlrhtccpuhttgaszymo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbHJodGNjcHVodHRnYXN6eW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNzI0MjksImV4cCI6MjA0NzY0ODQyOX0.g_oEjsXloQ20YFL3YW1xSbQRe2ZPeF01R4ItclFEYiY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database tables
export async function initializeDatabase() {
  // Create swaps table
  const { error: swapsError } = await supabase.rpc('create_swaps_table');
  if (swapsError) {
    console.error('Error creating swaps table:', swapsError);
  }

  // Create orders table
  const { error: ordersError } = await supabase.rpc('create_orders_table');
  if (ordersError) {
    console.error('Error creating orders table:', ordersError);
  }
}

// Initialize liquidity pool
export async function initializeLiquidityPool() {
  const { error: poolError } = await supabase.rpc('create_liquidity_pool_table');
  if (poolError) {
    console.error('Error creating liquidity pool table:', poolError);
  }
}