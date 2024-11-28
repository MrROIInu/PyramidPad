import React from 'react';

export const WalletButton: React.FC = () => {
  return (
    <button className="flex items-center gap-2 bg-yellow-600/20 text-yellow-600 px-4 py-2 rounded-lg text-sm font-semibold border border-yellow-600/30 hover:bg-yellow-600/30 transition-colors">
      <img 
        src="https://static.wixstatic.com/shapes/c0fd9f_893a3fcd86f5426eb168724c33fc2630.svg"
        alt="Photonic"
        className="w-5 h-5"
      />
      Photonic Wallet
    </button>
  );
};