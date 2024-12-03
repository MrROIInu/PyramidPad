import { Token } from '../types';

// Initialize token prices map
export const TOKEN_PRICES: Record<string, number> = {};

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

// Calculate RXD ratio for a token
export const calculateRXDRatio = (tokenPrice: number, rxdPrice: number): string => {
  if (!tokenPrice || !rxdPrice) return '1:0';
  const ratio = rxdPrice / tokenPrice;
  return ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;
};