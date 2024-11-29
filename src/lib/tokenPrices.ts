// Constants
export const RXD_PRICE_USD = 0.000894;
export const GLYPH_TO_RXD_RATIO = 0.001; // 1 glyph = 0.001 RXD

// Calculate USD price of a glyph token
export const calculateGlyphTokenUsdPrice = (): number => {
  return RXD_PRICE_USD * GLYPH_TO_RXD_RATIO; // Should be 0.000000894
};

// Calculate market cap for a token
export const calculateMarketCap = (totalSupply: number): number => {
  const tokenPrice = calculateGlyphTokenUsdPrice();
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
  if (isNaN(marketCap) || !isFinite(marketCap)) return '$0.00';
  
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
    if (token.symbol === 'RXD') {
      TOKEN_PRICES[token.symbol] = RXD_PRICE_USD;
    } else {
      // Each token's price is based on the RXD exchange rate
      const tokenPrice = calculateGlyphTokenUsdPrice();
      TOKEN_PRICES[token.symbol] = tokenPrice;
    }
  });
};