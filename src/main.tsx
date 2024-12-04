import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/supabase';
import { initializeTokenPrices } from './lib/priceManager';

// Initialize database and token prices
const initialize = async () => {
  try {
    // First initialize database
    await initializeDatabase();
    
    // Then initialize token prices
    await initializeTokenPrices();
  } catch (error) {
    console.warn('Initialization error:', error);
  }
};

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