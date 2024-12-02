import { Token } from '../types';
import axios from 'axios';

// Constants
const RXD_TO_TOKEN_RATIO = 1000; // 1 RXD = 1000 tokens
let RXD_PRICE_USD = 0.001202; // Initial price from CoinGecko

// Initialize token prices
export const TOKEN_PRICES: Record<string, number> = {
  'RXD': RXD_PRICE_USD
};

// Calculate initial token price based on RXD ratio
export const calculateTokenPrice = (symbol: string): number => {
  if (symbol === 'RXD') return RXD_PRICE_USD;
  return RXD_PRICE_USD / RXD_TO_TOKEN_RATIO;
};

// Calculate market cap
export const calculateMarketCap = (symbol: string, totalSupply: number): number => {
  const tokenPrice = TOKEN_PRICES[symbol] || calculateTokenPrice(symbol);
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

// Format market cap with appropriate suffix
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
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
      { timeout: 5000 }
    );

    if (response.data?.radiant?.usd) {
      RXD_PRICE_USD = response.data.radiant.usd;
      TOKEN_PRICES['RXD'] = RXD_PRICE_USD;
      
      // Initialize all token prices based on RXD ratio
      TOKENS.forEach(token => {
        if (token.symbol !== 'RXD') {
          TOKEN_PRICES[token.symbol] = RXD_PRICE_USD / RXD_TO_TOKEN_RATIO;
        }
      });
    }
    return { ...TOKEN_PRICES };
  } catch (error) {
    console.warn('Error fetching RXD price:', error);
    return { ...TOKEN_PRICES };
  }
};

// Initialize token prices
export const initializeTokenPrices = (tokens: Token[]): void => {
  tokens.forEach(token => {
    TOKEN_PRICES[token.symbol] = calculateTokenPrice(token.symbol);
  });
  
  // Start periodic price updates
  updateRXDPrice();
  setInterval(updateRXDPrice, 30000); // Update every 30 seconds
};