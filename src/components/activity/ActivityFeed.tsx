import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { TOKENS } from '../../data/tokens';
import { RXD_TOKEN } from '../../constants/tokens';
import { ActivityItem } from './ActivityItem';

interface Activity {
  id: string;
  type: 'new_order' | 'claim';
  message: string;
  timestamp: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
}

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState<boolean>(false);

  useEffect(() => {
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          const fromToken = payload.new.from_token === 'RXD' ? RXD_TOKEN : 
            TOKENS.find(t => t.symbol === payload.new.from_token);
          const toToken = payload.new.to_token === 'RXD' ? RXD_TOKEN : 
            TOKENS.find(t => t.symbol === payload.new.to_token);

          if (!fromToken || !toToken) return;

          const newActivity = {
            id: `${payload.new.id}-${Date.now()}`,
            type: payload.eventType === 'INSERT' ? 'new_order' : 'claim',
            message: getActivityMessage(payload),
            timestamp: new Date().toISOString(),
            fromToken: fromToken.symbol,
            toToken: toToken.symbol,
            fromAmount: payload.new.from_amount,
            toAmount: payload.new.to_amount
          };

          setActivities(prev => [newActivity, ...prev].slice(0, 10));
          setNewActivity(true);

          // Trigger page shake
          document.body.classList.add('animate-shake');
          setTimeout(() => {
            document.body.classList.remove('animate-shake');
            setNewActivity(false);
          }, 2500);
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
      return `New Order: ${payload.new.from_amount} ${fromToken.symbol} ➔ ${payload.new.to_amount} ${toToken.symbol}`;
    } else if (payload.eventType === 'UPDATE' && payload.new.claimed) {
      return `Order Claimed: ${payload.new.from_amount} ${fromToken.symbol} ➔ ${payload.new.to_amount} ${toToken.symbol}`;
    }
    return '';
  };

  return (
    <motion.div 
      className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm"
      animate={newActivity ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Bell className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-600">Recent Activity</h3>
      </div>
      <AnimatePresence>
        <div className="space-y-2">
          {activities.length > 0 ? (
            activities.map(activity => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isNew={newActivity}
              />
            ))
          ) : (
            <p className="text-yellow-600/80">Waiting for new orders...</p>
          )}
        </div>
      </AnimatePresence>
    </motion.div>
  );
};