import React, { useState, useCallback } from 'react';
import { Wallet } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  const connectToPhotonic = useCallback(async () => {
    try {
      // Check if Photonic Wallet is available
      if (!(window as any).photonic) {
        window.open('https://photonic.radiant4people.com/', '_blank');
        return;
      }

      // Request connection
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
      <Wallet size={16} />
      {isConnected ? address : 'Connect Photonic'}
    </button>
  );
};