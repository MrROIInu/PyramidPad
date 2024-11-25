import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { TOKEN_PRICES, formatPriceUSD, formatMarketCap, formatVolume, calculateAge } from '../lib/tokenPrices';

// Simulated data for demonstration
const SIMULATED_DATA = {
  volumes: {
    RADCAT: 838201,
    DOGE: 4006622,
    PEPE: 342242,
    PILIM: 287519,
    // Add more tokens as needed
  },
  launchDates: {
    RADCAT: new Date('2024-01-01'),
    DOGE: new Date('2024-02-01'),
    PEPE: new Date('2024-01-15'),
    PILIM: new Date('2024-01-20'),
    // Add more tokens as needed
  },
  priceChanges: {
    RADCAT: -7,
    DOGE: -14,
    PEPE: -9,
    PILIM: -23,
    // Add more tokens as needed
  }
};

interface TokenRowProps {
  index: number;
  token: {
    symbol: string;
    imageUrl: string;
    totalSupply: number;
  };
}

const TokenRow: React.FC<TokenRowProps> = ({ index, token }) => {
  const priceUSD = TOKEN_PRICES[token.symbol] || 0;
  const volume = SIMULATED_DATA.volumes[token.symbol] || 0;
  const launchDate = SIMULATED_DATA.launchDates[token.symbol] || new Date();
  const priceChange = SIMULATED_DATA.priceChanges[token.symbol] || 0;

  return (
    <tr className="border-b border-yellow-600/10 hover:bg-yellow-600/5">
      <td className="px-3 py-3 text-base">{index + 1}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <img src={token.imageUrl} alt={token.symbol} className="w-8 h-8 rounded-full" />
          <span className="font-medium text-base">{token.symbol}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-base">{formatPriceUSD(priceUSD)}</td>
      <td className="px-3 py-3 text-base">
        <span className={priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </span>
      </td>
      <td className="px-3 py-3 text-base">{formatMarketCap(priceUSD, token.totalSupply)}</td>
      <td className="px-3 py-3 text-base">{formatVolume(volume)}</td>
      <td className="px-3 py-3 text-base">{calculateAge(launchDate)}</td>
      <td className="px-3 py-3 text-base">0%</td>
      <td className="px-3 py-3 text-base">100%</td>
    </tr>
  );
};

export const CollectionChart: React.FC = () => {
  const [view, setView] = useState<'all' | 'trending'>('all');

  // Filter out RXD token and sort the remaining tokens
  const filteredTokens = TOKENS.filter(token => token.symbol !== 'RXD');
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const volumeA = SIMULATED_DATA.volumes[a.symbol] || 0;
    const volumeB = SIMULATED_DATA.volumes[b.symbol] || 0;
    return volumeB - volumeA;
  });

  const displayTokens = view === 'trending' 
    ? sortedTokens.slice(0, 10)
    : sortedTokens;

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setView('all')}
          className={`px-6 py-2 rounded-lg transition-colors text-base ${
            view === 'all'
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          All Tokens
        </button>
        <button
          onClick={() => setView('trending')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors text-base ${
            view === 'trending'
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          <Flame size={20} />
          Trending
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-yellow-600 border-b border-yellow-600/20">
              <th className="px-3 py-3 text-left text-base">#</th>
              <th className="px-3 py-3 text-left text-base">Ticker</th>
              <th className="px-3 py-3 text-left text-base">Price (USD)</th>
              <th className="px-3 py-3 text-left text-base">Last 7 Days</th>
              <th className="px-3 py-3 text-left text-base">Market Cap</th>
              <th className="px-3 py-3 text-left text-base">Volume (24h)</th>
              <th className="px-3 py-3 text-left text-base">Age</th>
              <th className="px-3 py-3 text-left text-base">Premint</th>
              <th className="px-3 py-3 text-left text-base">Minted</th>
            </tr>
          </thead>
          <tbody>
            {displayTokens.map((token, index) => (
              <TokenRow
                key={token.symbol}
                index={index}
                token={token}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};