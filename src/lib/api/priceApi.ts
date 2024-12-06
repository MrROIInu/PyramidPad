import { PriceData } from '../../types';
import { fetchCGData } from './coingecko';
import { fetchCMCData } from './coinmarketcap';
import { supabase } from '../supabase';

// Cache RXD price data
let cachedPrice: PriceData | null = null;
let lastUpdate: number = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const fetchRXDPrice = async (): Promise<PriceData> => {
  const now = Date.now();
  
  // Return cached price if valid
  if (cachedPrice && (now - lastUpdate) < CACHE_DURATION) {
    return cachedPrice;
  }

  try {
    // Try CoinGecko first
    try {
      const priceData = await fetchCGData();
      cachedPrice = priceData;
      lastUpdate = now;
      await savePriceToDatabase(priceData);
      return priceData;
    } catch (error) {
      console.warn('CoinGecko API error, trying CoinMarketCap...');
    }

    // Fallback to CoinMarketCap
    try {
      const priceData = await fetchCMCData();
      cachedPrice = priceData;
      lastUpdate = now;
      await savePriceToDatabase(priceData);
      return priceData;
    } catch (error) {
      console.warn('CoinMarketCap API error, using database price...');
    }

    // Fallback to database price
    const { data: dbPrice } = await supabase
      .from('rxd20_token_prices')
      .select('price_usd, market_cap, price_change_24h')
      .eq('symbol', 'RXD')
      .single();

    if (dbPrice) {
      const priceData = {
        price: dbPrice.price_usd,
        marketCap: dbPrice.market_cap,
        priceChange24h: dbPrice.price_change_24h
      };

      cachedPrice = priceData;
      lastUpdate = now;
      return priceData;
    }

    // Final fallback
    return {
      price: 0.001202,
      marketCap: 0.001202 * 21000000000,
      priceChange24h: 0
    };
  } catch (error) {
    console.error('Error fetching RXD price:', error);
    throw error;
  }
};

const savePriceToDatabase = async (priceData: PriceData) => {
  try {
    const timestamp = new Date().toISOString();

    await supabase.from('rxd20_token_prices')
      .upsert({
        symbol: 'RXD',
        price_usd: priceData.price,
        market_cap: priceData.marketCap,
        price_change_24h: priceData.priceChange24h,
        last_updated: timestamp,
        last_trade_at: timestamp
      });

    await supabase.from('rxd20_price_history')
      .insert({
        symbol: 'RXD',
        price_usd: priceData.price,
        market_cap: priceData.marketCap,
        timestamp
      });
  } catch (error) {
    console.error('Error saving price to database:', error);
  }
};