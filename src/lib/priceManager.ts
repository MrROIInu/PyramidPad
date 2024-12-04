import { supabase } from './supabase';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import { TOKENS } from '../data/tokens';
import { Order } from '../types';

const INITIAL_RXD_RATIO = 1000; // 1 RXD = 1000 token units initially
const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order

interface TokenPrices {
  [key: string]: number;
}

class PriceManager {
  private priceSubject = new BehaviorSubject<TokenPrices>({});
  private rxdPrice = 0;

  constructor() {
    this.initializePrices();
    this.startPriceUpdates();
  }

  private async initializePrices() {
    const rxdPrice = await this.fetchRXDPrice();
    if (rxdPrice) {
      this.rxdPrice = rxdPrice;
      const prices: TokenPrices = {
        RXD: rxdPrice
      };

      // Initialize all other tokens at 1:1000 ratio with RXD
      TOKENS.forEach(token => {
        prices[token.symbol] = rxdPrice / INITIAL_RXD_RATIO;
      });

      this.priceSubject.next(prices);
      await this.updateDatabasePrices(prices);
    }
  }

  private async fetchRXDPrice(): Promise<number> {
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

  private async updateDatabasePrices(prices: TokenPrices) {
    const updates = Object.entries(prices).map(([symbol, price]) => ({
      symbol,
      price_usd: price,
      last_updated: new Date().toISOString()
    }));

    await supabase
      .from('tokens')
      .upsert(updates);
  }

  private startPriceUpdates() {
    // Update RXD price every 30 seconds
    setInterval(async () => {
      const newRxdPrice = await this.fetchRXDPrice();
      if (newRxdPrice && newRxdPrice !== this.rxdPrice) {
        this.updatePricesWithNewRXD(newRxdPrice);
      }
    }, 30000);

    // Subscribe to order updates
    supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.claimed) {
            this.handleOrderClaim(payload.new);
          }
        }
      )
      .subscribe();
  }

  private updatePricesWithNewRXD(newRxdPrice: number) {
    const currentPrices = this.priceSubject.value;
    const priceRatio = newRxdPrice / this.rxdPrice;
    
    const newPrices = { ...currentPrices };
    Object.keys(newPrices).forEach(symbol => {
      newPrices[symbol] *= priceRatio;
    });

    this.rxdPrice = newRxdPrice;
    this.priceSubject.next(newPrices);
    this.updateDatabasePrices(newPrices);
  }

  public handleOrderClaim(order: Order) {
    const currentPrices = this.priceSubject.value;
    const newPrices = { ...currentPrices };

    // Decrease price of sold token
    if (order.from_token !== 'RXD') {
      newPrices[order.from_token] *= (1 - PRICE_IMPACT_FACTOR);
    }

    // Increase price of bought token
    if (order.to_token !== 'RXD') {
      newPrices[order.to_token] *= (1 + PRICE_IMPACT_FACTOR);
    }

    this.priceSubject.next(newPrices);
    this.updateDatabasePrices(newPrices);
  }

  public subscribe(callback: (prices: TokenPrices) => void) {
    return this.priceSubject.subscribe(callback);
  }

  public getCurrentPrices(): TokenPrices {
    return this.priceSubject.value;
  }
}

export const priceManager = new PriceManager();