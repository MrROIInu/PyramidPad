import axios from 'axios';
import { supabase } from '../supabase';
import { TOKEN_PRICES, setTokenPrice } from './tokenPrices';
import { TOKENS } from '../../data/tokens';

const BASE_RATIO = 1000; // 1:1000 ratio for RXD to other tokens

export async function fetchRXDPrice(): Promise<number> {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
      { timeout: 5000 }
    );

    if (response.data?.radiant?.usd) {
      return response.data.radiant.usd;
    }
    
    throw new Error('Invalid price data');
  } catch (error) {
    console.warn('Error fetching RXD price:', error);
    // Fallback to last known price from database
    const { data } = await supabase
      .from('tokens')
      .select('price_usd')
      .eq('symbol', 'RXD')
      .single();
      
    return data?.price_usd || 0.001202; // Default fallback price
  }
}

export async function updateTokenPrices(): Promise<void> {
  try {
    const rxdPrice = await fetchRXDPrice();
    setTokenPrice('RXD', rxdPrice);

    // Calculate base prices for all tokens based on RXD price
    const updates = TOKENS.map(token => {
      const basePrice = rxdPrice / BASE_RATIO;
      setTokenPrice(token.symbol, basePrice);
      
      return {
        symbol: token.symbol,
        price_usd: basePrice,
        market_cap: basePrice * token.totalSupply,
        last_updated: new Date().toISOString()
      };
    });

    // Add RXD price update
    updates.push({
      symbol: 'RXD',
      price_usd: rxdPrice,
      market_cap: rxdPrice * 21000000000, // RXD total supply
      last_updated: new Date().toISOString()
    });

    // Update database
    await Promise.all([
      supabase.from('tokens').upsert(updates),
      supabase.from('token_price_history').insert(
        updates.map(({ symbol, price_usd, last_updated }) => ({
          symbol,
          price_usd,
          timestamp: last_updated
        }))
      )
    ]);
  } catch (error) {
    console.error('Error updating token prices:', error);
  }
}

let priceUpdateInterval: NodeJS.Timeout;

export function startPriceUpdates(): void {
  // Update prices immediately
  updateTokenPrices();
  
  // Then update every 30 seconds
  priceUpdateInterval = setInterval(updateTokenPrices, 30000);
}

export function stopPriceUpdates(): void {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
  }
}