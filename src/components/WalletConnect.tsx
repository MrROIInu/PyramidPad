import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  const handleConnect = () => {
    if (isConnected) {
      setIsConnected(false);
      setAddress('');
    } else {
      // Simulate wallet connection
      setIsConnected(true);
      setAddress('0x1234...5678');
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 bg-yellow-600/20 text-yellow-600 px-3 py-1 rounded-lg text-sm font-semibold border border-yellow-600/30 hover:bg-yellow-600/30 transition-colors"
    >
      <Wallet size={16} />
      {isConnected ? address : 'Connect Wallet'}
    </button>
  );
};