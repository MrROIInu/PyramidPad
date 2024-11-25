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

interface PriceChartProps {
  trades: any[];
  timeframe: '1d' | '7d';
}

export const PriceChart: React.FC<PriceChartProps> = ({ trades, timeframe }) => {
  const chartData = React.useMemo(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() - (timeframe === '1d' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000));
    
    const filteredTrades = trades
      .filter(trade => new Date(trade.created_at) >= startTime)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const labels = filteredTrades.map(trade => 
      new Date(trade.created_at).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        ...(timeframe === '7d' && { month: 'short', day: 'numeric' })
      })
    );

    const prices = filteredTrades.map(trade => trade.price);

    return {
      labels,
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: '#CA8A04',
          backgroundColor: 'rgba(202, 138, 4, 0.1)',
          fill: true,
          tension: 0,
          pointRadius: 0,
          borderWidth: 2,
          stepped: 'before'
        }
      ]
    };
  }, [trades, timeframe]);

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
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#CA8A04',
          maxRotation: 0
        }
      },
      y: {
        grid: {
          color: 'rgba(202, 138, 4, 0.1)'
        },
        ticks: {
          color: '#CA8A04',
          callback: (value: number) => `$${value.toFixed(8)}`
        }
      }
    }
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};