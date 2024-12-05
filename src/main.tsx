import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/supabase';
import { startPriceUpdates } from './lib/prices/rxdPriceManager';

// Initialize database and start price updates
const initialize = async () => {
  try {
    await initializeDatabase();
    startPriceUpdates();
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