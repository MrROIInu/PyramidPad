import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Copy } from 'lucide-react';
import { TOKENS } from '../data/tokens';

interface Order {
  id: number;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  swap_tx: string;
  claimed: boolean;
  status?: string;
  price: number;
}

interface OrderListProps {
  orders: Order[];
  onCancel: (id: number) => void;
  onClaim: (id: number) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onCancel, onClaim }) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const ordersPerPage = 5;
  const activeOrders = orders.filter(o => !o.claimed && o.status !== 'cancelled');
  const maxPages = Math.ceil(activeOrders.length / ordersPerPage);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (activeOrders.length === 0) {
    return null;
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

            if (!fromToken || !toToken) return null;

            return (
              <div
                key={order.id}
                className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <img src={fromToken.imageUrl} alt={fromToken.symbol} className="w-8 h-8 rounded-full" />
                      <span className="text-lg">{order.from_amount} {fromToken.symbol}</span>
                    </div>
                    <span className="text-yellow-600">→</span>
                    <div className="flex items-center gap-2">
                      <img src={toToken.imageUrl} alt={toToken.symbol} className="w-8 h-8 rounded-full" />
                      <span className="text-lg">{order.to_amount} {toToken.symbol}</span>
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