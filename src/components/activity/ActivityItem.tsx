import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOKEN_PRICES } from '../../lib/tokenPrices';
import { formatPriceUSD } from '../../lib/tokenPrices';

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
  const [showDetails, setShowDetails] = useState(false);

  const fromTokenPrice = TOKEN_PRICES[activity.fromToken] || 0;
  const toTokenPrice = TOKEN_PRICES[activity.toToken] || 0;
  const fromValueUSD = activity.fromAmount * fromTokenPrice;
  const toValueUSD = activity.toAmount * toTokenPrice;

  return (
    <AnimatePresence>
      <motion.div 
        initial={isNew ? { scale: 0.95, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
        onClick={() => setShowDetails(!showDetails)}
        className={`
          py-2 px-3 rounded-lg transition-colors cursor-pointer
          hover:bg-yellow-600/10
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

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 text-sm text-yellow-600/80"
            >
              <div className="space-y-1">
                <div>From Value: {formatPriceUSD(fromValueUSD)}</div>
                <div>To Value: {formatPriceUSD(toValueUSD)}</div>
                <div>Rate: 1 {activity.fromToken} = {(activity.toAmount / activity.fromAmount).toFixed(6)} {activity.toToken}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};