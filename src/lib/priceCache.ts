import { supabase } from './supabase';

interface PriceCache {
  [symbol: string]: {
    price: number;
    timestamp: number;
    history: number[];
  }
}

class TokenPriceCache {
  private static instance: TokenPriceCache;
  private cache: PriceCache = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_HISTORY = 3;

  private constructor() {}

  static getInstance(): TokenPriceCache {
    if (!TokenPriceCache.instance) {
      TokenPriceCache.instance = new TokenPriceCache();
    }
    return TokenPriceCache.instance;
  }

  setPrice(symbol: string, price: number) {
    const current = this.cache[symbol];
    const history = current?.history || [];
    
    this.cache[symbol] = {
      price,
      timestamp: Date.now(),
      history: [price, ...history].slice(0, this.MAX_HISTORY)
    };
  }

  getPrice(symbol: string): number | null {
    const cached = this.cache[symbol];
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_DURATION) {
      // Return latest historical price if cache is expired
      return cached.history[0] || null;
    }

    return cached.price;
  }

  getLastValidPrice(symbol: string): number {
    const cached = this.cache[symbol];
    if (!cached) return 0.001202; // Default fallback price

    // Return first non-zero price from history, or fallback
    return cached.history.find(price => price > 0) || 0.001202;
  }

  async loadHistoricalPrices() {
    try {
      const { data } = await supabase
        .from('token_price_history')
        .select('symbol, price_usd, timestamp')
        .order('timestamp', { ascending: false })
        .limit(3);

      if (data) {
        data.forEach(({ symbol, price_usd }) => {
          if (!this.cache[symbol]) {
            this.cache[symbol] = {
              price: price_usd,
              timestamp: Date.now(),
              history: [price_usd]
            };
          }
        });
      }
    } catch (error) {
      console.warn('Error loading historical prices:', error);
    }
  }
}

export const priceCache = TokenPriceCache.getInstance();