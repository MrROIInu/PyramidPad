import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/database/initialize';

// Initialize database
const initialize = async () => {
  try {
    await initializeDatabase();
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