import React from 'react';

interface PriceChangeIndicatorProps {
  change: number;
  showIcon?: boolean;
  className?: string;
}

export const PriceChangeIndicator: React.FC<PriceChangeIndicatorProps> = ({
  change,
  showIcon = true,
  className = ''
}) => {
  const isPositive = change > 0;
  const color = isPositive ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-yellow-600';

  return (
    <span className={`${color} ${className}`}>
      {showIcon && (
        <span className="mr-1">
          {isPositive ? '↑' : change < 0 ? '↓' : '→'}
        </span>
      )}
      {change > 0 ? '+' : ''}{change.toFixed(2)}%
    </span>
  );
};