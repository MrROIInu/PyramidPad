import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import axios from 'axios';
import { TOKENS } from '../data/tokens';
import { priceCache } from '../lib/priceCache';

const POLLING_INTERVAL = 10000; // 10 seconds
const BASE_RATIO = 1000; // 1:1000 base ratio

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);

  const updatePrices = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
        { timeout: 5000 }
      );

      if (response.data?.radiant?.usd) {
        const rxdPrice = response.data.radiant.usd;
        priceCache.setPrice('RXD', rxdPrice);

        const newPrices = { RXD: rxdPrice };
        
        // Update all token prices based on RXD price
        TOKENS.forEach(token => {
          const price = rxdPrice / BASE_RATIO;
          newPrices[token.symbol] = price;
          priceCache.setPrice(token.symbol, price);
        });

        setPrices(newPrices);

        // Update database
        const updates = Object.entries(newPrices).map(([symbol, price]) => ({
          symbol,
          price_usd: price,
          last_updated: new Date().toISOString()
        }));

        await supabase.from('tokens').upsert(updates);
      } else {
        // Use cached values if API fails
        const newPrices = { RXD: priceCache.getLastValidPrice('RXD') };
        TOKENS.forEach(token => {
          newPrices[token.symbol] = priceCache.getLastValidPrice(token.symbol);
        });
        setPrices(newPrices);
      }
    } catch (error) {
      // Use cached values on error
      const newPrices = { RXD: priceCache.getLastValidPrice('RXD') };
      TOKENS.forEach(token => {
        newPrices[token.symbol] = priceCache.getLastValidPrice(token.symbol);
      });
      setPrices(newPrices);
    }
  };

  useEffect(() => {
    // Load historical prices on mount
    priceCache.loadHistoricalPrices();

    // Initial update
    updatePrices();

    // Set up polling
    const interval = setInterval(updatePrices, POLLING_INTERVAL);

    // Subscribe to price updates
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        (payload) => {
          if (payload.new?.symbol && payload.new?.price_usd) {
            const { symbol, price_usd } = payload.new;
            priceCache.setPrice(symbol, price_usd);
            setPrices(prev => ({
              ...prev,
              [symbol]: price_usd
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

  // Return prices with fallback to cached values
  return new Proxy(prices, {
    get(target, prop) {
      if (typeof prop === 'string') {
        return target[prop] || priceCache.getLastValidPrice(prop);
      }
      return target[prop as any];
    }
  });
};