import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { TOKENS } from '../data/tokens';
import { TOKEN_PRICES, formatPriceUSD } from '../lib/tokenPrices';

interface OrderListProps {
  orders: any[];
  onCancel: (id: number) => void;
  onClaim: (id: number) => void;
}

const PriceComparison: React.FC<{ difference: number }> = ({ difference }) => {
  if (isNaN(difference)) {
    return <div className="text-sm text-yellow-600">Price comparison unavailable</div>;
  }

  if (difference === 0) {
    return <div className="text-sm text-yellow-600">At floor price</div>;
  }

  if (difference > 0) {
    return <div className="text-sm text-green-500">{difference.toFixed(2)}% higher than floor price</div>;
  }

  return <div className="text-sm text-red-500">{Math.abs(difference).toFixed(2)}% lower than floor price</div>;
};

export const OrderList: React.FC<OrderListProps> = ({ orders, onCancel, onClaim }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const ordersPerPage = 5;

  const activeOrders = orders.filter(order => !order.claimed);
  const maxPages = Math.ceil(activeOrders.length / ordersPerPage);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const calculateUSDValue = (amount: number, symbol: string) => {
    return amount * (TOKEN_PRICES[symbol] || 0);
  };

  const calculatePriceComparison = (order: any) => {
    const currentPrice = TOKEN_PRICES[order.to_token] || 0;
    const orderPrice = order.price || 0;
    if (!currentPrice || !orderPrice) return NaN;
    return ((currentPrice - orderPrice) / orderPrice) * 100;
  };

  if (activeOrders.length === 0) {
    return (
      <div className="text-center text-yellow-600 py-8">
        No active orders
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
        Active Orders
      </h2>
      <div className="space-y-4">
        {activeOrders
          .slice(currentPage * ordersPerPage, (currentPage + 1) * ordersPerPage)
          .map(order => {
            const fromToken = TOKENS.find(t => t.symbol === order.from_token);
            const toToken = TOKENS.find(t => t.symbol === order.to_token);
            const priceComparison = calculatePriceComparison(order);

            if (!fromToken || !toToken) return null;

            return (
              <div
                key={order.id}
                className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <img src={fromToken.imageUrl} alt={fromToken.symbol} className="w-8 h-8 rounded-full" />
                        <div>
                          <span className="text-lg">{order.from_amount} {fromToken.symbol}</span>
                          <div className="text-sm text-yellow-600/80">
                            ≈ {formatPriceUSD(calculateUSDValue(order.from_amount, fromToken.symbol))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-yellow-600">→</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <img src={toToken.imageUrl} alt={toToken.symbol} className="w-8 h-8 rounded-full" />
                        <div>
                          <span className="text-lg">{order.to_amount} {toToken.symbol}</span>
                          <div className="text-sm text-yellow-600/80">
                            ≈ {formatPriceUSD(calculateUSDValue(order.to_amount, toToken.symbol))}
                          </div>
                        </div>
                      </div>
                      <PriceComparison difference={priceComparison} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onClaim(order.id)}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg hover:from-yellow-500 hover:to-amber-700 transition-all"
                    >
                      Claim
                    </button>
                    <button
                      onClick={() => onCancel(order.id)}
                      className="px-4 py-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div 
                    className="flex items-start gap-2 bg-black/30 border border-yellow-600/30 rounded-lg p-4 cursor-pointer group"
                    onClick={() => handleCopy(order.swap_tx)}
                  >
                    <code className="flex-1 text-sm break-all">{order.swap_tx}</code>
                    <button className="text-yellow-600 hover:text-yellow-500 p-1">
                      <Copy size={20} />
                    </button>
                  </div>
                  {showCopyMessage && (
                    <div className="absolute top-full left-0 right-0 mt-2 text-center">
                      <p className="text-green-500 text-sm bg-black/80 rounded-lg py-2 px-4 inline-block">
                        TX copied to clipboard
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {maxPages > 1 && (
        <div className="mt-6 px-4">
          <Slider
            min={0}
            max={maxPages - 1}
            value={currentPage}
            onChange={(value) => setCurrentPage(typeof value === 'number' ? value : 0)}
            railStyle={{ backgroundColor: 'rgba(202, 138, 4, 0.2)' }}
            trackStyle={{ backgroundColor: '#CA8A04' }}
            handleStyle={{
              borderColor: '#CA8A04',
              backgroundColor: '#CA8A04'
            }}
          />
        </div>
      )}
    </div>
  );
};