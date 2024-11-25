import React, { useState } from 'react';
import { formatPriceUSD } from '../lib/tokenPrices';

interface Transaction {
  id: number;
  fromToken: string;
  fromAmount: number;
  toToken: string;
  toAmount: number;
  price: number;
  floorPriceChange: number;
  date: Date;
  status: 'completed' | 'cancelled';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'completed' | 'cancelled'>('completed');

  const filteredTransactions = transactions.filter(tx => tx.status === activeTab);

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'completed'
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'cancelled'
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          Cancelled
        </button>
      </div>

      <div className="space-y-4">
        {filteredTransactions.map(tx => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 bg-black/20 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={`https://static.wixstatic.com/media/c0fd9f_33dd965b95d54dfe9af12ed99fe5c43a~mv2.png`}
                  alt={tx.fromToken}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="font-medium">{tx.fromToken}</span>
                  <span className="text-sm text-gray-400 block">
                    {tx.fromAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-yellow-600">→</span>
              <div className="flex items-center gap-2">
                <img
                  src={`https://static.wixstatic.com/media/c0fd9f_b30b39721c80429ebba9a87f706cf9a7~mv2.webp`}
                  alt={tx.toToken}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="font-medium">{tx.toToken}</span>
                  <span className="text-sm text-gray-400 block">
                    {tx.toAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-medium">{formatPriceUSD(tx.price)}</div>
              <div className={`text-sm ${
                tx.floorPriceChange >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {tx.floorPriceChange >= 0 ? '+' : ''}
                {tx.floorPriceChange.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">
                {tx.date.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};