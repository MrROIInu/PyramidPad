import React from 'react';
import { TOKENS } from '../data/tokens';
import { TokenCard } from '../components/TokenCard';

export const TokenList: React.FC = () => {
  // Filter out RXD and sort tokens, ensuring RADCAT is first
  const sortedTokens = TOKENS
    .filter(token => token.symbol !== 'RXD')
    .sort((a, b) => {
      if (a.symbol === 'RADCAT') return -1;
      if (b.symbol === 'RADCAT') return 1;
      return a.symbol.localeCompare(b.symbol);
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8">
        RXD20 Token List
      </h1>
      
      <div className="space-y-6">
        {sortedTokens.map(token => (
          <TokenCard key={token.symbol} token={token} />
        ))}
      </div>
    </div>
  );
};