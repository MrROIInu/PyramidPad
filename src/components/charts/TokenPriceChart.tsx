import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTokenClaims } from '../../hooks/useTokenClaims';
import { formatPriceUSD } from '../../lib/prices/priceFormatter';

interface TokenPriceChartProps {
  symbol: string;
  timeframe: '1d' | '7d';
}

export const TokenPriceChart: React.FC<TokenPriceChartProps> = ({ symbol, timeframe }) => {
  const { claimStats, activity, adjustedPrice } = useTokenClaims(symbol);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Price: ${formatPriceUSD(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number) => formatPriceUSD(value)
        }
      }
    }
  };

  const data = {
    labels: Array(24).fill('').map((_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - (23 - i));
      return date.toLocaleTimeString();
    }),
    datasets: [{
      label: `${symbol} Price`,
      data: Array(24).fill(adjustedPrice),
      borderColor: '#CA8A04',
      tension: 0.4
    }]
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-yellow-600">Price Chart</h3>
        <div className="text-right">
          <p className="text-sm text-yellow-600/80">Current Price</p>
          <p className="text-lg font-semibold">{formatPriceUSD(adjustedPrice)}</p>
        </div>
      </div>
      <div style={{ height: '300px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};