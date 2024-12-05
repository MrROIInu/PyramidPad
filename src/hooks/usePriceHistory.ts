import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { calculatePriceChange } from '../lib/prices/priceManager';

export const usePriceHistory = () => {
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadPriceHistory = async () => {
      // Get last 7 days of price history for all tokens
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);

      const { data: history } = await supabase
        .from('token_price_history')
        .select('*')
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString())
        .order('timestamp', { ascending: true });

      if (history) {
        const historyMap: Record<string, number[]> = {};
        const changesMap: Record<string, number> = {};

        // Calculate price changes for all tokens
        await Promise.all(TOKENS.map(async token => {
          const tokenHistory = history.filter(h => h.symbol === token.symbol);
          historyMap[token.symbol] = tokenHistory.map(h => h.price_usd);
          changesMap[token.symbol] = await calculatePriceChange(token.symbol);
        }));

        setPriceHistory(historyMap);
        setPriceChanges(changesMap);
      }
    };

    loadPriceHistory();

    // Subscribe to price updates
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        async (payload) => {
          if (payload.new?.symbol) {
            const { symbol } = payload.new;
            
            // Update price history
            setPriceHistory(prev => ({
              ...prev,
              [symbol]: [...(prev[symbol] || []), payload.new.price_usd]
            }));

            // Calculate and update price change
            const change = await calculatePriceChange(symbol);
            setPriceChanges(prev => ({
              ...prev,
              [symbol]: change
            }));
          }
        })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { priceHistory, priceChanges };
};