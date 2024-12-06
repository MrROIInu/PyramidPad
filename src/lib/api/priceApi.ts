import axios from 'axios';
import axiosRetry from 'axios-retry';
import { supabase } from '../supabase';
import { PriceData } from '../../types';

const axiosInstance = axios.create();
axiosRetry(axiosInstance, { 
  retries: 3,
  retryDelay: (retryCount) => retryCount * 2000,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  }
});

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
      const response = await axiosInstance.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'radiant',
            vs_currencies: 'usd',
            include_market_cap: true,
            include_24h_vol: true,
            include_24h_change: true
          },
          timeout: 5000
        }
      );

      if (response.data?.radiant?.usd) {
        const priceData = {
          price: response.data.radiant.usd,
          marketCap: response.data.radiant.usd_market_cap || 0,
          priceChange24h: response.data.radiant.usd_24h_change || 0
        };
        
        cachedPrice = priceData;
        lastUpdate = now;
        
        await savePriceToDatabase(priceData);
        return priceData;
      }
    } catch (error) {
      console.warn('CoinGecko API error, trying CoinMarketCap...');
    }

    // Fallback to CoinMarketCap
    try {
      const response = await axiosInstance.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        {
          params: {
            symbol: 'RXD',
            convert: 'USD'
          },
          headers: {
            'X-CMC_PRO_API_KEY': '0fe637c3-a9ba-4db3-be12-4f4ae7c68006'
          },
          timeout: 5000
        }
      );

      if (response.data?.data?.RXD?.quote?.USD) {
        const quote = response.data.data.RXD.quote.USD;
        const priceData = {
          price: quote.price,
          marketCap: quote.market_cap || 0,
          priceChange24h: quote.percent_change_24h || 0
        };

        cachedPrice = priceData;
        lastUpdate = now;

        await savePriceToDatabase(priceData);
        return priceData;
      }
    } catch (error) {
      console.warn('CoinMarketCap API error, using database price...');
    }

    // Fallback to database price
    const { data: dbPrice } = await supabase
      .from('tokens')
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

    await supabase.from('tokens')
      .upsert({
        symbol: 'RXD',
        price_usd: priceData.price,
        market_cap: priceData.marketCap,
        price_change_24h: priceData.priceChange24h,
        last_updated: timestamp
      });

    await supabase.from('token_price_history')
      .insert({
        symbol: 'RXD',
        price_usd: priceData.price,
        timestamp
      });
  } catch (error) {
    console.error('Error saving price to database:', error);
  }
};