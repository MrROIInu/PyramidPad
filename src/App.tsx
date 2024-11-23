import React, { useState, useEffect } from 'react';
import { GlyphSwap } from './components/GlyphSwap';
import { P2PSwap } from './components/P2PSwap';
import { PyramidPad } from './components/PyramidPad';
import { OrderBookDemo } from './components/OrderBookDemo';
import { BetaLogo } from './components/BetaLogo';
import { TestLogo } from './components/TestLogo';
import { initializeDatabase, updateLiquidityPool } from './lib/database';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'glyphswap' | 'p2pswap' | 'pyramidpad' | 'orderbookdemo'>('glyphswap');

  useEffect(() => {
    // Initialize database and update liquidity pool
    Promise.all([
      initializeDatabase(),
      updateLiquidityPool()
    ]).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[url('https://static.wixstatic.com/media/c0fd9f_7a29e6d3a40f4821a14dbe8f93b9d069~mv2.jpg')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen backdrop-blur-sm bg-black/50">
        {currentPage !== 'orderbookdemo' && <BetaLogo />}
        {currentPage === 'orderbookdemo' && <TestLogo className="absolute top-4 right-4" size="large" />}
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPage('glyphswap')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'glyphswap' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                GlyphSwap
              </button>
              <button
                onClick={() => setCurrentPage('p2pswap')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'p2pswap' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                P2PSwap
              </button>
              <button
                onClick={() => setCurrentPage('pyramidpad')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'pyramidpad' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                PyramidPad
              </button>
              <button
                onClick={() => setCurrentPage('orderbookdemo')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentPage === 'orderbookdemo' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                OrderBookDemo
                <TestLogo size="small" />
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="py-6">
          {currentPage === 'glyphswap' && <GlyphSwap />}
          {currentPage === 'p2pswap' && <P2PSwap />}
          {currentPage === 'pyramidpad' && <PyramidPad />}
          {currentPage === 'orderbookdemo' && <OrderBookDemo />}
        </main>
      </div>
    </div>
  );
};

export default App;