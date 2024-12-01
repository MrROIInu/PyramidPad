import { Token } from '../types';
import axios from 'axios';

// Constants
export const RXD_FLOOR_PRICE = 0.001; // 1 token = 0.001 RXD
let RXD_PRICE_USD = 0.000894; // Initial price

// Initialize token prices
export const TOKEN_PRICES: Record<string, number> = {
  'RXD': RXD_PRICE_USD
};

// Calculate token price to achieve $20 market cap
export const calculateTokenPrice = (symbol: string, totalSupply: number): number => {
  if (symbol === 'RXD') return RXD_PRICE_USD;
  
  // Target market cap of $20
  const TARGET_MARKET_CAP = 20;
  
  // Calculate price needed to achieve $20 market cap
  return TARGET_MARKET_CAP / totalSupply;
};

// Calculate market cap using total supply
export const calculateMarketCap = (symbol: string, totalSupply: number): number => {
  const tokenPrice = TOKEN_PRICES[symbol] || calculateTokenPrice(symbol, totalSupply);
  return tokenPrice * totalSupply;
};

// Format USD price with up to 12 decimals
export const formatPriceUSD = (price: number): string => {
  if (!price || isNaN(price) || !isFinite(price)) return '$0.000000000000';
  
  // Format with maximum precision
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 12,
    maximumFractionDigits: 12
  }).format(price);

  // Remove trailing zeros after decimal point
  return formatted.replace(/\.?0+$/, '');
};

// Format market cap with appropriate suffix and 2 decimals
export const formatMarketCap = (marketCap: number): string => {
  if (!marketCap || isNaN(marketCap) || !isFinite(marketCap)) return '$0.00';
  
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
      
      // Update all token prices to maintain $20 market cap
      TOKENS.forEach(token => {
        if (token.symbol !== 'RXD') {
          TOKEN_PRICES[token.symbol] = calculateTokenPrice(token.symbol, token.totalSupply);
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
    TOKEN_PRICES[token.symbol] = calculateTokenPrice(token.symbol, token.totalSupply);
  });
};