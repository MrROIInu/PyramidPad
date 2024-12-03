import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityItemProps {
  activity: {
    type: 'new_order' | 'claim';
    message: string;
    fromToken: string;
    toToken: string;
    fromAmount: number;
    toAmount: number;
  };
  isNew: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, isNew }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={isNew ? { scale: 0.95, opacity: 0 } : false}
        animate={{ 
          scale: 1, 
          opacity: 1
        }}
        transition={{ 
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
        className={`
          py-2 px-3 rounded-lg transition-colors duration-300
          ${isNew ? 'activity-flash' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm ${activity.type === 'new_order' ? 'text-green-500' : 'text-yellow-600'}`}>
            {activity.type === 'new_order' ? '🔄 New Order' : '✅ Claimed'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <img 
              src={`https://static.wixstatic.com/media/c0fd9f_${activity.fromToken.toLowerCase()}.png`}
              alt={activity.fromToken}
              className="w-4 h-4 rounded-full"
            />
            <span className="font-medium">{activity.fromAmount} {activity.fromToken}</span>
          </div>
          <span className="text-yellow-600">➔</span>
          <div className="flex items-center gap-1">
            <img 
              src={`https://static.wixstatic.com/media/c0fd9f_${activity.toToken.toLowerCase()}.png`}
              alt={activity.toToken}
              className="w-4 h-4 rounded-full"
            />
            <span className="font-medium">{activity.toAmount} {activity.toToken}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};