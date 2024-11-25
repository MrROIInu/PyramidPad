// Current DOGE price from CoinMarketCap
const DOGE_PRICE_USD = 0.17;
// Current RXD price from CoinMarketCap (hypothetical)
const RXD_PRICE_USD = 0.25;

import { TOKENS } from '../data/tokens';

// Calculate price ratios based on total supply and RXD price
export const calculateTokenPrices = () => {
  const prices: Record<string, number> = {};
  const rxdToken = TOKENS.find(t => t.symbol === 'RXD');
  
  if (!rxdToken) return prices;

  TOKENS.forEach(token => {
    // Calculate price based on total supply ratio compared to RXD
    const supplyRatio = rxdToken.totalSupply / token.totalSupply;
    prices[token.symbol] = RXD_PRICE_USD * supplyRatio;
  });

  // Override DOGE price with actual market price
  prices['DOGE'] = DOGE_PRICE_USD;

  return prices;
};

export const TOKEN_PRICES = calculateTokenPrices();

// Calculate percentage change from previous price
export const calculatePriceChange = (currentPrice: number, previousPrice: number): number => {
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};

// Format price to USD string
export const formatPriceUSD = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  }).format(price);
};

// Format market cap
export const formatMarketCap = (price: number, totalSupply: number): string => {
  const marketCap = price * totalSupply;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(marketCap);
};

// Format volume
export const formatVolume = (volume: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(volume);
};

// Calculate time since launch
export const calculateAge = (launchDate: Date): string => {
  const days = Math.floor((Date.now() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
  return `${days}d`;
};