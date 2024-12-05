import { supabase } from '../supabase';
import { TOKENS } from '../../data/tokens';
import { fetchRXDPrice } from '../api/priceApi';

const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order

export const updateTokenPrices = async () => {
  try {
    // Get current prices from database
    const { data: currentPrices } = await supabase
      .from('tokens')
      .select('symbol, price_usd')
      .order('last_updated', { ascending: false });

    if (!currentPrices?.length) {
      return false;
    }

    // Get latest RXD price
    const rxdData = await fetchRXDPrice();
    const rxdPrice = rxdData.price;

    // Update prices with small random variations
    const updates = currentPrices.map(token => {
      const currentPrice = token.price_usd;
      const randomChange = (Math.random() - 0.5) * PRICE_IMPACT_FACTOR;
      const newPrice = currentPrice * (1 + randomChange);
      
      return {
        symbol: token.symbol,
        price_usd: token.symbol === 'RXD' ? rxdPrice : newPrice,
        market_cap: token.symbol === 'RXD' 
          ? rxdPrice * 21000000000 
          : newPrice * (TOKENS.find(t => t.symbol === token.symbol)?.totalSupply || 0),
        last_updated: new Date().toISOString()
      };
    });

    // Update token prices
    const { error: updateError } = await supabase
      .from('tokens')
      .upsert(updates, { onConflict: 'symbol' });

    if (updateError) {
      throw updateError;
    }

    // Insert price history
    const historyData = updates.map(token => ({
      symbol: token.symbol,
      price_usd: token.price_usd,
      timestamp: token.last_updated
    }));

    await supabase
      .from('token_price_history')
      .insert(historyData);

    return true;
  } catch (error) {
    console.error('Error updating token prices:', error);
    return false;
  }
};