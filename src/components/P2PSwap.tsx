import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { TokenSelect } from './TokenSelect';
import { P2PSwapLogo } from './P2PSwapLogo';
import { TOKENS } from '../data/tokens';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';

export const P2PSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedTx, setCopiedTx] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const calculateRatio = (amount1: number, supply1: number, amount2: number, supply2: number) => {
    const ratio = (amount1 / supply1) / (amount2 / supply2);
    return ratio;
  };

  const getRatioColor = (ratio: number) => {
    if (ratio <= 6) return 'text-green-500';
    if (ratio <= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleCreateOrder = async () => {
    if (!fromAmount || !toAmount || !swapTx || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
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
        return;
      }

      // Reset form
      setFromAmount('');
      setToAmount('');
      setSwapTx('');
      
      // Fetch updated orders
      fetchOrders();
    } catch (err) {
      console.error('Error creating order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = async (orderId: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ claimed: true, claim_count: 1 })
      .eq('id', orderId);

    if (error) {
      console.error('Error claiming order:', error);
      return;
    }

    fetchOrders();
  };

  const handleCopyTx = async (tx: string) => {
    await navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    setTimeout(() => setCopiedTx(''), 2000);
  };

  return (
    <div className="container mx-auto px-4">
      <P2PSwapLogo className="mb-6" />

      {/* Create Order Form */}
      <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm mb-8">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
          Create Swap Order
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="flex-1 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                  placeholder="Amount"
                  min="1"
                  step="1"
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
                  className="flex-1 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                  placeholder="Amount"
                  min="1"
                  step="1"
                />
              </div>
            </div>
          </div>

          {fromAmount && toAmount && (
            <div className="text-center">
              {(() => {
                const ratio = calculateRatio(
                  parseInt(fromAmount),
                  fromToken.totalSupply,
                  parseInt(toAmount),
                  toToken.totalSupply
                );
                return (
                  <p className={`text-lg ${getRatioColor(ratio)}`}>
                    Swap Ratio: 1:{ratio.toFixed(2)} (compared with tokens total supply)
                  </p>
                );
              })()}
            </div>
          )}

          <div>
            <p className="text-yellow-600 mb-2">
              Swap in{' '}
              <a 
                href="https://photonic-test.radiant4people.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-500 hover:text-yellow-400"
              >
                Photonic Wallet
              </a>{' '}
              with TX:
            </p>
            <input
              type="text"
              value={swapTx}
              onChange={(e) => setSwapTx(e.target.value)}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
              placeholder="Enter your swap transaction"
            />
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={!fromAmount || !toAmount || !swapTx || isSubmitting}
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Swap Order
          </button>
        </div>
      </div>

      {/* Active Orders */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
          Active Orders
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {orders.filter(order => !order.claimed).map((order) => {
            const fromTokenData = TOKENS.find(t => t.symbol === order.from_token);
            const toTokenData = TOKENS.find(t => t.symbol === order.to_token);
            
            if (!fromTokenData || !toTokenData) return null;

            const ratio = calculateRatio(
              order.from_amount,
              fromTokenData.totalSupply,
              order.to_amount,
              toTokenData.totalSupply
            );

            return (
              <div
                key={order.id}
                className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={fromTokenData.imageUrl}
                      alt={fromTokenData.symbol}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{order.from_amount}</p>
                      <p className="text-yellow-600">{fromTokenData.symbol}</p>
                    </div>
                  </div>

                  <div className="text-yellow-600">↔</div>

                  <div className="flex items-center gap-4">
                    <img
                      src={toTokenData.imageUrl}
                      alt={toTokenData.symbol}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{order.to_amount}</p>
                      <p className="text-yellow-600">{toTokenData.symbol}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className={`text-lg ${getRatioColor(ratio)}`}>
                      Trade Ratio: 1:{ratio.toFixed(2)} (compared with tokens total supply)
                    </p>
                    <p className="text-yellow-600 mt-1">
                      Swap in{' '}
                      <a 
                        href="https://photonic-test.radiant4people.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-500 hover:text-yellow-400"
                      >
                        Photonic Wallet
                      </a>{' '}
                      with TX:
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-black/30 rounded px-2 py-1 text-sm break-all">
                        {order.swap_tx}
                      </code>
                      <button
                        onClick={() => handleCopyTx(order.swap_tx)}
                        className="text-yellow-600 hover:text-yellow-500"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    {copiedTx === order.swap_tx && (
                      <p className="text-green-500 text-sm mt-1">
                        Copied to clipboard. Use it in Photonic Wallet to make the swap.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleClaim(order.id)}
                    className="bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-2 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
                  >
                    Claim
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claimed Orders */}
      {orders.some(order => order.claimed) && (
        <div className="space-y-6 mt-8">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
            Claimed Orders
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {orders.filter(order => order.claimed).map((order) => {
              const fromTokenData = TOKENS.find(t => t.symbol === order.from_token);
              const toTokenData = TOKENS.find(t => t.symbol === order.to_token);
              
              if (!fromTokenData || !toTokenData) return null;

              const ratio = calculateRatio(
                order.from_amount,
                fromTokenData.totalSupply,
                order.to_amount,
                toTokenData.totalSupply
              );

              return (
                <div
                  key={order.id}
                  className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm opacity-75"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={fromTokenData.imageUrl}
                        alt={fromTokenData.symbol}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="text-center">
                        <p className="text-2xl font-bold">{order.from_amount}</p>
                        <p className="text-yellow-600">{fromTokenData.symbol}</p>
                      </div>
                    </div>

                    <div className="text-yellow-600">↔</div>

                    <div className="flex items-center gap-4">
                      <img
                        src={toTokenData.imageUrl}
                        alt={toTokenData.symbol}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="text-center">
                        <p className="text-2xl font-bold">{order.to_amount}</p>
                        <p className="text-yellow-600">{toTokenData.symbol}</p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className={`text-lg ${getRatioColor(ratio)}`}>
                        Trade Ratio: 1:{ratio.toFixed(2)} (compared with tokens total supply)
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 bg-black/30 rounded px-2 py-1 text-sm break-all">
                          {order.swap_tx}
                        </code>
                        <button
                          onClick={() => handleCopyTx(order.swap_tx)}
                          className="text-yellow-600 hover:text-yellow-500"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      {copiedTx === order.swap_tx && (
                        <p className="text-green-500 text-sm mt-1">
                          Copied to clipboard
                        </p>
                      )}
                    </div>

                    <div className="text-yellow-600 font-semibold">
                      Claimed
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};