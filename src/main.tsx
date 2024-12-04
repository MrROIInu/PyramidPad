import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/supabase';
import { priceManager } from './lib/priceManager';

// Initialize database and price manager
Promise.all([
  initializeDatabase(),
  // Price manager auto-initializes on import
]).catch(console.error);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}