import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { initializeTokenPrices } from '../lib/prices/initializePrices';
import { updateTokenPrices } from '../lib/prices/updatePrices';

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadPrices = async () => {
      // First try to get prices from database
      const { data: tokenPrices } = await supabase
        .from('tokens')
        .select('symbol, price_usd');

      if (!tokenPrices?.length) {
        // If no prices exist, initialize them
        await initializeTokenPrices();
      } else {
        // Update state with existing prices
        const priceMap = tokenPrices.reduce((acc, token) => ({
          ...acc,
          [token.symbol]: token.price_usd
        }), {});
        setPrices(priceMap);
      }
    };

    loadPrices();

    // Subscribe to price updates
    const priceSubscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        payload => {
          if (payload.new?.symbol && payload.new?.price_usd) {
            setPrices(prev => ({
              ...prev,
              [payload.new.symbol]: payload.new.price_usd
            }));
          }
        })
      .subscribe();

    // Update prices periodically
    const updateInterval = setInterval(updateTokenPrices, 30000);

    return () => {
      priceSubscription.unsubscribe();
      clearInterval(updateInterval);
    };
  }, []);

  return prices;
};