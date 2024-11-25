import React, { useState, useEffect } from 'react';
import { GlyphSwap } from './components/GlyphSwap';
import { P2PSwap } from './components/P2PSwap';
import { PyramidPad } from './components/PyramidPad';
import { OrderBookSwap } from './components/OrderBookSwap';
import { BetaLogo } from './components/BetaLogo';
import { TestLogo } from './components/TestLogo';
import { WalletConnect } from './components/WalletConnect';
import { initializeDatabase, updateLiquidityPool } from './lib/database';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'glyphswap' | 'p2pswap' | 'pyramidpad' | 'orderbookswap'>('glyphswap');

  useEffect(() => {
    Promise.all([
      initializeDatabase(),
      updateLiquidityPool()
    ]).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[url('https://static.wixstatic.com/media/c0fd9f_7a29e6d3a40f4821a14dbe8f93b9d069~mv2.jpg')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen backdrop-blur-sm bg-black/50">
        {currentPage !== 'orderbookswap' && <BetaLogo />}
        {currentPage === 'orderbookswap' && <TestLogo className="absolute top-4 right-4" size="large" />}

        <nav className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1 md:gap-2">
              <button
                onClick={() => setCurrentPage('glyphswap')}
                className={`px-2 md:px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'glyphswap' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                GlyphSwap
              </button>
              <button
                onClick={() => setCurrentPage('p2pswap')}
                className={`px-2 md:px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'p2pswap' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                P2PSwap
              </button>
              <button
                onClick={() => setCurrentPage('pyramidpad')}
                className={`px-2 md:px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'pyramidpad' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                PyramidPad
              </button>
              <button
                onClick={() => setCurrentPage('orderbookswap')}
                className={`px-2 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentPage === 'orderbookswap' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                OrderBookSwap
                <TestLogo size="small" />
              </button>
            </div>
            <WalletConnect />
          </div>
        </nav>

        <main className="py-6">
          {currentPage === 'glyphswap' && <GlyphSwap />}
          {currentPage === 'p2pswap' && <P2PSwap />}
          {currentPage === 'pyramidpad' && <PyramidPad />}
          {currentPage === 'orderbookswap' && <OrderBookSwap />}
        </main>
      </div>
    </div>
  );
};

export default App;