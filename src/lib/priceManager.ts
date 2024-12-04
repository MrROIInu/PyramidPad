import { supabase } from './supabase';
import { TOKEN_PRICES } from './tokenPrices';
import { Order } from '../types';
import axios from 'axios';
import { TOKENS } from '../data/tokens';

const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order

// Fetch RXD price from CoinGecko
export async function fetchRXDPrice(): Promise<number> {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
      { timeout: 5000 }
    );
    return response.data?.radiant?.usd || 0.001202;
  } catch (error) {
    console.warn('Error fetching RXD price:', error);
    return 0.001202;
  }
}

// Initialize token prices
export async function initializeTokenPrices() {
  try {
    const rxdPrice = await fetchRXDPrice();
    TOKEN_PRICES['RXD'] = rxdPrice;

    // Set initial prices for all tokens at 1:1000 ratio with RXD
    const updates = TOKENS.map(token => {
      const price = rxdPrice / 1000; // Initial price at 1:1000 ratio
      TOKEN_PRICES[token.symbol] = price;
      
      return {
        symbol: token.symbol,
        price_usd: price,
        last_updated: new Date().toISOString()
      };
    });

    // Update prices in database
    const { error } = await supabase
      .from('tokens')
      .upsert(updates, {
        onConflict: 'symbol',
        ignoreDuplicates: false
      });

    if (error) throw error;

    // Start real-time price updates
    startRealtimePriceUpdates();

    return { ...TOKEN_PRICES };
  } catch (error) {
    console.warn('Error initializing token prices:', error);
    return { ...TOKEN_PRICES };
  }
}

// Start real-time price updates
function startRealtimePriceUpdates() {
  // Update RXD price every minute
  setInterval(async () => {
    const rxdPrice = await fetchRXDPrice();
    TOKEN_PRICES['RXD'] = rxdPrice;

    // Update RXD price in database
    await supabase
      .from('tokens')
      .upsert({
        symbol: 'RXD',
        price_usd: rxdPrice,
        last_updated: new Date().toISOString()
      });

    // Update price history
    await supabase
      .from('token_price_history')
      .insert({
        symbol: 'RXD',
        price_usd: rxdPrice,
        timestamp: new Date().toISOString()
      });
  }, 60000);
}

// Update token price after claim
export async function updateTokenPriceAfterClaim(order: Order) {
  try {
    const { from_token, to_token, from_amount, to_amount } = order;
    
    const updates = [];
    
    // Calculate price impact based on order size and direction
    if (from_token !== 'RXD') {
      const currentPrice = TOKEN_PRICES[from_token];
      const newPrice = currentPrice * (1 - PRICE_IMPACT_FACTOR);
      TOKEN_PRICES[from_token] = newPrice;
      updates.push({
        symbol: from_token,
        price_usd: newPrice,
        last_updated: new Date().toISOString()
      });
    }
    
    if (to_token !== 'RXD') {
      const currentPrice = TOKEN_PRICES[to_token];
      const newPrice = currentPrice * (1 + PRICE_IMPACT_FACTOR);
      TOKEN_PRICES[to_token] = newPrice;
      updates.push({
        symbol: to_token,
        price_usd: newPrice,
        last_updated: new Date().toISOString()
      });
    }

    if (updates.length > 0) {
      // Update prices in database
      const { error } = await supabase
        .from('tokens')
        .upsert(updates);

      if (error) throw error;

      // Update price history
      await supabase
        .from('token_price_history')
        .insert(updates.map(update => ({
          symbol: update.symbol,
          price_usd: update.price_usd,
          timestamp: update.last_updated
        })));
    }

    return { ...TOKEN_PRICES };
  } catch (error) {
    console.warn('Error updating token prices:', error);
    return { ...TOKEN_PRICES };
  }
}