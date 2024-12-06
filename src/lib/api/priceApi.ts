import { fetchCMCData } from './coinmarketcap';
import { fetchCGData } from './coingecko';
import { supabase } from '../supabase';
import { PriceData } from '../../types';

let lastUpdate: Date | null = null;
const UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes
const DEFAULT_RXD_PRICE = 0.001202;

export const fetchRXDPrice = async (): Promise<PriceData> => {
  try {
    // Check if we need to update
    const now = new Date();
    if (lastUpdate && (now.getTime() - lastUpdate.getTime()) < UPDATE_INTERVAL) {
      // Get latest price from database
      const { data } = await supabase
        .from('tokens')
        .select('price_usd, market_cap, price_change_24h')
        .eq('symbol', 'RXD')
        .single();

      if (data?.price_usd) {
        return {
          price: data.price_usd,
          marketCap: data.market_cap || data.price_usd * 21000000000,
          priceChange24h: data.price_change_24h || 0
        };
      }
    }

    // Try CoinMarketCap first
    try {
      const cmcData = await fetchCMCData();
      await savePrice(cmcData);
      return cmcData;
    } catch (cmcError) {
      console.warn('CoinMarketCap fetch failed, trying CoinGecko...');
      
      // Fallback to CoinGecko
      try {
        const cgData = await fetchCGData();
        await savePrice(cgData);
        return cgData;
      } catch (cgError) {
        console.warn('CoinGecko fetch failed, using last saved price...');
        throw cgError;
      }
    }
  } catch (error) {
    // Get latest saved price
    const { data } = await supabase
      .from('tokens')
      .select('price_usd, market_cap, price_change_24h')
      .eq('symbol', 'RXD')
      .single();

    if (data?.price_usd) {
      return {
        price: data.price_usd,
        marketCap: data.market_cap || data.price_usd * 21000000000,
        priceChange24h: data.price_change_24h || 0
      };
    }

    // Fallback to default values if no saved price
    return {
      price: DEFAULT_RXD_PRICE,
      marketCap: DEFAULT_RXD_PRICE * 21000000000,
      priceChange24h: 0
    };
  }
};

const savePrice = async (data: PriceData) => {
  try {
    const timestamp = new Date().toISOString();

    // Save to tokens table
    await supabase
      .from('tokens')
      .upsert({
        symbol: 'RXD',
        price_usd: data.price,
        market_cap: data.marketCap,
        price_change_24h: data.priceChange24h,
        last_updated: timestamp
      });

    // Save to price history
    await supabase
      .from('token_price_history')
      .insert({
        symbol: 'RXD',
        price_usd: data.price,
        timestamp
      });

    lastUpdate = new Date();
  } catch (error) {
    console.error('Error saving price:', error);
  }
};