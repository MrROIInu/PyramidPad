import { supabase } from './supabase';
import { TOKEN_PRICES } from './tokenPrices';
import { Order } from '../types';
import axios from 'axios';
import { TOKENS } from '../data/tokens';

const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order
const BASE_RATIO = 1000; // Base ratio of 1:1000 for RXD to other tokens

// Fetch RXD price from CoinGecko
export async function fetchRXDPrice(): Promise<number> {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
      { timeout: 5000 }
    );
    
    if (response.data?.radiant?.usd) {
      return response.data.radiant.usd;
    }
    
    throw new Error('Invalid RXD price response');
  } catch (error) {
    console.error('Error fetching RXD price:', error);
    return 0.001202; // Fallback price if API fails
  }
}

// Initialize token prices
export async function initializeTokenPrices() {
  try {
    const rxdPrice = await fetchRXDPrice();
    if (!rxdPrice) return TOKEN_PRICES;

    // Set RXD price
    TOKEN_PRICES.RXD = rxdPrice;

    // Calculate and set prices for all other tokens
    const updates = TOKENS.map(token => {
      const price = rxdPrice / BASE_RATIO;
      TOKEN_PRICES[token.symbol] = price;
      
      return {
        symbol: token.symbol,
        price_usd: price,
        market_cap: price * token.totalSupply,
        last_updated: new Date().toISOString()
      };
    });

    // Add RXD to updates
    updates.push({
      symbol: 'RXD',
      price_usd: rxdPrice,
      market_cap: rxdPrice * 21000000000,
      last_updated: new Date().toISOString()
    });

    // Update database
    const { error } = await supabase
      .from('tokens')
      .upsert(updates, {
        onConflict: 'symbol'
      });

    if (error) throw error;

    // Update price history
    await supabase
      .from('token_price_history')
      .insert(updates.map(update => ({
        symbol: update.symbol,
        price_usd: update.price_usd,
        timestamp: update.last_updated
      })));

    return { ...TOKEN_PRICES };
  } catch (error) {
    console.error('Error initializing token prices:', error);
    return TOKEN_PRICES;
  }
}

// Update token price after claim
export async function updateTokenPriceAfterClaim(order: Order) {
  try {
    const rxdPrice = await fetchRXDPrice();
    if (!rxdPrice) return TOKEN_PRICES;

    const { from_token, to_token } = order;
    const updates = [];
    
    // Update RXD price first
    TOKEN_PRICES.RXD = rxdPrice;
    updates.push({
      symbol: 'RXD',
      price_usd: rxdPrice,
      market_cap: rxdPrice * 21000000000,
      last_updated: new Date().toISOString()
    });

    // Calculate price impact based on order size and direction
    if (from_token !== 'RXD') {
      const basePrice = rxdPrice / BASE_RATIO;
      const currentPrice = TOKEN_PRICES[from_token] || basePrice;
      const newPrice = currentPrice * (1 - PRICE_IMPACT_FACTOR);
      TOKEN_PRICES[from_token] = newPrice;
      
      const token = TOKENS.find(t => t.symbol === from_token);
      if (token) {
        updates.push({
          symbol: from_token,
          price_usd: newPrice,
          market_cap: newPrice * token.totalSupply,
          last_updated: new Date().toISOString()
        });
      }
    }
    
    if (to_token !== 'RXD') {
      const basePrice = rxdPrice / BASE_RATIO;
      const currentPrice = TOKEN_PRICES[to_token] || basePrice;
      const newPrice = currentPrice * (1 + PRICE_IMPACT_FACTOR);
      TOKEN_PRICES[to_token] = newPrice;
      
      const token = TOKENS.find(t => t.symbol === to_token);
      if (token) {
        updates.push({
          symbol: to_token,
          price_usd: newPrice,
          market_cap: newPrice * token.totalSupply,
          last_updated: new Date().toISOString()
        });
      }
    }

    if (updates.length > 0) {
      // Update database
      const { error } = await supabase
        .from('tokens')
        .upsert(updates, {
          onConflict: 'symbol'
        });

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
    console.error('Error updating token prices:', error);
    return TOKEN_PRICES;
  }
}