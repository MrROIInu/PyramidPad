import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { isWalletAllowed } from '../lib/walletManager';
import { updatePriceAfterClaim } from '../lib/prices/priceManager';

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
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onClaim = useCallback(async (id: number, claimingWalletAddress: string) => {
    try {
      setError(null);

      const isAllowed = await isWalletAllowed(claimingWalletAddress);
      if (!isAllowed) {
        setError('Your wallet is not authorized to claim orders');
        return;
      }

      const { data: order, error: getError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (getError) throw getError;
      if (!order) {
        setError('Order not found');
        return;
      }

      if (order.claimed) {
        setError('This order has already been claimed');
        return;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          claimed: true,
          claimed_by: claimingWalletAddress,
          claimed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update token prices after successful claim
      await updatePriceAfterClaim(order);

      // Refresh orders
      await fetchOrders();

    } catch (err) {
      console.error('Error claiming order:', err);
      setError('Failed to claim order. Please try again.');
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        })
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
    fetchOrders
  };
};