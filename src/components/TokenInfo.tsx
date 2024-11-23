import React from 'react';
import { Coins, Users, Wallet, BarChart } from 'lucide-react';

interface TokenInfoProps {
  totalSupply: string;
  presalePrice: string;
  softCap: string;
  hardCap: string;
}

export const TokenInfo: React.FC<TokenInfoProps> = ({
  totalSupply,
  presalePrice,
  softCap,
  hardCap,
}) => {
  const metrics = [
    { icon: Coins, label: 'Total Supply', value: totalSupply },
    { icon: Wallet, label: 'Presale Price', value: presalePrice },
    { icon: Users, label: 'Soft Cap', value: softCap },
    { icon: BarChart, label: 'Hard Cap', value: hardCap },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {metrics.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Icon className="text-yellow-600" size={24} />
            <div>
              <p className="text-sm text-yellow-600">{label}</p>
              <p className="text-xl font-semibold text-white">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};