import React from 'react';
import { Activity } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { TOKENS } from '../../data/tokens';
import { RXD_TOKEN } from '../../constants/tokens';

export const LatestActivity: React.FC = () => {
  const { orders } = useOrders();

  // Get latest 3 orders
  const latestOrders = orders
    .filter(order => !order.status || order.status !== 'cancelled')
    .slice(0, 3);

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-600">Latest Activity</h3>
      </div>

      <div className="space-y-3">
        {latestOrders.map((order) => {
          const fromToken = order.from_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === order.from_token);
          const toToken = order.to_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === order.to_token);

          if (!fromToken || !toToken) return null;

          return (
            <div 
              key={order.id}
              className="flex items-center justify-between p-2 bg-black/20 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <img 
                  src={fromToken.imageUrl} 
                  alt={fromToken.symbol} 
                  className="w-6 h-6 rounded-full"
                />
                <span>{order.from_amount} {fromToken.symbol}</span>
                <span className="text-yellow-600">➔</span>
                <img 
                  src={toToken.imageUrl} 
                  alt={toToken.symbol} 
                  className="w-6 h-6 rounded-full"
                />
                <span>{order.to_amount} {toToken.symbol}</span>
              </div>
              <span className={order.claimed ? 'text-yellow-600' : 'text-green-500'}>
                {order.claimed ? '✅ Claimed' : '🔄 New Order'}
              </span>
            </div>
          );
        })}

        {latestOrders.length === 0 && (
          <div className="text-center text-yellow-600/80 py-4">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};