import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrderList } from '../components/OrderList';
import { useOrders } from '../hooks/useOrders';

export const LatestOrders: React.FC = () => {
  const { orders, onClaim, onCancel } = useOrders();
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get('highlight');

  // Get latest 30 orders
  const latestOrders = orders
    .filter(order => !order.claimed && order.status !== 'cancelled')
    .slice(0, 30);

  useEffect(() => {
    if (highlightOrderId) {
      const element = document.getElementById(`order-${highlightOrderId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-order');
        setTimeout(() => {
          element.classList.remove('highlight-order');
        }, 3000);
      }
    }
  }, [highlightOrderId]);

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