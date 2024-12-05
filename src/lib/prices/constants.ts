// Base ratio between RXD and other tokens (1:1000)
export const BASE_RATIO = 1000;

// Price impact percentage per order (0.1%)
export const PRICE_IMPACT_FACTOR = 0.001;

// Price update interval in milliseconds
export const PRICE_UPDATE_INTERVAL = 30000; // 30 seconds

// Maximum number of retries for price fetching
export const MAX_RETRIES = 3;

// Delay between retries in milliseconds
export const RETRY_DELAY = 2000; // 2 seconds

// Default fallback price if all else fails
export const DEFAULT_PRICE = 0.001202;

// Initial price history window (7 days worth of data points)
export const INITIAL_HISTORY_POINTS = 168;