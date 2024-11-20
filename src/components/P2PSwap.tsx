import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { TokenSelect } from './TokenSelect';
import { P2PSwapLogo } from './P2PSwapLogo';
import { OrderCard } from './OrderCard';
import { Order } from '../types';

export const P2PSwap: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    setOrders(data || []);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAmount || !toAmount || !swapTx) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from('orders')
      .insert([{
        from_token: fromToken.symbol,
        to_token: toToken.symbol,
        from_amount: parseInt(fromAmount),
        to_amount: parseInt(toAmount),
        swap_tx: swapTx,
        claimed: false,
        claim_count: 0
      }]);

    if (error) {
      console.error('Error creating order:', error);
    } else {
      setFromAmount('');
      setToAmount('');
      setSwapTx('');
      fetchOrders(); // Refresh orders after creating new one
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('any')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => 
              prev.map(order => 
                order.id === payload.new.id ? payload.new as Order : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const activeOrders = orders.filter(order => !order.claimed);
  const claimedOrders = orders.filter(order => order.claimed);

  return (
    <div className="container mx-auto px-4">
      <P2PSwapLogo className="mb-6" />

      <form onSubmit={handleCreateOrder} className="mb-12">
        <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">From Token</label>
              <div className="flex gap-4">
                <TokenSelect
                  tokens={TOKENS}
                  selectedToken={fromToken}
                  onChange={setFromToken}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
                  placeholder="Amount"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">To Token</label>
              <div className="flex gap-4">
                <TokenSelect
                  tokens={TOKENS}
                  selectedToken={toToken}
                  onChange={setToToken}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
                  placeholder="Amount"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-yellow-600 mb-2">
              <a 
                href="https://photonic-test.radiant4people.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-500 no-underline"
              >
                Swap in Photonic Wallet
              </a> with TX:
            </p>
            <input
              type="text"
              value={swapTx}
              onChange={(e) => setSwapTx(e.target.value)}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
              placeholder="Enter your swap transaction"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Swap Order'}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
            Active Orders
          </h2>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600/10 hover:bg-yellow-600/20 rounded-lg text-yellow-600 hover:text-yellow-500 transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {activeOrders.length > 0 ? (
          activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <p className="text-center text-yellow-600/80">No active orders</p>
        )}
      </div>

      {claimedOrders.length > 0 && (
        <div className="mt-12 space-y-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8 text-center">
            Claimed Orders
          </h2>
          {claimedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};