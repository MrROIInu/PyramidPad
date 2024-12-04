import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/supabase';
import { initializeTokenPrices } from './lib/priceManager';

// Initialize database and token prices sequentially
async function initialize() {
  try {
    // First initialize database
    await initializeDatabase();
    
    // Then initialize token prices
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