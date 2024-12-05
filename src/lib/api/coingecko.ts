import axios from 'axios';
import axiosRetry from 'axios-retry';
import { PriceData } from '../../types';

const axiosInstance = axios.create();
axiosRetry(axiosInstance, { 
  retries: 3,
  retryDelay: (retryCount) => retryCount * 2000,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
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
        },
        timeout: 5000
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