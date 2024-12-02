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
          </div>
          <p className="text-sm text-yellow-600/80 mt-1">
            Radiant RXD20 Glyph token P2P swaps on chain
          </p>
        </div>
      </div>
    </div>
  );
};