import { fetchCGData } from './coingecko';
import { fetchCMCData } from './coinmarketcap';
import { priceCache } from './priceCache';
import { PriceData } from '../../types';

// Main price fetching function with fallback logic
export const fetchRXDPrice = async (): Promise<PriceData> => {
  try {
    // Try CoinGecko first
    const cgData = await fetchCGData();
    priceCache.addPrice(cgData);
    return cgData;
  } catch (cgError) {
    console.warn('CoinGecko fetch failed, trying CoinMarketCap...');
    
    try {
      // Fallback to CoinMarketCap
      const cmcData = await fetchCMCData();
      priceCache.addPrice(cmcData);
      return cmcData;
    } catch (cmcError) {
      console.warn('All API attempts failed, using cached data...');
      
      // Use cached data as last resort
      const cachedData = priceCache.getLatestValidPrice();
      if (cachedData) {
        return cachedData;
      }
      
      // If no cached data, return default values
      return {
        price: 0.001202,
        marketCap: 0.001202 * 21000000000,
        priceChange24h: 0
      };
    }
  }
};