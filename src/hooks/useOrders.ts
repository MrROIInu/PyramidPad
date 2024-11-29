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
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
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
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchOrders();
    } catch (err) {
      console.error('Error claiming order:', err);
      setError('Failed to claim order');
    }
  }, [fetchOrders]);

  const onCancel = useCallback(async (id: number) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order');
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();

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