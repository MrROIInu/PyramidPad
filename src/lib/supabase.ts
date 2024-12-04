import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmlrhtccpuhttgaszymo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbHJodGNjcHVodHRnYXN6eW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNzI0MjksImV4cCI6MjA0NzY0ODQyOX0.g_oEjsXloQ20YFL3YW1xSbQRe2ZPeF01R4ItclFEYiY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create tokens table if it doesn't exist
    const { error: tokensError } = await supabase.rpc('create_tokens_table');
    if (tokensError) {
      console.warn('Error creating tokens table:', tokensError);
    }

    // Create token_price_history table if it doesn't exist
    const { error: historyError } = await supabase.rpc('create_price_history_table');
    if (historyError) {
      console.warn('Error creating price history table:', historyError);
    }

    return true;
  } catch (error) {
    console.warn('Database initialization error:', error);
    return false;
  }
};