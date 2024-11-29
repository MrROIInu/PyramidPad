import { TOKENS } from '../data/tokens';
import { supabase } from './supabase';
import {
  TOKEN_PRICES,
  TOKEN_MARKET_CAPS,
  initializeTokenPrices,
  formatUSDPrice,
  formatMarketCap,
  calculateTokenPrice,
  calculateMarketCap
} from '../data/tokenSupply';

// Initialize prices on import
initializeTokenPrices(TOKENS);

export {
  TOKEN_PRICES,
  TOKEN_MARKET_CAPS,
  formatUSDPrice as formatPriceUSD,
  formatMarketCap,
  calculateTokenPrice,
  calculateMarketCap
};

// Update token prices in Supabase
export const updateTokenPrices = async () => {
  try {
    const tokenUpdates = TOKENS.map(token => ({
      symbol: token.symbol,
      name: token.name,
      total_supply: token.totalSupply,
      contract_address: token.contractAddress || '94fddcbf9cb28c1d732f725e6b10a5403f7a1d3ca335785154b9ab00689de66f00000000',
      price_usd: TOKEN_PRICES.get(token.symbol) || 0,
      market_cap: TOKEN_MARKET_CAPS.get(token.symbol) || 0
    }));

    const { error } = await supabase
      .from('tokens')
      .upsert(tokenUpdates, { onConflict: 'symbol' });

    if (error) throw error;

    return Object.fromEntries(TOKEN_PRICES);
  } catch (error) {
    console.error('Error updating token prices:', error);
    return Object.fromEntries(TOKEN_PRICES);
  }
};