import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { useRXDPrice } from './useRXDPrice';

export const useTokenPrices = () => {
  const rxdPrice = useRXDPrice();
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize token prices with $20 market cap
    const prices: Record<string, number> = {
      RXD: rxdPrice
    };

    TOKENS.forEach(token => {
      if (token.symbol !== 'RXD') {
        // Calculate price for $20 market cap
        prices[token.symbol] = 20 / token.totalSupply;
      }
    });

    setTokenPrices(prices);

    // Subscribe to price updates
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        (payload) => {
          if (payload.new?.symbol && payload.new?.price_usd) {
            setTokenPrices(prev => ({
              ...prev,
              [payload.new.symbol]: payload.new.price_usd
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [rxdPrice]);

  return tokenPrices;
};