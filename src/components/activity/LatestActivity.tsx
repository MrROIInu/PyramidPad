import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { TOKENS } from '../../data/tokens';
import { RXD_TOKEN } from '../../constants/tokens';

interface ActivityItem {
  id: string;
  type: 'new_order' | 'claim';
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  timestamp: string;
  orderId: number;
}

export const LatestActivity: React.FC = () => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    // Fetch initial activity
    const fetchLatestActivity = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.warn('Error fetching latest activity:', error);
        return;
      }

      if (data) {
        const activities = data.map(order => ({
          id: `${order.id}-initial`,
          type: order.claimed ? 'claim' : 'new_order',
          fromToken: order.from_token,
          toToken: order.to_token,
          fromAmount: order.from_amount,
          toAmount: order.to_amount,
          timestamp: order.created_at,
          orderId: order.id
        }));
        setActivity(activities);
      }
    };

    fetchLatestActivity();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const newActivity = {
            id: `${payload.new.id}-${Date.now()}`,
            type: payload.eventType === 'INSERT' ? 'new_order' : 'claim',
            fromToken: payload.new.from_token,
            toToken: payload.new.to_token,
            fromAmount: payload.new.from_amount,
            toAmount: payload.new.to_amount,
            timestamp: new Date().toISOString(),
            orderId: payload.new.id
          };

          setActivity(prev => [newActivity, ...prev.slice(0, 2)]);
          setFlash(true);
          setTimeout(() => setFlash(false), 2500);

          // Trigger page shake animation
          document.body.classList.add('animate-shake');
          setTimeout(() => {
            document.body.classList.remove('animate-shake');
          }, 2500);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getTokenImage = (symbol: string) => {
    const token = symbol === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === symbol);
    return token?.imageUrl || '';
  };

  return (
    <div 
      className={`bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm ${
        flash ? 'activity-flash' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-600">Latest Activity</h3>
      </div>

      <AnimatePresence mode="sync">
        {activity.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-2 bg-black/20 rounded-lg p-2 mb-2"
          >
            <div className="flex items-center gap-2">
              <img 
                src={getTokenImage(item.fromToken)}
                alt={item.fromToken}
                className="w-6 h-6 rounded-full"
              />
              <span>{item.fromAmount} {item.fromToken}</span>
            </div>
            <span className="text-yellow-600">➔</span>
            <div className="flex items-center gap-2">
              <img 
                src={getTokenImage(item.toToken)}
                alt={item.toToken}
                className="w-6 h-6 rounded-full"
              />
              <span>{item.toAmount} {item.toToken}</span>
            </div>
            <span className={`ml-auto ${item.type === 'new_order' ? 'text-green-500' : 'text-yellow-600'}`}>
              {item.type === 'new_order' ? '🔄 New Order' : '✅ Claimed'}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {activity.length === 0 && (
        <div className="text-center text-yellow-600/80 py-4">
          Waiting for activity...
        </div>
      )}
    </div>
  );
};