import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import axios from 'axios';
import { TOKENS } from '../data/tokens';

const BASE_RATIO = 1000; // Base ratio of 1:1000 for RXD to other tokens

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);
  const updatingRef = useRef(false);

  useEffect(() => {
    // Function to fetch RXD price and update all token prices
    const updateAllPrices = async () => {
      if (updatingRef.current) return;
      updatingRef.current = true;

      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
          { timeout: 5000 }
        );
        
        if (response.data?.radiant?.usd) {
          const rxdPrice = response.data.radiant.usd;
          
          // Update local state first for immediate UI update
          const newPrices = { RXD: rxdPrice };
          TOKENS.forEach(token => {
            newPrices[token.symbol] = rxdPrice / BASE_RATIO;
          });
          setPrices(newPrices);

          // Prepare database updates
          const updates = [
            {
              symbol: 'RXD',
              price_usd: rxdPrice,
              market_cap: rxdPrice * 21000000000,
              last_updated: new Date().toISOString()
            },
            ...TOKENS.map(token => ({
              symbol: token.symbol,
              price_usd: rxdPrice / BASE_RATIO,
              market_cap: (rxdPrice / BASE_RATIO) * token.totalSupply,
              last_updated: new Date().toISOString()
            }))
          ];

          // Update database in chunks to avoid timeouts
          const chunkSize = 50;
          for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize);
            await supabase
              .from('tokens')
              .upsert(chunk, { onConflict: 'symbol' });
            
            await supabase
              .from('token_price_history')
              .insert(chunk.map(update => ({
                symbol: update.symbol,
                price_usd: update.price_usd,
                timestamp: update.last_updated
              })));
          }
        }
      } catch (error) {
        console.warn('Error updating prices:', error);
      } finally {
        updatingRef.current = false;
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