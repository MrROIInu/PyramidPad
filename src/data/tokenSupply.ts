import { Token } from '../types';

// RXD token data
export const RXD_SUPPLY = {
  total: 21000000000,
  circulating: 12180000000
};

// Current RXD price from CoinMarketCap
export const RXD_PRICE_USD = 0.000886;

// Exchange rate: 1 glyph = 0.001 RXD
export const GLYPH_TO_RXD_RATIO = 0.001;

// Calculate token price in USD based on RXD price and exchange rate
export const calculateTokenPrice = (totalSupply: number): number => {
  // Price calculation using RXD price and exchange rate
  // 1 glyph = 0.001 RXD, so multiply RXD price by this ratio
  return RXD_PRICE_USD * GLYPH_TO_RXD_RATIO;
};

// Calculate market cap for a token
export const calculateMarketCap = (totalSupply: number): number => {
  const tokenPrice = calculateTokenPrice(totalSupply);
  return tokenPrice * totalSupply;
};

// Format USD price with 9 decimals
export const formatUSDPrice = (price: number): string => {
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

// Pre-calculate prices for all tokens
export const TOKEN_PRICES = new Map<string, number>();
export const TOKEN_MARKET_CAPS = new Map<string, number>();

export const initializeTokenPrices = (tokens: Token[]): void => {
  // Set RXD price
  TOKEN_PRICES.set('RXD', RXD_PRICE_USD);
  TOKEN_MARKET_CAPS.set('RXD', RXD_PRICE_USD * RXD_SUPPLY.circulating);

  // Calculate prices and market caps for all other tokens
  tokens.forEach(token => {
    if (token.symbol === 'RXD') return;
    
    const price = calculateTokenPrice(token.totalSupply);
    const marketCap = calculateMarketCap(token.totalSupply);
    
    TOKEN_PRICES.set(token.symbol, price);
    TOKEN_MARKET_CAPS.set(token.symbol, marketCap);
  });
};