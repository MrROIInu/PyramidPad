import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';

interface Activity {
  id: string;
  type: 'new_order' | 'claim';
  message: string;
  timestamp: string;
}

export const ActivityFeed: React.FC = () => {
  const [isFlashing, setIsFlashing] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          const newActivity: Activity = {
            id: `${payload.new.id}-${Date.now()}`,
            type: payload.eventType === 'INSERT' ? 'new_order' : 'claim',
            message: getActivityMessage(payload),
            timestamp: new Date().toISOString()
          };
          setActivities(prev => [newActivity, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getActivityMessage = (payload: any) => {
    const fromToken = payload.new.from_token === 'RXD' ? RXD_TOKEN : 
      TOKENS.find(t => t.symbol === payload.new.from_token);
    const toToken = payload.new.to_token === 'RXD' ? RXD_TOKEN : 
      TOKENS.find(t => t.symbol === payload.new.to_token);

    if (!fromToken || !toToken) return '';

    if (payload.eventType === 'INSERT') {
      return `New order: ${payload.new.from_amount} ${fromToken.symbol} ➔ ${payload.new.to_amount} ${toToken.symbol}`;
    } else if (payload.eventType === 'UPDATE' && payload.new.claimed) {
      return `Order claimed: ${payload.new.from_amount} ${fromToken.symbol} ➔ ${payload.new.to_amount} ${toToken.symbol}`;
    }
    return '';
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bell className="text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-600">Recent Activity</h3>
        </div>
        <button
          onClick={() => setIsFlashing(!isFlashing)}
          className="text-sm text-yellow-600 hover:text-yellow-500"
        >
          {isFlashing ? 'Stop' : 'Start'} Flashing
        </button>
      </div>
      <div className="space-y-2">
        {activities.length > 0 ? (
          activities.map(activity => (
            <div 
              key={activity.id} 
              className={`${isFlashing ? 'animate-flash' : ''} text-yellow-600/80 py-1`}
            >
              {activity.message}
            </div>
          ))
        ) : (
          <p className="text-yellow-600/80">Waiting for new orders...</p>
        )}
      </div>
    </div>
  );
};