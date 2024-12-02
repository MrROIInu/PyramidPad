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
}

export const LatestActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [flash, setFlash] = useState(false);

  // Fetch initial activities
  useEffect(() => {
    const fetchLatestActivities = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.warn('Error fetching latest activities:', error);
        return;
      }

      if (data) {
        const newActivities = data.map(item => ({
          id: `${item.id}-initial`,
          type: item.claimed ? 'claim' : 'new_order',
          fromToken: item.from_token,
          toToken: item.to_token,
          fromAmount: item.from_amount,
          toAmount: item.to_amount,
          timestamp: item.created_at
        }));
        setActivities(newActivities);
      }
    };

    fetchLatestActivities();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          const newActivity = {
            id: `${payload.new.id}-${Date.now()}`,
            type: payload.eventType === 'INSERT' ? 'new_order' : 'claim',
            fromToken: payload.new.from_token,
            toToken: payload.new.to_token,
            fromAmount: payload.new.from_amount,
            toAmount: payload.new.to_amount,
            timestamp: new Date().toISOString()
          };

          setActivities(prev => [newActivity, ...prev.slice(0, 2)]);
          
          // Start flash animation
          setFlash(true);
          setTimeout(() => setFlash(false), 1000);
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
                className="flex items-center gap-2 bg-black/20 rounded-lg p-2"
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