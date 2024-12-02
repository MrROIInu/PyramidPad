import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import { TOKENS } from '../data/tokens';

interface PriceHistory {
  [key: string]: number[];
}

interface PriceChanges {
  [key: string]: number;
}

export const usePriceHistory = () => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory>({});
  const [priceChanges, setPriceChanges] = useState<PriceChanges>({});

  useEffect(() => {
    // Initialize price history for all tokens
    const initialHistory: PriceHistory = {};
    TOKENS.forEach(token => {
      initialHistory[token.symbol] = [TOKEN_PRICES[token.symbol]];
    });
    setPriceHistory(initialHistory);

    // Subscribe to order updates
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new.claimed) {
            const { from_token, to_token, from_amount, to_amount } = payload.new;
            
            setPriceHistory(prev => {
              const newHistory = { ...prev };
              
              // Update price history
              if (from_token !== 'RXD') {
                const prices = [...(prev[from_token] || [])];
                prices.push(TOKEN_PRICES[from_token]);
                newHistory[from_token] = prices.slice(-168); // Keep last 7 days (24 * 7)
              }
              
              if (to_token !== 'RXD') {
                const prices = [...(prev[to_token] || [])];
                prices.push(TOKEN_PRICES[to_token]);
                newHistory[to_token] = prices.slice(-168);
              }
              
              return newHistory;
            });

            // Calculate 7-day price changes
            setPriceChanges(prev => {
              const newChanges = { ...prev };
              
              Object.entries(priceHistory).forEach(([symbol, prices]) => {
                if (prices.length >= 2) {
                  const oldPrice = prices[0];
                  const newPrice = prices[prices.length - 1];
                  newChanges[symbol] = ((newPrice - oldPrice) / oldPrice) * 100;
                }
              });
              
              return newChanges;
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { priceHistory, priceChanges };
};