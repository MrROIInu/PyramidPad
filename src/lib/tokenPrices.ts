import { Token } from '../types';
import axios from 'axios';

// Constants
export const RXD_FLOOR_PRICE = 0.001; // 1 token = 0.001 RXD
let RXD_PRICE_USD = 0.000894; // Initial price

// Initialize token prices
export const TOKEN_PRICES: Record<string, number> = {
  'RXD': RXD_PRICE_USD
};

// Calculate token price
export const calculateTokenPrice = (symbol: string): number => {
  if (symbol === 'RXD') return RXD_PRICE_USD;
  return RXD_PRICE_USD * RXD_FLOOR_PRICE;
};

// Calculate market cap
export const calculateMarketCap = (symbol: string, totalSupply: number): number => {
  const price = calculateTokenPrice(symbol);
  return price * totalSupply;
};

// Format USD price with 9 decimals
export const formatPriceUSD = (price: number): string => {
  if (!price || isNaN(price) || !isFinite(price)) return '$0.000000000';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 9,
    maximumFractionDigits: 9
  }).format(price);
};

// Format market cap with appropriate suffix
export const formatMarketCap = (marketCap: number): string => {
  if (!marketCap || isNaN(marketCap) || !isFinite(marketCap)) return '$0';
  
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  } else if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  } else if (marketCap >= 1_000) {
    return `$${(marketCap / 1_000).toFixed(2)}K`;
  }
  return `$${marketCap.toFixed(2)}`;
};

// Fetch RXD price from CoinGecko
export const updateRXDPrice = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd');
    if (response.data?.radiant?.usd) {
      RXD_PRICE_USD = response.data.radiant.usd;
      TOKEN_PRICES['RXD'] = RXD_PRICE_USD;
      
      // Update all token prices
      Object.keys(TOKEN_PRICES).forEach(symbol => {
        if (symbol !== 'RXD') {
          TOKEN_PRICES[symbol] = RXD_PRICE_USD * RXD_FLOOR_PRICE;
        }
      });
    }
    return { ...TOKEN_PRICES };
  } catch (error) {
    console.warn('Error fetching RXD price, using fallback price');
    return { ...TOKEN_PRICES };
  }
};

// Initialize token prices
export const initializeTokenPrices = (tokens: Token[]): void => {
  tokens.forEach(token => {
    TOKEN_PRICES[token.symbol] = calculateTokenPrice(token.symbol);
  });
};