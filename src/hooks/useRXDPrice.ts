import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchRXDPrice } from '../lib/api/priceApi';

export const useRXDPrice = () => {
  const [rxdPrice, setRxdPrice] = useState(0);

  useEffect(() => {
    const updatePrice = async () => {
      try {
        const priceData = await fetchRXDPrice();
        setRxdPrice(priceData.price);

        // Update RXD price in database
        await supabase
          .from('tokens')
          .upsert({ 
            symbol: 'RXD',
            price_usd: priceData.price,
            market_cap: priceData.marketCap,
            price_change_24h: priceData.priceChange24h,
            last_updated: new Date().toISOString()
          });
      } catch (error) {
        console.warn('Error updating RXD price:', error);
      }
    };

    // Initial update
    updatePrice();
    
    // Update price every 30 seconds
    const interval = setInterval(updatePrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return rxdPrice;
};