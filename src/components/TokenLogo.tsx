import React from 'react';

interface TokenLogoProps {
  symbol: string;
  imageUrl?: string;
  className?: string;
}

export const TokenLogo: React.FC<TokenLogoProps> = ({ symbol, imageUrl, className = '' }) => {
  if (imageUrl) {
    return (
      <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-white/30 backdrop-blur-sm border-2 border-yellow-600/30 p-2 ${className}`}>
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={`${symbol} logo`}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-32 h-32 bg-yellow-600/20 rounded-full flex items-center justify-center border-2 border-yellow-600/30 ${className} opacity-50`}>
      <span className="text-yellow-600 font-bold text-3xl">
        {symbol.slice(0, 2)}
      </span>
    </div>
  );
};