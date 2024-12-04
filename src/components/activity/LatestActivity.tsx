import React from 'react';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { TOKENS } from '../../data/tokens';
import { RXD_TOKEN } from '../../constants/tokens';

export const LatestActivity: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();

  // Get latest 3 orders or claims
  const latestActivity = orders
    .filter(order => !order.status || order.status !== 'cancelled')
    .slice(0, 3);

  const handleActivityClick = (order: any) => {
    navigate(`/latest?highlight=${order.id}`);
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-600">Latest Activity</h3>
      </div>

      <div className="space-y-3">
        {latestActivity.map((activity) => {
          const fromToken = activity.from_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === activity.from_token);
          const toToken = activity.to_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === activity.to_token);

          if (!fromToken || !toToken) return null;

          return (
            <div 
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className="flex items-center justify-between p-2 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <img 
                  src={fromToken.imageUrl} 
                  alt={fromToken.symbol} 
                  className="w-6 h-6 rounded-full"
                />
                <span>{activity.from_amount} {fromToken.symbol}</span>
                <span className="text-yellow-600">➔</span>
                <img 
                  src={toToken.imageUrl} 
                  alt={toToken.symbol} 
                  className="w-6 h-6 rounded-full"
                />
                <span>{activity.to_amount} {toToken.symbol}</span>
              </div>
              <span className={activity.claimed ? 'text-yellow-600' : 'text-green-500'}>
                {activity.claimed ? '✅ Claimed' : '🔄 New Order'}
              </span>
            </div>
          );
        })}

        {latestActivity.length === 0 && (
          <div className="text-center text-yellow-600/80 py-4">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};