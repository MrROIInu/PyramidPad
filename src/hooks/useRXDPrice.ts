import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

export const useRXDPrice = () => {
  const [rxdPrice, setRxdPrice] = useState(0);

  const fetchRXDPrice = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
        { timeout: 5000 }
      );

      if (response.data?.radiant?.usd) {
        const newPrice = response.data.radiant.usd;
        setRxdPrice(newPrice);

        // Update RXD price in database
        await supabase
          .from('tokens')
          .upsert({ 
            symbol: 'RXD',
            price_usd: newPrice,
            market_cap: newPrice * 21000000000 // RXD total supply
          });
      }
    } catch (error) {
      console.warn('Error fetching RXD price:', error);
    }
  };

  useEffect(() => {
    fetchRXDPrice();
    
    // Update price every 30 seconds
    const interval = setInterval(fetchRXDPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return rxdPrice;
};