import React from 'react';
import { P2PSwap } from './components/P2PSwap';
import { GlyphSwap } from './components/GlyphSwap';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <P2PSwap />
        <div className="my-12 border-t border-yellow-600/30" />
        <GlyphSwap />
      </div>
    </div>
  );
};

export default App;