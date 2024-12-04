import React from 'react';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { TOKENS } from '../../data/tokens';
import { RXD_TOKEN } from '../../constants/tokens';
import { useRealtimePrices } from '../../hooks/useRealtimePrices';
import { formatPriceUSD } from '../../lib/tokenPrices';

export const LatestActivity: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const prices = useRealtimePrices();

  // Get latest 3 orders or claims, including both new orders and claimed orders
  const latestActivity = orders
    .filter(order => !order.status || order.status !== 'cancelled')
    .sort((a, b) => {
      const aTime = a.claimed_at || a.created_at;
      const bTime = b.claimed_at || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
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

          const fromValue = activity.from_amount * (prices[fromToken.symbol] || 0);
          const toValue = activity.to_amount * (prices[toToken.symbol] || 0);
          const timestamp = activity.claimed ? activity.claimed_at : activity.created_at;

          return (
            <div 
              key={`${activity.id}-${activity.claimed ? 'claimed' : 'new'}`}
              onClick={() => handleActivityClick(activity)}
              className="flex flex-col p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={fromToken.imageUrl} 
                    alt={fromToken.symbol} 
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <span>{activity.from_amount} {fromToken.symbol}</span>
                    <div className="text-xs text-yellow-600/80">
                      ≈ {formatPriceUSD(fromValue)}
                    </div>
                  </div>
                </div>
                <span className="text-yellow-600">➔</span>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span>{activity.to_amount} {toToken.symbol}</span>
                    <div className="text-xs text-yellow-600/80">
                      ≈ {formatPriceUSD(toValue)}
                    </div>
                  </div>
                  <img 
                    src={toToken.imageUrl} 
                    alt={toToken.symbol} 
                    className="w-6 h-6 rounded-full"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-yellow-600/80">
                  {new Date(timestamp).toLocaleTimeString()}
                </span>
                <span className={activity.claimed ? 'text-yellow-600' : 'text-green-500'}>
                  {activity.claimed ? '✅ Claimed' : '🔄 New Order'}
                </span>
              </div>
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