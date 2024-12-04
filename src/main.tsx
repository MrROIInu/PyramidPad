import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/supabase';
import { initializeTokenPrices } from './lib/priceManager';
import { TOKENS } from './data/tokens';

// Initialize database and token prices
async function initialize() {
  try {
    await initializeDatabase();
    await initializeTokenPrices();
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Run initialization
initialize();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}