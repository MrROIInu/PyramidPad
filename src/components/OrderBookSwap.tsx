import React from 'react';
import { SwapForm } from './SwapForm';
import { OrderList } from './OrderList';
import { TransactionHistory } from './TransactionHistory';
import { useOrders } from '../hooks/useOrders';

export const OrderBookSwap: React.FC = () => {
  const { orders, onClaim, onCancel } = useOrders();

  return (
    <div className="container mx-auto px-4">
      <SwapForm />

      <div className="space-y-12">
        <OrderList
          orders={orders.filter(o => !o.claimed && o.status !== 'cancelled')}
          onCancel={onCancel}
          onClaim={onClaim}
        />

        <TransactionHistory 
          transactions={[]}
          orders={orders}
        />
      </div>
    </div>
  );
};