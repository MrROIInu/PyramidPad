export const calculatePriceChange = (currentPrice: number, previousPrice: number): number => {
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};