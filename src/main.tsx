import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/supabase';
import { updateTokenPrices } from './lib/tokenPrices';

// Initialize database and token prices
Promise.all([
  initializeDatabase(),
  updateTokenPrices()
]).catch(console.error);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}