import React from 'react';
import { getMiningData } from '../../lib/tokenData';

interface MiningProgressProps {
  symbol: string;
}

export const MiningProgress: React.FC<MiningProgressProps> = ({ symbol }) => {
  const miningData = getMiningData(symbol);

  return (
    <div className="space-y-2">
      <div className="text-xs text-yellow-600">
        <div>Preminted: {miningData.preminted}%</div>
        <div className="flex items-center gap-2">
          <div className="flex-grow h-2 bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-600 to-amber-800"
              style={{ width: `${miningData.minted}%` }}
            />
          </div>
          <span>Minted: {miningData.minted}%</span>
        </div>
      </div>
    </div>
  );
};