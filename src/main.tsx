import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/supabase';
import { initializeTokenPrices } from './lib/tokenPrices';
import { TOKENS } from './data/tokens';

// Initialize token prices and database
initializeTokenPrices(TOKENS);
initializeDatabase().catch(console.error);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}