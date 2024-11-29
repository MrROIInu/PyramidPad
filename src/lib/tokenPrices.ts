import { TOKENS } from '../data/tokens';
import { supabase } from './supabase';

// Current RXD price from CoinMarketCap
const RXD_PRICE_USD = 0.000886;
const PHOTON_PER_RXD = 100000000; // 100 million photons per RXD
const PHOTON_TO_RXD_RATIO = 0.001; // 1 photon = 0.001 RXD

// Calculate token price in USD based on total supply ratio
export const calculateTokenPrice = (totalSupply: number): number => {
  return RXD_PRICE_USD * PHOTON_TO_RXD_RATIO;
};

// Calculate market cap in USD
export const calculateMarketCap = (totalSupply: number): number => {
  return calculateTokenPrice(totalSupply) * totalSupply;
};

// Format price to USD string
export const formatPriceUSD = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 9,
    maximumFractionDigits: 9
  }).format(price);
};

// Format market cap
export const formatMarketCap = (marketCap: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 3
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
      market_cap: calculateMarketCap(token.totalSupply)
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