import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order

export const usePriceImpact = () => {
  const updatePrices = useCallback(async (fromToken: string, toToken: string) => {
    if (fromToken === 'RXD' && toToken === 'RXD') return;

    const { data: tokens } = await supabase
      .from('tokens')
      .select('symbol,price_usd')
      .in('symbol', [fromToken, toToken]);

    if (!tokens) return;

    const updates = tokens.map(token => ({
      symbol: token.symbol,
      price_usd: token.symbol === fromToken 
        ? token.price_usd * (1 - PRICE_IMPACT_FACTOR)
        : token.price_usd * (1 + PRICE_IMPACT_FACTOR)
    }));

    await supabase
      .from('tokens')
      .upsert(updates);
  }, []);

  return { updatePrices };
};