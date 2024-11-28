import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';

// Current RXD price from CoinMarketCap
const RXD_PRICE_USD = 0.0009199;
const PHOTONS_PER_RXD = 100000000;

// Calculate price per photon in USD
const PHOTON_PRICE_USD = RXD_PRICE_USD / PHOTONS_PER_RXD;

export const TOKEN_PRICES: Record<string, number> = {
  [RXD_TOKEN.symbol]: RXD_PRICE_USD
};

// Calculate prices for all tokens based on 1 token = 1 photon
TOKENS.forEach(token => {
  // Each token is worth 1 photon, so price in USD is PHOTON_PRICE_USD
  TOKEN_PRICES[token.symbol] = PHOTON_PRICE_USD;
});

export const formatPriceUSD = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  }).format(price);
};

export const formatMarketCap = (price: number, totalSupply: number): string => {
  const marketCap = price * totalSupply;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(marketCap);
};

export const formatVolume = (volume: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(volume);
};

export const calculateTokenPrices = () => TOKEN_PRICES;