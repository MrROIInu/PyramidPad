import axios from 'axios';

const CG_API_URL = 'https://api.coingecko.com/api/v3';

export const fetchCGData = async () => {
  try {
    const response = await axios.get(`${CG_API_URL}/simple/price`, {
      params: {
        ids: 'radiant',
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_change: true
      }
    });

    if (!response.data?.radiant) {
      throw new Error('No Radiant data found');
    }

    return {
      price: response.data.radiant.usd,
      marketCap: response.data.radiant.usd_market_cap,
      priceChange24h: response.data.radiant.usd_24h_change
    };
  } catch (error) {
    console.warn('CoinGecko API error:', error);
    throw error;
  }
};