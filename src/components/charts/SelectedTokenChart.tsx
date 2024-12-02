import React from 'react';
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

  const chartData = React.useMemo(() => {
    const history = priceHistory[selectedToken.symbol] || [];
    const timestamps = history.map((_, index) => {
      const date = new Date();
      date.setHours(date.getHours() - (history.length - index - 1));
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    });

    return {
      labels: timestamps,
      datasets: [
        {
          label: `${selectedToken.symbol} Price`,
          data: history,
          borderColor: '#CA8A04',
          backgroundColor: 'rgba(202, 138, 4, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    };
  }, [selectedToken.symbol, priceHistory]);

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
      <div className="flex items-center gap-4 mb-6">
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
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};