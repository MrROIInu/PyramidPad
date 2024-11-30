import React from 'react';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={isNew ? { scale: 0.95, opacity: 0 } : false}
      animate={{ 
        scale: 1, 
        opacity: 1,
        backgroundColor: isNew ? 'rgba(202, 138, 4, 0.3)' : 'transparent'
      }}
      transition={{ 
        duration: 0.3,
        type: 'spring',
        stiffness: 500,
        damping: 30
      }}
      className={`
        py-2 px-3 rounded-lg transition-colors duration-300
        ${isNew ? 'animate-shake bg-yellow-600/30' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        <span className={`text-sm ${activity.type === 'new_order' ? 'text-green-500' : 'text-yellow-600'}`}>
          {activity.type === 'new_order' ? '🔄 New Order' : '✅ Claimed'}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-medium">{activity.fromAmount} {activity.fromToken}</span>
        <span className="text-yellow-600">➔</span>
        <span className="font-medium">{activity.toAmount} {activity.toToken}</span>
      </div>
    </motion.div>
  );
};