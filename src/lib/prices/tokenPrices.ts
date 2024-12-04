// Initialize token prices map
export const TOKEN_PRICES: Record<string, number> = {};

// Export a function to get a token's price with fallback
export const getTokenPrice = (symbol: string): number => {
  return TOKEN_PRICES[symbol] || 0;
};

// Export a function to set a token's price
export const setTokenPrice = (symbol: string, price: number): void => {
  TOKEN_PRICES[symbol] = price;
};