import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
  trades: any[];
  timeframe: '1d' | '7d';
}

export const PriceChart: React.FC<PriceChartProps> = ({ trades, timeframe }) => {
  const chartData = useMemo(() => {
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
          label: 'DOGE/RXD Price',
          data: prices,
          borderColor: '#CA8A04',
          backgroundColor: 'rgba(202, 138, 4, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [trades, timeframe]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#CA8A04',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(202, 138, 4, 0.1)',
        },
        ticks: {
          color: '#CA8A04',
        },
      },
      y: {
        grid: {
          color: 'rgba(202, 138, 4, 0.1)',
        },
        ticks: {
          color: '#CA8A04',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};