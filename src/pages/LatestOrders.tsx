import React from 'react';
import { OrderList } from '../components/OrderList';
import { useOrders } from '../hooks/useOrders';

export const LatestOrders: React.FC = () => {
  const { orders, onClaim, onCancel } = useOrders();

  // Get latest 30 orders
  const latestOrders = orders
    .filter(order => !order.claimed && order.status !== 'cancelled')
    .slice(0, 30);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8">
        Latest Orders
      </h1>
      <OrderList
        orders={latestOrders}
        onClaim={onClaim}
        onCancel={onCancel}
      />
    </div>
  );
};