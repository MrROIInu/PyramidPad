import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKENS } from '../../data/tokens';
import { formatPriceUSD, calculateRXDRatio } from '../../lib/tokenPrices';
import { getMiningData } from '../../lib/tokenData';
import { useOrders } from '../../hooks/useOrders';
import { useSwapContext } from '../../contexts/SwapContext';
import { useRealtimePrices } from '../../hooks/useRealtimePrices';
import { usePriceHistory } from '../../hooks/usePriceHistory';

export const CollectionChart: React.FC = () => {
  const navigate = useNavigate();
  const { updateSelectedToken } = useSwapContext();
  const { orders } = useOrders();
  const prices = useRealtimePrices();
  const { priceChanges } = usePriceHistory();
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('7d');

  const displayTokens = [...TOKENS]
    .filter(token => token.symbol !== 'RXD')
    .sort((a, b) => {
      const ratioA = prices[a.symbol] ? prices.RXD / prices[a.symbol] : Infinity;
      const ratioB = prices[b.symbol] ? prices.RXD / prices[b.symbol] : Infinity;
      return ratioA - ratioB;
    });

  const getOpenOrderCount = (symbol: string) => {
    return orders.filter(order => 
      (order.from_token === symbol || order.to_token === symbol) && 
      !order.claimed && 
      order.status !== 'cancelled'
    ).length;
  };

  const getPriceChangeClass = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-yellow-600';
  };

  const handleTokenClick = (token: Token) => {
    updateSelectedToken(token);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-yellow-600">RXD20 Token Chart</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('1d')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              timeframe === '1d'
                ? 'bg-yellow-600 text-white'
                : 'text-yellow-600 hover:bg-yellow-600/10'
            }`}
          >
            1D
          </button>
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              timeframe === '7d'
                ? 'bg-yellow-600 text-white'
                : 'text-yellow-600 hover:bg-yellow-600/10'
            }`}
          >
            7D
          </button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-yellow-600 border-b border-yellow-600/20">
            <th className="px-4 py-3 text-left whitespace-nowrap">#</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Ticker</th>
            <th className="px-4 py-3 text-left whitespace-nowrap min-w-[200px]">Price (USD)</th>
            <th className="px-4 py-3 text-left whitespace-nowrap min-w-[150px]">RXD Ratio</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Last {timeframe === '1d' ? '24h' : '7 Days'}</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Premined</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Minted</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Orders</th>
          </tr>
        </thead>
        <tbody>
          {displayTokens.map((token, index) => {
            const miningData = getMiningData(token.symbol);
            const rxdRatio = calculateRXDRatio(prices[token.symbol], prices.RXD);
            const priceChange = priceChanges[token.symbol] || 0;
            
            return (
              <tr 
                key={token.symbol}
                onClick={() => handleTokenClick(token)}
                className="border-b border-yellow-600/10 hover:bg-yellow-600/5 cursor-pointer"
              >
                <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <img src={token.imageUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
                    <span>{token.symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono">
                  {formatPriceUSD(prices[token.symbol] || 0)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {rxdRatio}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap ${getPriceChangeClass(priceChange)}`}>
                  {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{miningData.preminted}%</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-600 to-amber-800"
                        style={{ width: `${miningData.minted}%` }}
                      />
                    </div>
                    <span className="text-xs">{miningData.minted}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={getOpenOrderCount(token.symbol) > 0 ? 'text-green-500' : ''}>
                    {getOpenOrderCount(token.symbol)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};