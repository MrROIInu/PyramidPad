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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [flash, setFlash] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  useEffect(() => {
    // Fetch initial activities
    const fetchLatestActivities = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('Error fetching latest activities:', error);
        return;
      }

      if (data && data.length > 0) {
        const newActivity = {
          id: `${data[0].id}-initial`,
          type: data[0].claimed ? 'claim' : 'new_order',
          fromToken: data[0].from_token,
          toToken: data[0].to_token,
          fromAmount: data[0].from_amount,
          toAmount: data[0].to_amount,
          timestamp: data[0].created_at,
          orderId: data[0].id
        };
        setActivities([newActivity]);
      }
    };

    fetchLatestActivities();

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

          setActivities([newActivity]);
          setFlash(true);
          setTimeout(() => setFlash(false), 5000);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleActivityClick = async (orderId: number) => {
    setSelectedOrder(orderId);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!error && data) {
      // Scroll to the order in the list
      const orderElement = document.getElementById(`order-${orderId}`);
      if (orderElement) {
        orderElement.scrollIntoView({ behavior: 'smooth' });
        orderElement.classList.add('highlight-order');
        setTimeout(() => {
          orderElement.classList.remove('highlight-order');
        }, 3000);
      }
    }
  };

  const getTokenImage = (symbol: string) => {
    const token = symbol === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === symbol);
    return token?.imageUrl || '';
  };

  const getActivityLabel = (type: 'new_order' | 'claim') => {
    return type === 'new_order' ? '🔄 New Order' : '✅ New Claim';
  };

  return (
    <motion.div 
      className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm"
      animate={flash ? {
        backgroundColor: ['rgba(255, 215, 0, 0.5)', 'rgba(202, 138, 4, 0.3)'],
      } : {}}
      transition={{ duration: 0.3, repeat: 5, repeatType: 'reverse' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-600">Latest Activity</h3>
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="sync">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex items-center gap-2 bg-black/20 rounded-lg p-2 cursor-pointer hover:bg-black/30 transition-colors"
                onClick={() => handleActivityClick(activity.orderId)}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={getTokenImage(activity.fromToken)}
                    alt={activity.fromToken}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{activity.fromAmount} {activity.fromToken}</span>
                </div>
                <span className="text-yellow-600">➔</span>
                <div className="flex items-center gap-2">
                  <img 
                    src={getTokenImage(activity.toToken)}
                    alt={activity.toToken}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{activity.toAmount} {activity.toToken}</span>
                </div>
                <span className={`ml-auto ${activity.type === 'new_order' ? 'text-green-500' : 'text-yellow-600'}`}>
                  {getActivityLabel(activity.type)}
                </span>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-yellow-600/80 text-center"
            >
              Waiting for activity...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};