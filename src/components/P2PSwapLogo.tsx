import React from 'react';

interface P2PSwapLogoProps {
  className?: string;
}

export const P2PSwapLogo: React.FC<P2PSwapLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center h-32 ${className}`}>
      <img 
        src="https://i.postimg.cc/g0szj3z0/p2p-5806865.png"
        alt="P2PSwap Logo"
        className="h-24 w-24 object-contain"
      />
      <div className="flex items-center font-red-hat text-white ml-4">
        <span className="text-4xl font-bold">
          P2P
        </span>
        <span className="text-4xl font-normal italic">
          Swap
        </span>
      </div>
    </div>
  );
};