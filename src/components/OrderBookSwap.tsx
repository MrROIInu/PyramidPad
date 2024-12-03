import React from 'react';
import { SwapForm } from './SwapForm';
import { OrderList } from './OrderList';
import { TransactionHistory } from './TransactionHistory';
import { useOrders } from '../hooks/useOrders';

export const OrderBookSwap: React.FC = () => {
  const { orders, loading, error, onClaim, onCancel, fetchOrders } = useOrders();

  return (
    <div className="container mx-auto px-4">
      <SwapForm onOrderCreated={fetchOrders} />

      <div className="space-y-12">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <OrderList
          orders={orders.filter(o => !o.claimed && o.status !== 'cancelled')}
          onCancel={onCancel}
          onClaim={onClaim}
          loading={loading}
        />

        <TransactionHistory 
          transactions={[]}
          orders={orders}
        />
      </div>
    </div>
  );
};