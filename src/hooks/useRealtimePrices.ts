import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { initializeTokenPrices } from '../lib/prices/initializePrices';

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadPrices = async () => {
      // Get latest prices from database
      const { data: tokenPrices } = await supabase
        .from('rxd20_token_prices')
        .select('symbol, price_usd')
        .order('last_updated', { ascending: false });

      if (tokenPrices?.length) {
        const priceMap = tokenPrices.reduce((acc, token) => ({
          ...acc,
          [token.symbol]: token.price_usd
        }), {});
        setPrices(priceMap);
      } else {
        // Initialize prices if none exist
        const initialPrices = await initializeTokenPrices();
        setPrices(initialPrices);
      }
    };

    loadPrices();

    // Subscribe to price updates
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rxd20_token_prices' },
        payload => {
          if (payload.new?.symbol && payload.new?.price_usd) {
            setPrices(prev => ({
              ...prev,
              [payload.new.symbol]: payload.new.price_usd
            }));

            // Add visual feedback for price changes
            const elements = document.querySelectorAll(`[data-token="${payload.new.symbol}"]`);
            elements.forEach(element => {
              element.classList.add('price-update');
              setTimeout(() => {
                element.classList.remove('price-update');
              }, 1000);
            });
          }
        })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return prices;
};