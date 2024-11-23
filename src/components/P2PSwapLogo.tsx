import React from 'react';

interface P2PSwapLogoProps {
  className?: string;
}

export const P2PSwapLogo: React.FC<P2PSwapLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="flex items-center h-16">
        <img 
          src="https://i.postimg.cc/g0szj3z0/p2p-5806865.png"
          alt="P2PSwap Logo"
          className="h-16 w-16 object-contain"
        />
        <div className="flex items-center font-red-hat text-white ml-4">
          <span className="text-3xl font-bold">
            P2P
          </span>
          <span className="text-3xl font-normal italic">
            Swap
          </span>
        </div>
      </div>
    </div>
  );
};