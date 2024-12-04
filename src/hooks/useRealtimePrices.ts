import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import axios from 'axios';

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);

  useEffect(() => {
    // Function to fetch RXD price from CoinGecko
    const fetchRXDPrice = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
          { timeout: 5000 }
        );
        
        if (response.data?.radiant?.usd) {
          const rxdPrice = response.data.radiant.usd;
          setPrices(prev => {
            const newPrices = { ...prev };
            // Update RXD price
            newPrices.RXD = rxdPrice;
            
            // Update all other token prices relative to RXD
            Object.keys(newPrices).forEach(symbol => {
              if (symbol !== 'RXD') {
                const ratio = prev[symbol] / prev.RXD;
                newPrices[symbol] = rxdPrice * ratio;
              }
            });
            
            return newPrices;
          });
        }
      } catch (error) {
        console.warn('Error fetching RXD price:', error);
      }
    };

    // Initial fetch
    fetchRXDPrice();

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(fetchRXDPrice, 30000);

    // Subscribe to price updates
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        async (payload) => {
          if (payload.new?.symbol && payload.new?.price_usd) {
            setPrices(prev => ({
              ...prev,
              [payload.new.symbol]: payload.new.price_usd
            }));
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  return prices;
};