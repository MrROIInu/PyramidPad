import React from 'react';
import { TrendingUp } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { formatPriceUSD } from '../lib/tokenPrices';
import { useSwapContext } from '../contexts/SwapContext';
import { useRealtimePrices } from '../hooks/useRealtimePrices';

export const TopGainers: React.FC = () => {
  const { updateSelectedToken } = useSwapContext();
  const prices = useRealtimePrices();

  // Get top 3 tokens by market cap, excluding RXD
  const topTokens = [...TOKENS]
    .filter(token => token.symbol !== 'RXD')
    .sort((a, b) => {
      const marketCapA = (prices[a.symbol] || 0) * a.totalSupply;
      const marketCapB = (prices[b.symbol] || 0) * b.totalSupply;
      return marketCapB - marketCapA;
    })
    .slice(0, 3);

  const handleTokenClick = (token: typeof TOKENS[0]) => {
    updateSelectedToken(token);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-600">Top Gainers</h3>
      </div>
      <div className="space-y-3">
        {topTokens.map((token, index) => (
          <div 
            key={token.symbol} 
            className="flex items-center justify-between cursor-pointer hover:bg-yellow-600/10 p-2 rounded-lg transition-colors"
            onClick={() => handleTokenClick(token)}
          >
            <div className="flex items-center gap-2">
              <span className="text-yellow-600/80 w-6">{index + 1}</span>
              <img src={token.imageUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
              <span className="w-20">{token.symbol}</span>
            </div>
            <span className="text-green-500 font-mono whitespace-nowrap">
              {formatPriceUSD(prices[token.symbol] || 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};