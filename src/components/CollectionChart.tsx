import React from 'react';
import { TOKENS } from '../data/tokens';
import { TOKEN_PRICES, formatPriceUSD, formatMarketCap } from '../lib/tokenPrices';
import { getMiningData } from '../lib/tokenData';

export const CollectionChart: React.FC = () => {
  // Sort tokens to ensure RADCAT is first
  const displayTokens = [...TOKENS]
    .filter(token => token.symbol !== 'RXD')
    .sort((a, b) => {
      if (a.symbol === 'RADCAT') return -1;
      if (b.symbol === 'RADCAT') return 1;
      return a.symbol.localeCompare(b.symbol);
    });

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-yellow-600 border-b border-yellow-600/20">
              <th className="px-3 py-3 text-left text-base">#</th>
              <th className="px-3 py-3 text-left text-base">Ticker</th>
              <th className="px-3 py-3 text-left text-base">Price (USD)</th>
              <th className="px-3 py-3 text-left text-base">Market Cap</th>
              <th className="px-3 py-3 text-left text-base">Volume (24h)</th>
              <th className="px-3 py-3 text-left text-base">Premined</th>
              <th className="px-3 py-3 text-left text-base">Mined</th>
              <th className="px-3 py-3 text-left text-base">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {displayTokens.map((token, index) => {
              const miningData = getMiningData(token.symbol);
              return (
                <tr key={token.symbol} className="border-b border-yellow-600/10 hover:bg-yellow-600/5">
                  <td className="px-3 py-3 text-base">{index + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <img src={token.imageUrl} alt={token.symbol} className="w-8 h-8 rounded-full" />
                      <span className="font-medium text-base">{token.symbol}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-base">{formatPriceUSD(TOKEN_PRICES[token.symbol])}</td>
                  <td className="px-3 py-3 text-base">
                    {formatMarketCap(TOKEN_PRICES[token.symbol], token.totalSupply)}
                  </td>
                  <td className="px-3 py-3 text-base">-</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-600 to-amber-800"
                          style={{ width: '0%' }}
                        />
                      </div>
                      <span className="text-sm">0%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-600 to-amber-800"
                          style={{ width: `${miningData.mined}%` }}
                        />
                      </div>
                      <span className="text-sm">{miningData.mined}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-base">{miningData.difficulty}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};