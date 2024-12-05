import React from 'react';

export const WalletButton: React.FC = () => {
  return (
    <a 
      href="https://photonic.radiant4people.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:text-yellow-500 transition-colors"
    >
      <img 
        src="https://static.wixstatic.com/shapes/c0fd9f_893a3fcd86f5426eb168724c33fc2630.svg"
        alt="Photonic"
        className="w-5 h-5"
      />
      Photonic Wallet
    </a>
  );
};