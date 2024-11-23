import React from 'react';

interface GlyphSwapLogoProps {
  className?: string;
}

export const GlyphSwapLogo: React.FC<GlyphSwapLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center h-32 ${className}`}>
      <img 
        src="https://static.wixstatic.com/media/c0fd9f_cfacf9e215804e3a8ad37a1f5e0d3f11~mv2.png"
        alt="GlyphSwap Logo"
        className="h-24 w-24 object-contain"
      />
      <div className="flex items-center font-red-hat text-white ml-4">
        <span className="text-4xl font-bold">
          Glyph
        </span>
        <span className="text-4xl font-normal italic">
          Swap
        </span>
      </div>
    </div>
  );
};