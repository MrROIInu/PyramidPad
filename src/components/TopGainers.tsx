import React from 'react';
import { TrendingUp } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { useSwapContext } from '../contexts/SwapContext';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { formatPriceUSD } from '../lib/tokenPrices';
import { useRealtimePrices } from '../hooks/useRealtimePrices';

export const TopGainers: React.FC = () => {
  const { updateSelectedToken } = useSwapContext();
  const { priceChanges } = usePriceHistory();
  const prices = useRealtimePrices();

  // Get top 6 tokens by price change percentage, excluding RXD
  const topTokens = [...TOKENS]
    .filter(token => token.symbol !== 'RXD')
    .sort((a, b) => {
      const changeA = priceChanges[a.symbol] || 0;
      const changeB = priceChanges[b.symbol] || 0;
      return changeB - changeA;
    })
    .slice(0, 6);

  const handleTokenClick = (token: typeof TOKENS[0]) => {
    updateSelectedToken(token);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPriceChangeClass = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-yellow-600';
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-600">Top Gainers</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topTokens.map((token, index) => {
          const priceChange = priceChanges[token.symbol] || 0;
          const currentPrice = prices[token.symbol] || 0;
          
          return (
            <div 
              key={token.symbol} 
              className="flex items-center justify-between cursor-pointer hover:bg-yellow-600/10 p-2 rounded-lg transition-colors"
              onClick={() => handleTokenClick(token)}
            >
              <div className="flex items-center gap-2">
                <span className="text-yellow-600/80 w-6">{index + 1}</span>
                <img src={token.imageUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
                <div className="flex flex-col">
                  <span className="font-medium">{token.symbol}</span>
                  <span className="text-xs text-yellow-600/80">
                    {formatPriceUSD(currentPrice)}
                  </span>
                </div>
              </div>
              <span className={`${getPriceChangeClass(priceChange)} font-mono whitespace-nowrap text-sm`}>
                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};