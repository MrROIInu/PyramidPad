import React from 'react';
import { Token } from '../types';
import { formatPriceUSD } from '../lib/prices/priceFormatter';
import { TokenClaimsInfo } from './TokenClaimsInfo';
import { TokenPriceChart } from './charts/TokenPriceChart';

interface TokenCardProps {
  token: Token;
  onCopy: (address: string) => void;
  isCopied: boolean;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, onCopy, isCopied }) => {
  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
      {/* Existing token info */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <TokenClaimsInfo symbol={token.symbol} />
        <TokenPriceChart symbol={token.symbol} timeframe="1d" />
      </div>
    </div>
  );
};