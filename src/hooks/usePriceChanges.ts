import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/prices/tokenPrices';
import { TOKENS } from '../data/tokens';

interface PriceChanges {
  [key: string]: {
    change1d: number;
    change7d: number;
    currentPrice: number;
  }
}

export const usePriceChanges = () => {
  const [priceChanges, setPriceChanges] = useState<PriceChanges>({});

  useEffect(() => {
    const calculateChanges = async () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data: history } = await supabase
        .from('token_price_history')
        .select('*')
        .gte('timestamp', sevenDaysAgo.toISOString())
        .order('timestamp', { ascending: false });

      if (!history) return;

      const changes: PriceChanges = {};

      TOKENS.forEach(token => {
        const tokenHistory = history.filter(h => h.symbol === token.symbol);
        const currentPrice = TOKEN_PRICES[token.symbol] || 0;

        // Get prices from 24h and 7d ago
        const day1Price = tokenHistory.find(h => 
          new Date(h.timestamp) <= oneDayAgo
        )?.price_usd || currentPrice;

        const day7Price = tokenHistory.find(h => 
          new Date(h.timestamp) <= sevenDaysAgo
        )?.price_usd || currentPrice;

        // Calculate changes
        const change1d = day1Price > 0 ? 
          ((currentPrice - day1Price) / day1Price) * 100 : 0;
        
        const change7d = day7Price > 0 ? 
          ((currentPrice - day7Price) / day7Price) * 100 : 0;

        changes[token.symbol] = {
          change1d,
          change7d,
          currentPrice
        };
      });

      setPriceChanges(changes);
    };

    calculateChanges();
    const interval = setInterval(calculateChanges, 30000);
    return () => clearInterval(interval);
  }, []);

  return priceChanges;
};