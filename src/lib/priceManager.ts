import { supabase } from './supabase';
import { TOKEN_PRICES } from './tokenPrices';
import { Order } from '../types';
import axios from 'axios';
import { TOKENS } from '../data/tokens';
import { priceCache } from './priceCache';

const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order
const BASE_RATIO = 1000; // Base ratio of 1:1000 for RXD to other tokens
const RETRY_DELAY = 2000; // 2 seconds between retries
const MAX_RETRIES = 3;

// Fetch RXD price from CoinGecko with retries
export async function fetchRXDPrice(retries = 0): Promise<number> {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd',
      { timeout: 5000 }
    );
    
    if (response.data?.radiant?.usd) {
      const price = response.data.radiant.usd;
      priceCache.setPrice('RXD', price);
      return price;
    }
    
    // Use cached price if API fails
    return priceCache.getLastValidPrice('RXD');
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchRXDPrice(retries + 1);
    }
    console.warn('Error fetching RXD price:', error);
    return priceCache.getLastValidPrice('RXD');
  }
}

// Initialize token prices
export async function initializeTokenPrices() {
  try {
    const rxdPrice = await fetchRXDPrice();
    TOKEN_PRICES.RXD = rxdPrice;

    // Calculate and set prices for all other tokens
    const updates = TOKENS.map(token => {
      const price = rxdPrice / BASE_RATIO;
      TOKEN_PRICES[token.symbol] = price;
      priceCache.setPrice(token.symbol, price);
      
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

    return { ...TOKEN_PRICES };
  } catch (error) {
    console.warn('Error initializing token prices:', error);
    return TOKEN_PRICES;
  }
}

// Update token price after claim
export async function updateTokenPriceAfterClaim(order: Order) {
  try {
    const rxdPrice = await fetchRXDPrice();
    TOKEN_PRICES.RXD = rxdPrice;

    const { from_token, to_token } = order;
    const updates = [];
    
    // Update prices based on order direction
    if (from_token !== 'RXD') {
      const basePrice = rxdPrice / BASE_RATIO;
      const currentPrice = TOKEN_PRICES[from_token] || basePrice;
      const newPrice = currentPrice * (1 - PRICE_IMPACT_FACTOR);
      TOKEN_PRICES[from_token] = newPrice;
      priceCache.setPrice(from_token, newPrice);
      
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
      priceCache.setPrice(to_token, newPrice);
      
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

    // Update database
    if (updates.length > 0) {
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
    }

    return { ...TOKEN_PRICES };
  } catch (error) {
    console.warn('Error updating token prices:', error);
    return TOKEN_PRICES;
  }
}