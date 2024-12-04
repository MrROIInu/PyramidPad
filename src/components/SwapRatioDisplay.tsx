import React from 'react';
import { calculateMarketDeviation } from '../lib/prices/marketPrice';

interface SwapRatioDisplayProps {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  className?: string;
}

export const SwapRatioDisplay: React.FC<SwapRatioDisplayProps> = ({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  className = ''
}) => {
  const { deviation, status } = calculateMarketDeviation(
    fromToken,
    toToken,
    fromAmount,
    toAmount
  );

  const getStatusColor = () => {
    switch (status) {
      case 'above':
        return 'text-green-500';
      case 'below':
        return 'text-red-500';
      default:
        return 'text-yellow-600';
    }
  };

  const getMessage = () => {
    if (status === 'equal') {
      return 'Equal to market price';
    }
    return `${deviation.toFixed(2)}% ${status} market price`;
  };

  return (
    <div className={`text-center ${className} ${getStatusColor()}`}>
      <span className="font-medium">
        {getMessage()}
      </span>
    </div>
  );
};