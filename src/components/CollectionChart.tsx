import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKENS } from '../data/tokens';
import { formatPriceUSD, formatMarketCap } from '../lib/tokenPrices';
import { getMiningData } from '../lib/tokenData';
import { useOrders } from '../hooks/useOrders';
import { useSwapContext } from '../contexts/SwapContext';
import { useRealtimePrices } from '../hooks/useRealtimePrices';

export const CollectionChart: React.FC = () => {
  const navigate = useNavigate();
  const { updateSelectedToken } = useSwapContext();
  const { orders } = useOrders();
  const prices = useRealtimePrices();

  // Show all tokens, sorted with RADCAT first
  const displayTokens = [...TOKENS]
    .filter(token => token.symbol !== 'RXD')
    .sort((a, b) => {
      if (a.symbol === 'RADCAT') return -1;
      if (b.symbol === 'RADCAT') return 1;
      return a.symbol.localeCompare(b.symbol);
    });

  const getOpenOrderCount = (symbol: string) => {
    return orders.filter(order => 
      (order.from_token === symbol || order.to_token === symbol) && 
      !order.claimed && 
      order.status !== 'cancelled'
    ).length;
  };

  const handleTokenClick = (symbol: string) => {
    const token = TOKENS.find(t => t.symbol === symbol);
    if (token) {
      updateSelectedToken(token);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculateMarketCap = (symbol: string, totalSupply: number): number => {
    const price = prices[symbol] || 0;
    return price * totalSupply;
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-yellow-600 border-b border-yellow-600/20">
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left">Ticker</th>
              <th className="px-2 py-2 text-left">Price (USD)</th>
              <th className="px-2 py-2 text-left">Market Cap</th>
              <th className="px-2 py-2 text-left">Preminted</th>
              <th className="px-2 py-2 text-left">Minted</th>
              <th className="px-2 py-2 text-left">Open Orders</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {displayTokens.map((token, index) => {
              const miningData = getMiningData(token.symbol);
              const marketCap = calculateMarketCap(token.symbol, token.totalSupply);
              
              return (
                <tr 
                  key={token.symbol} 
                  className="border-b border-yellow-600/10 hover:bg-yellow-600/5 cursor-pointer"
                  onClick={() => handleTokenClick(token.symbol)}
                >
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <img src={token.imageUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
                      <span>{token.symbol}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2">{formatPriceUSD(prices[token.symbol])}</td>
                  <td className="px-2 py-2">{formatMarketCap(marketCap)}</td>
                  <td className="px-2 py-2">{miningData.preminted}%</td>
                  <td className="px-2 py-2">
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
                  <td className="px-2 py-2">
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
    </div>
  );
};