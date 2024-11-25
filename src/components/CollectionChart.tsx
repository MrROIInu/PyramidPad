import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { TOKEN_PRICES, formatPriceUSD, formatMarketCap, formatVolume, calculateAge } from '../lib/tokenPrices';

// Simulated trading volume and launch dates
const SIMULATED_DATA = {
  volumes: Object.fromEntries(
    TOKENS.map(token => [
      token.symbol,
      Math.floor(Math.random() * 5000000) + 100000
    ])
  ),
  launchDates: Object.fromEntries(
    TOKENS.map(token => [
      token.symbol,
      new Date(Date.now() - (Math.floor(Math.random() * 365) + 30) * 24 * 60 * 60 * 1000)
    ])
  ),
  priceChanges: Object.fromEntries(
    TOKENS.map(token => [
      token.symbol,
      (Math.random() * 40) - 20 // Random price change between -20% and +20%
    ])
  )
};

interface TokenRowProps {
  index: number;
  token: typeof TOKENS[0];
}

const TokenRow: React.FC<TokenRowProps> = ({ index, token }) => {
  const priceUSD = TOKEN_PRICES[token.symbol] || 0;
  const volume = SIMULATED_DATA.volumes[token.symbol] || 0;
  const launchDate = SIMULATED_DATA.launchDates[token.symbol];
  const priceChange = SIMULATED_DATA.priceChanges[token.symbol];

  return (
    <tr className="border-b border-yellow-600/10 hover:bg-yellow-600/5">
      <td className="px-2 py-2 text-sm">{index + 1}</td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-2">
          <img src={token.imageUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
          <span className="font-medium text-sm">{token.symbol}</span>
        </div>
      </td>
      <td className="px-2 py-2 text-sm">{formatPriceUSD(priceUSD)}</td>
      <td className="px-2 py-2 text-sm">
        <span className={priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </span>
      </td>
      <td className="px-2 py-2 text-sm">{formatMarketCap(priceUSD, token.totalSupply)}</td>
      <td className="px-2 py-2 text-sm">{formatVolume(volume)}</td>
      <td className="px-2 py-2 text-sm">{calculateAge(launchDate)}</td>
      <td className="px-2 py-2 text-sm">0%</td>
      <td className="px-2 py-2">
        <div className="flex items-center justify-between text-sm">
          <span>100%</span>
          <span className="text-gray-400 ml-2">
            {(token.totalSupply / 1000000).toFixed(1)}M
          </span>
        </div>
      </td>
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
          className={`px-4 py-2 rounded-lg transition-colors text-sm ${
            view === 'all'
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          All Tokens
        </button>
        <button
          onClick={() => setView('trending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
            view === 'trending'
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          <Flame size={16} />
          Trending
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-yellow-600 border-b border-yellow-600/20">
              <th className="px-2 py-2 text-left text-xs">#</th>
              <th className="px-2 py-2 text-left text-xs">Ticker</th>
              <th className="px-2 py-2 text-left text-xs">Price (USD)</th>
              <th className="px-2 py-2 text-left text-xs">Last 7 Days</th>
              <th className="px-2 py-2 text-left text-xs">Market Cap</th>
              <th className="px-2 py-2 text-left text-xs">Volume (24h)</th>
              <th className="px-2 py-2 text-left text-xs">Age</th>
              <th className="px-2 py-2 text-left text-xs">Premint</th>
              <th className="px-2 py-2 text-left text-xs">Minted</th>
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