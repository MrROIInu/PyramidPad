import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmlrhtccpuhttgaszymo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbHJodGNjcHVodHRnYXN6eW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNzI0MjksImV4cCI6MjA0NzY0ODQyOX0.g_oEjsXloQ20YFL3YW1xSbQRe2ZPeF01R4ItclFEYiY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    },
    fetch: (...args) => {
      // @ts-ignore
      return fetch(...args).catch(err => {
        console.warn('Supabase fetch error:', err);
        throw err;
      });
    }
  }
});

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    const { error } = await supabase.rpc('create_tables');
    if (error) throw error;

    // Initialize test data
    await supabase.from('wallet_addresses').upsert([
      { address: '1PhM4yjL9PXGoJxo6qfx8JbaEM3NPaF5Bt', is_active: true },
      { address: '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N', is_active: true },
      { address: '1LqoPnuUm3kdKvPJrELoe6JY3mJc9C7d1e', is_active: true }
    ], { onConflict: 'address' });

    return true;
  } catch (error) {
    console.warn('Database initialization error:', error);
    return false;
  }
};

// Utility function to handle Supabase errors
export const handleSupabaseError = (error: any, fallback: any = null) => {
  if (error) {
    console.warn('Supabase error:', error.message || error);
    return fallback;
  }
  return null;
};