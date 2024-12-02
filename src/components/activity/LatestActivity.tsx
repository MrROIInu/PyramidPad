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
  const [latestActivity, setLatestActivity] = useState<ActivityItem | null>(null);
  const [flash, setFlash] = useState(false);

  // Fetch initial activity
  useEffect(() => {
    const fetchLatestActivity = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.warn('Error fetching latest activity:', error);
        return;
      }

      if (data) {
        const fromToken = data.from_token === 'RXD' ? RXD_TOKEN : 
          TOKENS.find(t => t.symbol === data.from_token);
        const toToken = data.to_token === 'RXD' ? RXD_TOKEN : 
          TOKENS.find(t => t.symbol === data.to_token);

        if (!fromToken || !toToken) return;

        setLatestActivity({
          id: `${data.id}-initial`,
          type: data.claimed ? 'claim' : 'new_order',
          fromToken: data.from_token,
          toToken: data.to_token,
          fromAmount: data.from_amount,
          toAmount: data.to_amount,
          timestamp: data.created_at
        });
      }
    };

    fetchLatestActivity();
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

          setLatestActivity(newActivity);
          
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

  return (
    <motion.div 
      className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm"
      animate={flash ? {
        backgroundColor: ['rgba(202, 138, 4, 0.3)', 'rgba(202, 138, 4, 0)'],
      } : {}}
      transition={{ duration: 0.5, repeat: 5, repeatType: 'reverse' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-600">Latest Activity</h3>
      </div>
      <AnimatePresence mode="wait">
        {latestActivity ? (
          <motion.div 
            key={latestActivity.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <img 
                src={getTokenImage(latestActivity.fromToken)}
                alt={latestActivity.fromToken}
                className="w-6 h-6 rounded-full"
              />
              <span>{latestActivity.fromAmount} {latestActivity.fromToken}</span>
            </div>
            <span className="text-yellow-600">➔</span>
            <div className="flex items-center gap-2">
              <img 
                src={getTokenImage(latestActivity.toToken)}
                alt={latestActivity.toToken}
                className="w-6 h-6 rounded-full"
              />
              <span>{latestActivity.toAmount} {latestActivity.toToken}</span>
            </div>
            <span className={`ml-auto ${latestActivity.type === 'new_order' ? 'text-green-500' : 'text-yellow-600'}`}>
              {latestActivity.type === 'new_order' ? '🔄 New Order' : '✅ Claimed'}
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-yellow-600/80"
          >
            Loading latest activity...
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};