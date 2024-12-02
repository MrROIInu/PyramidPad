import { useState, useEffect } from 'react';
import { updateRXDPrice, TOKEN_PRICES } from '../lib/tokenPrices';

export const useTokenPrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);

  useEffect(() => {
    const fetchPrices = async () => {
      const newPrices = await updateRXDPrice();
      setPrices(newPrices);
    };

    // Update prices every 5 minutes
    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return prices;
};