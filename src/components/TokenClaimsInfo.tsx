import React from 'react';
import { useTokenClaims } from '../hooks/useTokenClaims';
import { formatPriceUSD } from '../lib/prices/priceFormatter';

interface TokenClaimsInfoProps {
  symbol: string;
}

export const TokenClaimsInfo: React.FC<TokenClaimsInfoProps> = ({ symbol }) => {
  const { claimStats, activity, adjustedPrice } = useTokenClaims(symbol);

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-yellow-600 mb-4">Today's Activity</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-yellow-600/80">Claims Today</p>
          <p className="text-xl font-semibold">{claimStats.count}</p>
        </div>
        
        <div>
          <p className="text-yellow-600/80">Volume</p>
          <p className="text-xl font-semibold">{claimStats.volume.toLocaleString()} {symbol}</p>
        </div>
        
        <div>
          <p className="text-yellow-600/80">Buy Orders</p>
          <p className="text-xl font-semibold text-green-500">+{activity.buys}</p>
        </div>
        
        <div>
          <p className="text-yellow-600/80">Sell Orders</p>
          <p className="text-xl font-semibold text-red-500">-{activity.sells}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-yellow-600/20">
        <div className="flex justify-between items-center">
          <p className="text-yellow-600/80">Adjusted Price</p>
          <p className={`text-xl font-semibold ${
            activity.priceChange > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {formatPriceUSD(adjustedPrice)}
            <span className="text-sm ml-2">
              ({activity.priceChange > 0 ? '+' : ''}{activity.priceChange.toFixed(2)}%)
            </span>
          </p>
        </div>
      </div>

      {claimStats.lastClaimTime && (
        <p className="text-sm text-yellow-600/60 mt-4">
          Last claim: {new Date(claimStats.lastClaimTime).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};