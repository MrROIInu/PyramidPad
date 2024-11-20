import React from 'react';

interface P2PSwapLogoProps {
  className?: string;
}

export const P2PSwapLogo: React.FC<P2PSwapLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="https://i.postimg.cc/g0szj3z0/p2p-5806865.png"
        alt="P2PSwap Logo"
        className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
      />
      <div className="flex items-center font-red-hat text-white ml-4">
        <span className="text-3xl sm:text-4xl font-bold">
          P2P
        </span>
        <span className="text-3xl sm:text-4xl font-normal italic">
          Swap
        </span>
      </div>
    </div>
  );
};