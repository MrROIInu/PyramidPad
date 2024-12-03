import React, { useState } from 'react';
import { TOKENS } from '../data/tokens';
import { TokenCard } from '../components/TokenCard';
import { CollectionChart } from '../components/CollectionChart';
import { RXD_TOKEN } from '../constants/tokens';

const PREMINTED_AMOUNTS: Record<string, number> = {
  "RADCAT": 0,
  "PILIM": 0,
  "FUGAZI": 210000,
  "GLYPH": 100000000,
  "RAD": 0,
  "KEKW": 0,
  "PEPE": 0,
  "DOGE": 0,
  "φῶς": 27594,
  "NEP": 0,
  "DJANGO": 777777,
  "BTC": 2100000,
  "SERPENTX": 6025,
  "COPIUM": 5000000,
  "RADMALLOW": 0,
  "MERI": 0,
  "SPIN": 83080,
  "DIABLO": 0,
  "HOPIUM": 0,
  "RGB": 2190000000,
  "ENTITY": 696969,
  "RANTX": 0,
  "RXDASIC": 696969,
  "DPR": 50000,
  "BNET": 0,
  "LAURA": 6900,
  "BPM": 3555,
  "LAMBO": 0,
  "PIZZA": 0,
  "BITQ": 0,
  "R6": 0,
  "TYS": 0,
  "忍者": 0,
  "BOI": 0,
  "DEEZ": 0,
  "RZBT": 0,
  "KAKL": 30000,
  "OP_CAT": 0,
  "UȻME": 0,
  "GOAT": 210,
  "XD": 21000000000,
  "GRAVITY": 210000,
  "POW": 0,
  "NEOX": 9900000,
  "GODZ": 0,
  "WOJAK": 0,
  "Me me": 0,
  "DAD": 4843872,
  "RISI": 25000000000,
  "SIR": 0,
  "HAT": 0,
  "π": 0,
  "P2P": 0,
  "RADCHAD": 0
};

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
            premintedAmount={PREMINTED_AMOUNTS[token.symbol]}
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