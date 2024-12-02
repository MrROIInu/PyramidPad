import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSwapContext } from '../../contexts/SwapContext';
import { useRealtimePrices } from '../../hooks/useRealtimePrices';
import { usePriceHistory } from '../../hooks/usePriceHistory';
import { formatPriceUSD } from '../../lib/tokenPrices';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const SelectedTokenChart: React.FC = () => {
  const { selectedToken } = useSwapContext();
  const prices = useRealtimePrices();
  const { priceHistory } = usePriceHistory();
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('7d');

  const chartData = React.useMemo(() => {
    const history = priceHistory[selectedToken.symbol] || [];
    const dataPoints = timeframe === '1d' ? 24 : 168; // 24 hours or 7 days
    const relevantHistory = history.slice(-dataPoints);
    
    const timestamps = relevantHistory.map((_, index) => {
      const date = new Date();
      if (timeframe === '1d') {
        date.setHours(date.getHours() - (relevantHistory.length - index - 1));
        return date.toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });
      } else {
        date.setDate(date.getDate() - (relevantHistory.length - index - 1));
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    });

    return {
      labels: timestamps,
      datasets: [
        {
          label: `${selectedToken.symbol} Price`,
          data: relevantHistory,
          borderColor: '#CA8A04',
          backgroundColor: 'rgba(202, 138, 4, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    };
  }, [selectedToken.symbol, priceHistory, timeframe]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#CA8A04',
        bodyColor: '#fff',
        borderColor: '#CA8A04',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `Price: ${formatPriceUSD(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#CA8A04',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      },
      y: {
        grid: {
          color: 'rgba(202, 138, 4, 0.1)'
        },
        ticks: {
          color: '#CA8A04',
          callback: (value: number) => formatPriceUSD(value)
        }
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={selectedToken.imageUrl} 
            alt={selectedToken.symbol} 
            className="w-8 h-8 rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold">{selectedToken.symbol} Price Chart</h3>
            <p className="text-yellow-600">Current Price: {formatPriceUSD(prices[selectedToken.symbol])}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('1d')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              timeframe === '1d'
                ? 'bg-yellow-600 text-white'
                : 'text-yellow-600 hover:bg-yellow-600/10'
            }`}
          >
            1D
          </button>
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              timeframe === '7d'
                ? 'bg-yellow-600 text-white'
                : 'text-yellow-600 hover:bg-yellow-600/10'
            }`}
          >
            7D
          </button>
        </div>
      </div>
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};