import React from 'react';
import { PieChart } from 'lucide-react';

interface Distribution {
  development: number;
  marketing: number;
  airdrop: number;
  presale: number;
}

interface TokenDistributionProps {
  totalSupply: string;
  distribution: Distribution;
}

export const TokenDistribution: React.FC<TokenDistributionProps> = ({
  totalSupply,
  distribution
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="text-yellow-600" />
        <h3 className="text-xl font-semibold text-yellow-600">Token Distribution</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-yellow-600">Total Supply</p>
        <p className="text-xl font-semibold text-white">{totalSupply}</p>
      </div>

      <div className="space-y-3">
        {Object.entries(distribution).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-yellow-600/80 capitalize">{key}</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-amber-800"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-white font-medium w-12 text-right">{value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};