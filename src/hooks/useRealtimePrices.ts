import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import axios from 'axios';

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);

  useEffect(() => {
    // Function to fetch RXD price and update all token prices
    const updateAllPrices = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
          { timeout: 5000 }
        );
        
        if (response.data?.radiant?.usd) {
          const rxdPrice = response.data.radiant.usd;
          
          // Update all token prices based on RXD price
          const updates = Object.keys(prices).map(symbol => {
            let newPrice;
            if (symbol === 'RXD') {
              newPrice = rxdPrice;
            } else {
              // Maintain the current ratio with RXD while updating absolute price
              const currentRatio = prices[symbol] / prices.RXD;
              newPrice = rxdPrice * currentRatio;
            }
            
            return {
              symbol,
              price_usd: newPrice
            };
          });

          // Update local state
          const newPrices = { ...prices };
          updates.forEach(({ symbol, price_usd }) => {
            newPrices[symbol] = price_usd;
          });
          setPrices(newPrices);

          // Update database
          await supabase
            .from('tokens')
            .upsert(updates.map(update => ({
              ...update,
              last_updated: new Date().toISOString()
            })));
        }
      } catch (error) {
        console.warn('Error updating prices:', error);
      }
    };

    // Initial update
    updateAllPrices();

    // Set up polling interval (every 15 seconds)
    const priceInterval = setInterval(updateAllPrices, 15000);

    // Subscribe to price updates from other users
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        (payload) => {
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
      clearInterval(priceInterval);
      subscription.unsubscribe();
    };
  }, []);

  return prices;
};