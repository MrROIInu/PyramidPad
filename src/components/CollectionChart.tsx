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
  onFavorite: () => void;
  isFavorite: boolean;
}

const TokenRow: React.FC<TokenRowProps> = ({ index, token, onFavorite, isFavorite }) => {
  const priceUSD = TOKEN_PRICES[token.symbol] || 0;
  const volume = SIMULATED_DATA.volumes[token.symbol] || 0;
  const launchDate = SIMULATED_DATA.launchDates[token.symbol];
  const priceChange = SIMULATED_DATA.priceChanges[token.symbol];

  return (
    <tr className="border-b border-yellow-600/10 hover:bg-yellow-600/5">
      <td className="px-4 py-2">
        <button
          onClick={onFavorite}
          className={`p-1 rounded ${isFavorite ? 'text-yellow-600' : 'text-gray-400'}`}
        >
          ⭐
        </button>
      </td>
      <td className="px-4 py-2">{index + 1}</td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <img src={token.imageUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
          <span className="font-medium">{token.symbol}</span>
        </div>
      </td>
      <td className="px-4 py-2">{formatPriceUSD(priceUSD)}</td>
      <td className="px-4 py-2">
        <span className={priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </span>
      </td>
      <td className="px-4 py-2">{formatMarketCap(priceUSD, token.totalSupply)}</td>
      <td className="px-4 py-2">{formatVolume(volume)}</td>
      <td className="px-4 py-2">{calculateAge(launchDate)}</td>
      <td className="px-4 py-2">0%</td>
      <td className="px-4 py-2">
        <div className="flex items-center justify-between">
          <span>100%</span>
          <span className="text-sm text-gray-400">
            {(token.totalSupply / 1000000).toFixed(1)}M
          </span>
        </div>
      </td>
    </tr>
  );
};

export const CollectionChart: React.FC = () => {
  const [view, setView] = useState<'all' | 'trending'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (symbol: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(symbol)) {
      newFavorites.delete(symbol);
    } else {
      newFavorites.add(symbol);
    }
    setFavorites(newFavorites);
  };

  const sortedTokens = [...TOKENS].sort((a, b) => {
    const volumeA = SIMULATED_DATA.volumes[a.symbol] || 0;
    const volumeB = SIMULATED_DATA.volumes[b.symbol] || 0;
    return volumeB - volumeA;
  });

  const displayTokens = view === 'trending' 
    ? sortedTokens.slice(0, 10)
    : sortedTokens;

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'all'
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          All Tokens
        </button>
        <button
          onClick={() => setView('trending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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
              <th className="px-4 py-2 text-left"></th>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Ticker</th>
              <th className="px-4 py-2 text-left">Price (USD)</th>
              <th className="px-4 py-2 text-left">Last 7 Days</th>
              <th className="px-4 py-2 text-left">Market Cap</th>
              <th className="px-4 py-2 text-left">Volume (24h)</th>
              <th className="px-4 py-2 text-left">Age</th>
              <th className="px-4 py-2 text-left">Premint</th>
              <th className="px-4 py-2 text-left">Minted</th>
            </tr>
          </thead>
          <tbody>
            {displayTokens.map((token, index) => (
              <TokenRow
                key={token.symbol}
                index={index}
                token={token}
                onFavorite={() => toggleFavorite(token.symbol)}
                isFavorite={favorites.has(token.symbol)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};