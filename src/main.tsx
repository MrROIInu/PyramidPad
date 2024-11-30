import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/supabase';
import { initializeTokenPrices, updateRXDPrice } from './lib/tokenPrices';
import { TOKENS } from './data/tokens';

// Initialize token prices and database
updateRXDPrice().then(() => {
  initializeTokenPrices(TOKENS);
  // Update RXD price every 5 minutes
  setInterval(updateRXDPrice, 5 * 60 * 1000);
});

initializeDatabase().catch(console.error);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}