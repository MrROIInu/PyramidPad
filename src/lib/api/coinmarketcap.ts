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

export const fetchCMCData = async (): Promise<PriceData> => {
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

    const rxdData = response.data.data.RXD;
    if (!rxdData) {
      throw new Error('Invalid CoinMarketCap response');
    }

    return {
      price: rxdData.quote.USD.price,
      marketCap: rxdData.quote.USD.market_cap,
      priceChange24h: rxdData.quote.USD.percent_change_24h
    };
  } catch (error) {
    console.warn('CoinMarketCap API error:', error);
    throw error;
  }
};