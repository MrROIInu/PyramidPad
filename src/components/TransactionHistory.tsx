import React, { useState } from 'react';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { TOKEN_PRICES, formatPriceUSD } from '../lib/tokenPrices';
import { Order } from '../types';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface TransactionHistoryProps {
  transactions: any[];
  orders?: Order[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, orders = [] }) => {
  const [activeTab, setActiveTab] = useState<'claimed' | 'cancelled'>('claimed');
  const [visibleOrders, setVisibleOrders] = useState(3);

  // Get claimed and cancelled orders
  const claimedOrders = orders.filter(order => order.claimed).map(order => ({
    id: `order-${order.id}`,
    from_token: order.from_token,
    to_token: order.to_token,
    from_amount: order.from_amount,
    to_amount: order.to_amount,
    price: TOKEN_PRICES[order.to_token],
    created_at: order.created_at,
    type: 'claim',
    status: 'claimed'
  }));

  const cancelledOrders = orders.filter(order => order.status === 'cancelled').map(order => ({
    id: `order-${order.id}`,
    from_token: order.from_token,
    to_token: order.to_token,
    from_amount: order.from_amount,
    to_amount: order.to_amount,
    price: TOKEN_PRICES[order.to_token],
    created_at: order.created_at,
    type: 'cancel',
    status: 'cancelled'
  }));

  const displayOrders = activeTab === 'claimed' ? claimedOrders : cancelledOrders;

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('claimed')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'claimed'
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          Claimed Orders
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'cancelled'
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          Cancelled Orders
        </button>
      </div>

      <div className="space-y-4">
        {displayOrders.slice(0, visibleOrders).map(order => {
          const fromToken = order.from_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === order.from_token);
          const toToken = order.to_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === order.to_token);

          if (!fromToken || !toToken) return null;

          return (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-black/20 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src={fromToken.imageUrl}
                    alt={fromToken.symbol}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <span className="font-medium">{fromToken.symbol}</span>
                    <span className="text-sm text-gray-400 block">
                      {order.from_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="text-yellow-600">→</span>
                <div className="flex items-center gap-2">
                  <img
                    src={toToken.imageUrl}
                    alt={toToken.symbol}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <span className="font-medium">{toToken.symbol}</span>
                    <span className="text-sm text-gray-400 block">
                      {order.to_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium">{formatPriceUSD(order.price)}</div>
                <div className="text-sm text-gray-400">
                  {new Date(order.created_at).toLocaleString()}
                </div>
                <div className={`text-sm ${order.status === 'claimed' ? 'text-yellow-600' : 'text-red-500'}`}>
                  {order.status === 'claimed' ? 'Claimed Order' : 'Cancelled Order'}
                </div>
              </div>
            </div>
          );
        })}

        {displayOrders.length === 0 && (
          <div className="text-center text-yellow-600 py-4">
            No {activeTab} orders found
          </div>
        )}

        {displayOrders.length > 3 && (
          <div className="mt-6 px-4">
            <Slider
              min={3}
              max={displayOrders.length}
              value={visibleOrders}
              onChange={(value) => setVisibleOrders(typeof value === 'number' ? value : 3)}
              railStyle={{ backgroundColor: 'rgba(202, 138, 4, 0.2)' }}
              trackStyle={{ backgroundColor: 'rgb(202, 138, 4)' }}
              handleStyle={{
                borderColor: 'rgb(202, 138, 4)',
                backgroundColor: 'rgb(202, 138, 4)'
              }}
            />
            <div className="text-center text-sm text-yellow-600 mt-2">
              Showing {visibleOrders} of {displayOrders.length} orders
            </div>
          </div>
        )}
      </div>
    </div>
  );
};