import React from 'react';

export const GlyphSwapLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="flex items-center h-16">
        <img 
          src="https://static.wixstatic.com/media/c0fd9f_cfacf9e215804e3a8ad37a1f5e0d3f11~mv2.png"
          alt="GlyphSwap Logo"
          className="h-16 w-16 object-contain"
        />
        <div className="flex flex-col ml-4">
          <div className="flex items-center font-red-hat text-white">
            <span className="text-3xl font-bold">
              Glyph
            </span>
            <span className="text-3xl font-normal italic">
              Swap
            </span>
            <span className="ml-2 bg-red-600/20 text-red-500 px-2 py-0.5 rounded-full text-xs font-semibold border border-red-500/30">
              TEST
            </span>
          </div>
          <p className="text-sm text-yellow-600/80 mt-1">
            Radiant RXD20 Glyph Token P2P On-Chain Swaps
          </p>
        </div>
      </div>
    </div>
  );
};