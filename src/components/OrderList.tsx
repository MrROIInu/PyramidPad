import React from 'react';
import { Copy } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { TOKEN_PRICES, formatPriceUSD } from '../lib/tokenPrices';
import { Order } from '../types';

interface OrderListProps {
  orders: Order[];
  onCancel: (id: number) => void;
  onClaim: (id: number) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onCancel, onClaim }) => {
  const activeOrders = orders.filter(o => !o.claimed && o.status !== 'cancelled');

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateTransactionText = (order: Order) => {
    return `🔁 Swap: ${order.from_amount} ${order.from_token} ➔ ${order.to_amount} ${order.to_token} 📋${order.swap_tx}🟦`;
  };

  if (activeOrders.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
          Open Orders
        </h2>
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm text-center">
          <p className="text-yellow-600">No active orders</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
        Open Orders
      </h2>
      <div className="space-y-4">
        {activeOrders.map(order => {
          const fromToken = order.from_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === order.from_token);
          const toToken = order.to_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === order.to_token);

          if (!fromToken || !toToken) return null;

          const transactionText = generateTransactionText(order);

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
                          ≈ {formatPriceUSD(order.from_amount * TOKEN_PRICES[fromToken.symbol])}
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
                          ≈ {formatPriceUSD(order.to_amount * TOKEN_PRICES[toToken.symbol])}
                        </div>
                      </div>
                    </div>
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
                  onClick={() => handleCopy(transactionText)}
                >
                  <code className="flex-1 text-sm break-all">{transactionText}</code>
                  <button className="text-yellow-600 hover:text-yellow-500 p-1">
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};