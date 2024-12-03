import React, { useState } from 'react';
import { TOKENS } from '../data/tokens';
import { TokenCard } from '../components/TokenCard';
import { CollectionChart } from '../components/CollectionChart';
import { RXD_TOKEN } from '../constants/tokens';

export const TokenList: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Sort tokens to ensure RADCAT is first
  const sortedTokens = [...TOKENS]
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
      
      <div className="grid gap-4 mb-12">
        {sortedTokens.map((token, index) => (
          <TokenCard
            key={token.symbol}
            token={token}
            onCopy={(text) => handleCopy(text, index)}
            isCopied={copiedIndex === index}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <img 
          src={RXD_TOKEN.imageUrl} 
          alt="RXD" 
          className="w-8 h-8 rounded-full"
        />
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
          Radiant RXD20 Glyph Token Chart
        </h2>
      </div>
      <CollectionChart />
    </div>
  );
};