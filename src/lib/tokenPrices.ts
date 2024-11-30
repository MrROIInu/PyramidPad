import { Token } from '../types';
import axios from 'axios';

// Constants
export const RXD_FLOOR_PRICE = 0.001; // 1 token = 0.001 RXD
let RXD_PRICE_USD = 0.000894; // Initial price, will be updated from CoinGecko

// Fetch RXD price from CoinGecko
export const updateRXDPrice = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd');
    if (response.data?.radiant?.usd) {
      RXD_PRICE_USD = response.data.radiant.usd;
      // Update all token prices after RXD price update
      Object.keys(TOKEN_PRICES).forEach(symbol => {
        TOKEN_PRICES[symbol] = calculateTokenPrice(symbol);
      });
    }
    return TOKEN_PRICES;
  } catch (error) {
    console.error('Error fetching RXD price:', error);
    return TOKEN_PRICES;
  }
};

// Calculate token price (1 token = 0.001 RXD)
export const calculateTokenPrice = (symbol: string): number => {
  if (symbol === 'RXD') return RXD_PRICE_USD;
  return RXD_PRICE_USD * RXD_FLOOR_PRICE;
};

// Calculate market cap
export const calculateMarketCap = (symbol: string, totalSupply: number): number => {
  const tokenPrice = calculateTokenPrice(symbol);
  return tokenPrice * totalSupply;
};

// Format USD price with 9 decimals
export const formatPriceUSD = (price: number): string => {
  if (isNaN(price) || !isFinite(price)) return '$0.000000000';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 9,
    maximumFractionDigits: 9
  }).format(price);
};

// Format market cap with appropriate suffix
export const formatMarketCap = (marketCap: number): string => {
  if (isNaN(marketCap) || !isFinite(marketCap)) return '$0';
  
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  } else if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  } else if (marketCap >= 1_000) {
    return `$${(marketCap / 1_000).toFixed(2)}K`;
  }
  return `$${marketCap.toFixed(2)}`;
};

// Calculate and store token prices
export const TOKEN_PRICES: Record<string, number> = {
  'RXD': RXD_PRICE_USD
};

// Initialize token prices
export const initializeTokenPrices = (tokens: Token[]): void => {
  tokens.forEach(token => {
    TOKEN_PRICES[token.symbol] = calculateTokenPrice(token.symbol);
  });
};