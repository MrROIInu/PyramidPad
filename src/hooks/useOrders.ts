import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onClaim = async (id: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ claimed: true })
      .eq('id', id);

    if (!error) {
      fetchOrders();
    }
  };

  const onCancel = async (id: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (!error) {
      fetchOrders();
    }
  };

  return { orders, onClaim, onCancel };
};