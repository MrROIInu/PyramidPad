import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://vmlrhtccpuhttgaszymo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbHJodGNjcHVodHRnYXN6eW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNzI0MjksImV4cCI6MjA0NzY0ODQyOX0.g_oEjsXloQ20YFL3YW1xSbQRe2ZPeF01R4ItclFEYiY'
);

export interface Order {
  id: number;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  swapTx: string;
  claimed: boolean;
  created_at: string;
  claim_count: number;
}