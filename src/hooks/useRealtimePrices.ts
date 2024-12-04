import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import axios from 'axios';
import { TOKENS } from '../data/tokens';

const BASE_RATIO = 1000; // Base ratio of 1:1000 for RXD to other tokens
const POLLING_INTERVAL = 10000; // Poll every 10 seconds
const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);
  const updatingRef = useRef(false);
  const lastUpdateRef = useRef(Date.now());
  const priceHistoryRef = useRef<Record<string, number[]>>({});

  const updatePrices = async () => {
    if (updatingRef.current || Date.now() - lastUpdateRef.current < 5000) return;
    updatingRef.current = true;

    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
        { timeout: 5000 }
      );
      
      if (response.data?.radiant?.usd) {
        const rxdPrice = response.data.radiant.usd;
        const newPrices = { RXD: rxdPrice };
        
        // Update all token prices based on RXD price and order history
        TOKENS.forEach(token => {
          const basePrice = rxdPrice / BASE_RATIO;
          const history = priceHistoryRef.current[token.symbol] || [];
          const impactMultiplier = history.length * PRICE_IMPACT_FACTOR;
          newPrices[token.symbol] = basePrice * (1 + impactMultiplier);
        });

        // Update local state immediately
        setPrices(newPrices);
        lastUpdateRef.current = Date.now();

        // Update database
        const updates = Object.entries(newPrices).map(([symbol, price]) => ({
          symbol,
          price_usd: price,
          market_cap: price * (symbol === 'RXD' ? 21000000000 : TOKENS.find(t => t.symbol === symbol)?.totalSupply || 0),
          last_updated: new Date().toISOString()
        }));

        // Update in chunks to avoid timeouts
        const chunkSize = 25;
        for (let i = 0; i < updates.length; i += chunkSize) {
          const chunk = updates.slice(i, i + chunkSize);
          await Promise.all([
            supabase.from('tokens').upsert(chunk),
            supabase.from('token_price_history').insert(
              chunk.map(({ symbol, price_usd, last_updated }) => ({
                symbol,
                price_usd,
                timestamp: last_updated
              }))
            )
          ]);
        }
      }
    } catch (error) {
      console.warn('Error updating prices:', error);
    } finally {
      updatingRef.current = false;
    }
  };

  useEffect(() => {
    // Initial update
    updatePrices();

    // Set up polling
    const interval = setInterval(updatePrices, POLLING_INTERVAL);

    // Subscribe to order updates
    const orderSubscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new && payload.eventType === 'UPDATE' && payload.new.claimed) {
            const { from_token, to_token } = payload.new;
            
            // Update price history
            if (from_token !== 'RXD') {
              const history = priceHistoryRef.current[from_token] || [];
              priceHistoryRef.current[from_token] = [...history, Date.now()];
            }
            if (to_token !== 'RXD') {
              const history = priceHistoryRef.current[to_token] || [];
              priceHistoryRef.current[to_token] = [...history, Date.now()];
            }

            // Trigger price update
            updatePrices();
          }
        }
      )
      .subscribe();

    // Subscribe to price updates
    const priceSubscription = supabase
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
      clearInterval(interval);
      orderSubscription.unsubscribe();
      priceSubscription.unsubscribe();
    };
  }, []);

  return prices;
};