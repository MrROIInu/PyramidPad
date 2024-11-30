import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // Limit to most recent 100 orders
        .timeout(10000); // 10 second timeout

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onClaim = useCallback(async (id: number) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('orders')
        .update({ claimed: true })
        .eq('id', id)
        .timeout(5000);

      if (updateError) throw updateError;
      await fetchOrders();
    } catch (err) {
      console.error('Error claiming order:', err);
      setError('Failed to claim order. Please try again.');
    }
  }, [fetchOrders]);

  const onCancel = useCallback(async (id: number) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .timeout(5000);

      if (updateError) throw updateError;
      await fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order. Please try again.');
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    onClaim,
    onCancel,
    fetchOrders
  };
};