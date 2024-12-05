interface PriceData {
  price: number;
  marketCap: number;
  priceChange24h: number;
  timestamp: number;
}

class PriceCache {
  private static instance: PriceCache;
  private cache: PriceData[] = [];
  private readonly MAX_CACHE_SIZE = 3;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): PriceCache {
    if (!PriceCache.instance) {
      PriceCache.instance = new PriceCache();
    }
    return PriceCache.instance;
  }

  addPrice(data: Omit<PriceData, 'timestamp'>) {
    this.cache.unshift({
      ...data,
      timestamp: Date.now()
    });

    if (this.cache.length > this.MAX_CACHE_SIZE) {
      this.cache.pop();
    }
  }

  getLatestValidPrice(): PriceData | null {
    if (this.cache.length === 0) return null;

    const now = Date.now();
    const validCache = this.cache.find(
      entry => now - entry.timestamp < this.CACHE_DURATION
    );

    return validCache || this.cache[0];
  }

  clearCache() {
    this.cache = [];
  }
}

export const priceCache = PriceCache.getInstance();