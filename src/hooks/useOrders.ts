import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { updateTokenPriceAfterClaim } from '../lib/priceManager';
import { Order } from '../types';
import { isWalletAllowed } from '../lib/walletManager';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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

      // Check if wallet is allowed to claim
      const isAllowed = await isWalletAllowed(claimingWalletAddress);
      if (!isAllowed) {
        setError('Your wallet is not authorized to claim orders');
        return;
      }
      
      // Get order before claiming
      const { data: order, error: getError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (getError) throw getError;

      // Validate order
      if (!order) {
        setError('Order not found');
        return;
      }

      if (order.claimed) {
        setError('This order has already been claimed');
        return;
      }

      if (order.status === 'cancelled') {
        setError('This order has been cancelled');
        return;
      }

      if (order.wallet_address === claimingWalletAddress) {
        setError('You cannot claim your own orders');
        return;
      }

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          claimed: true,
          claimed_by: claimingWalletAddress,
          claimed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update token prices
      await updateTokenPriceAfterClaim(order);

      // Show success notification
      setNotification({
        type: 'success',
        message: `Successfully claimed ${order.from_amount} ${order.from_token} ➔ ${order.to_amount} ${order.to_token}`
      });

      await fetchOrders();
    } catch (err) {
      console.error('Error claiming order:', err);
      setError('Failed to claim order. Please try again.');
    }
  }, [fetchOrders]);

  const onCancel = useCallback(async (id: number, walletAddress: string) => {
    try {
      setError(null);

      // Get order before cancelling
      const { data: order, error: getError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (getError) throw getError;

      // Validate order
      if (!order) {
        setError('Order not found');
        return;
      }

      if (order.wallet_address !== walletAddress) {
        setError('You can only cancel your own orders');
        return;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order. Please try again.');
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
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
    notification,
    onClaim,
    onCancel,
    fetchOrders,
    clearNotification: () => setNotification(null)
  };
};