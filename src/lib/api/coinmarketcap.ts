import axios from 'axios';

const CMC_API_KEY = '0fe637c3-a9ba-4db3-be12-4f4ae7c68006';
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1';

interface CMCQuote {
  price: number;
  market_cap: number;
  percent_change_24h: number;
}

interface CMCResponse {
  data: {
    [key: string]: {
      quote: {
        USD: CMCQuote;
      };
    };
  };
}

export const fetchCMCData = async () => {
  try {
    const response = await axios.get<CMCResponse>(`${CMC_API_URL}/cryptocurrency/quotes/latest`, {
      params: {
        symbol: 'RXD',
        convert: 'USD'
      },
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY
      }
    });

    const rxdData = response.data.data.RXD;
    if (!rxdData) throw new Error('No RXD data found');

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