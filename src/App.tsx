import React from 'react';
import { GlyphSwap } from './components/OrderBookSwap';
import { TestLogo } from './components/TestLogo';
import { WalletConnect } from './components/WalletConnect';
import { GlyphSwapLogo } from './components/GlyphSwapLogo';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[url('https://static.wixstatic.com/media/c0fd9f_7a29e6d3a40f4821a14dbe8f93b9d069~mv2.jpg')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen backdrop-blur-sm bg-black/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-8">
            <GlyphSwapLogo />
            <div className="flex items-center gap-4">
              <WalletConnect />
              <TestLogo />
            </div>
          </div>
          <GlyphSwap />
        </div>
        <div className="text-center py-8">
          <a 
            href="https://discord.gg/pwBMDDzWWG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-yellow-600 hover:text-yellow-500 text-lg"
          >
            Join our Discord and help us in developing GlyphSwap
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;