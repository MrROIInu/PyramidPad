import { useState, useEffect } from 'react';
import { priceManager } from '../lib/priceManager';

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(priceManager.getCurrentPrices());

  useEffect(() => {
    const subscription = priceManager.subscribe(setPrices);
    return () => subscription.unsubscribe();
  }, []);

  return prices;
};