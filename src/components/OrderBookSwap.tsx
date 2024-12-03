import React from 'react';
import { SwapForm } from './SwapForm';
import { OrderList } from './OrderList';
import { TransactionHistory } from './TransactionHistory';
import { useOrders } from '../hooks/useOrders';
import { useSwapContext } from '../contexts/SwapContext';
import { SelectedTokenChart } from './charts/SelectedTokenChart';
import { CollectionChart } from './CollectionChart';

export const OrderBookSwap: React.FC = () => {
  const { orders, loading, error, onClaim, onCancel, fetchOrders } = useOrders();
  const { selectedToken } = useSwapContext();

  // Filter orders for selected token
  const filteredOrders = orders.filter(order => 
    !order.claimed && 
    order.status !== 'cancelled' &&
    (order.from_token === selectedToken.symbol || order.to_token === selectedToken.symbol)
  );

  return (
    <div className="container mx-auto px-4">
      <SwapForm onOrderCreated={fetchOrders} />

      <div className="space-y-12">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
            {selectedToken.symbol} Price Chart
          </h2>
          <SelectedTokenChart />
        </div>

        <OrderList
          orders={filteredOrders}
          onCancel={onCancel}
          onClaim={onClaim}
          loading={loading}
        />

        <TransactionHistory 
          transactions={[]}
          orders={orders}
        />

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
            RXD20 Token Chart
          </h2>
          <CollectionChart />
        </div>
      </div>
    </div>
  );
};