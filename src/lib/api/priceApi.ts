import { fetchCMCData } from './coinmarketcap';
import { fetchCGData } from './coingecko';
import { supabase } from '../supabase';
import { PriceData } from '../../types';

let lastUpdate: Date | null = null;
const UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes

export const fetchRXDPrice = async (): Promise<PriceData> => {
  try {
    // Try CoinGecko first
    try {
      const cgData = await fetchCGData();
      await savePrice(cgData);
      return cgData;
    } catch (cgError) {
      console.warn('CoinGecko fetch failed, trying CoinMarketCap...');
      
      // Fallback to CoinMarketCap
      try {
        const cmcData = await fetchCMCData();
        await savePrice(cmcData);
        return cmcData;
      } catch (cmcError) {
        console.warn('CoinMarketCap fetch failed, using last saved price...');
        throw cmcError;
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

    // Fallback to default values
    return {
      price: 0.001202,
      marketCap: 0.001202 * 21000000000,
      priceChange24h: 0
    };
  }
};

const savePrice = async (data: PriceData) => {
  try {
    const timestamp = new Date().toISOString();
    lastUpdate = new Date();

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
  } catch (error) {
    console.error('Error saving price:', error);
  }
};