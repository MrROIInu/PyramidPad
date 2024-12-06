import { PriceData } from '../../types';
import { createRetryAxios } from './retryAxios';

const axiosInstance = createRetryAxios({
  retries: 3,
  retryDelay: 2000,
  shouldRetry: (error) => {
    return error.response?.status === 429 || !error.response;
  }
});

export const fetchCGData = async (): Promise<PriceData> => {
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
        }
      }
    );

    if (!response.data?.radiant?.usd) {
      throw new Error('Invalid CoinGecko response');
    }

    return {
      price: response.data.radiant.usd,
      marketCap: response.data.radiant.usd_market_cap || 0,
      priceChange24h: response.data.radiant.usd_24h_change || 0
    };
  } catch (error) {
    console.warn('CoinGecko API error:', error);
    throw error;
  }
};