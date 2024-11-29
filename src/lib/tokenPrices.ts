import { TOKENS } from '../data/tokens';
import { supabase } from './supabase';

// Current RXD price from CoinMarketCap
const RXD_PRICE_USD = 0.000886;

// Calculate token price in USD based on total supply ratio
export const calculateTokenPrice = (totalSupply: number): number => {
  const rxdTotalSupply = 21000000; // RXD total supply
  return (RXD_PRICE_USD * rxdTotalSupply) / totalSupply;
};

// Calculate market cap in USD
export const calculateMarketCap = (price: number, totalSupply: number): number => {
  return price * totalSupply;
};

// Format price to USD string
export const formatPriceUSD = (price: number): string => {
  if (isNaN(price) || !isFinite(price)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 9,
    maximumFractionDigits: 9
  }).format(price);
};

// Format market cap
export const formatMarketCap = (price: number, totalSupply: number): string => {
  const marketCap = calculateMarketCap(price, totalSupply);
  if (isNaN(marketCap) || !isFinite(marketCap)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    notation: 'compact',
    compactDisplay: 'short'
  }).format(marketCap);
};

// Calculate token prices for all tokens
export const TOKEN_PRICES = Object.fromEntries(
  TOKENS.map(token => [
    token.symbol,
    calculateTokenPrice(token.totalSupply)
  ])
);

// Update token prices in Supabase
export const updateTokenPrices = async () => {
  try {
    const tokenUpdates = TOKENS.map(token => ({
      symbol: token.symbol,
      name: token.name,
      total_supply: token.totalSupply,
      contract_address: token.contractAddress,
      price_usd: calculateTokenPrice(token.totalSupply),
      market_cap: calculateMarketCap(calculateTokenPrice(token.totalSupply), token.totalSupply)
    }));

    const { error } = await supabase
      .from('tokens')
      .upsert(tokenUpdates, { onConflict: 'symbol' });

    if (error) throw error;

    return TOKEN_PRICES;
  } catch (error) {
    console.error('Error updating token prices:', error);
    return TOKEN_PRICES;
  }
};