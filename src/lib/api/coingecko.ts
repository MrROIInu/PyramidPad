import axios from 'axios';

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    'Accept': 'application/json'
  }
});

export const fetchCGData = async () => {
  try {
    const response = await axiosInstance.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'radiant',
          vs_currencies: 'usd',
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
      priceChange24h: response.data.radiant.usd_24h_change || 0
    };
  } catch (error) {
    console.warn('CoinGecko API error:', error);
    // Return fallback values
    return {
      price: 0.001202,
      priceChange24h: 0
    };
  }
};