import React, { useState, useCallback } from 'react';

export const WalletConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  const connectToPhotonic = useCallback(async () => {
    try {
      if (!(window as any).photonic) {
        window.open('https://photonic.radiant4people.com/', '_blank');
        return;
      }

      const result = await (window as any).photonic.connect();
      if (result.success) {
        setIsConnected(true);
        setAddress(result.address);
      }
    } catch (error) {
      console.error('Failed to connect to Photonic Wallet:', error);
      window.open('https://photonic.radiant4people.com/', '_blank');
    }
  }, []);

  const handleConnect = () => {
    if (isConnected) {
      setIsConnected(false);
      setAddress('');
    } else {
      connectToPhotonic();
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 bg-yellow-600/20 text-yellow-600 px-3 py-1 rounded-lg text-sm font-semibold border border-yellow-600/30 hover:bg-yellow-600/30 transition-colors"
    >
      <img 
        src="https://static.wixstatic.com/shapes/c0fd9f_893a3fcd86f5426eb168724c33fc2630.svg"
        alt=""
        className="w-4 h-4"
      />
      {isConnected ? address : 'Photonic Wallet'}
    </button>
  );
};