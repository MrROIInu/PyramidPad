import React, { useState, useEffect } from 'react';
import { Copy, ArrowLeftRight } from 'lucide-react';
import { TokenSelect } from './TokenSelect';
import { P2PSwapLogo } from './P2PSwapLogo';
import { TOKENS } from '../data/tokens';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';

interface OrderCardProps {
  order: Order;
  fromTokenData: typeof TOKENS[0];
  toTokenData: typeof TOKENS[0];
  ratio: number;
  onCopy: (tx: string) => void;
  copiedTx: string;
  onClaim: (id: number) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  fromTokenData,
  toTokenData,
  ratio,
  onCopy,
  copiedTx,
  onClaim
}) => {
  const getRatioColor = (ratio: number) => {
    if (ratio <= 6) return 'text-green-500';
    if (ratio <= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <img
            src={fromTokenData.imageUrl}
            alt={fromTokenData.symbol}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-2xl font-bold text-white">{order.from_amount}</span>
          <span className="text-xl text-yellow-600">{fromTokenData.symbol}</span>
        </div>

        <div className="text-yellow-600 text-xl">↔</div>

        <div className="flex items-center gap-2">
          <img
            src={toTokenData.imageUrl}
            alt={toTokenData.symbol}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-2xl font-bold text-white">{order.to_amount}</span>
          <span className="text-xl text-yellow-600">{toTokenData.symbol}</span>
        </div>
      </div>

      <p className={`${getRatioColor(ratio)} text-lg mb-4`}>
        Trade Ratio: 1:{ratio.toFixed(2)} (compared with tokens total supply)
      </p>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <a 
            href="https://photonic-test.radiant4people.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 text-lg hover:text-amber-400 transition-colors no-underline"
          >
            Swap in Photonic Wallet
          </a>
          <span className="text-amber-500 text-lg">with TX:</span>
        </div>
        <div className="flex items-center gap-2 bg-black/20 rounded-lg p-4 font-mono text-sm">
          <code 
            className="flex-1 break-all cursor-pointer hover:text-yellow-500 transition-colors"
            onClick={() => onCopy(order.swap_tx)}
          >
            {order.swap_tx}
          </code>
          <button
            onClick={() => onCopy(order.swap_tx)}
            className="text-yellow-600 hover:text-yellow-500 p-1"
          >
            <Copy size={20} />
          </button>
        </div>
        {copiedTx === order.swap_tx && (
          <p className="text-green-500 text-sm mt-2">
            Copied to clipboard. Use it in Photonic Wallet to make the swap.
          </p>
        )}
      </div>

      {!order.claimed ? (
        <button
          onClick={() => onClaim(order.id)}
          className="bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-8 py-3 text-lg font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
        >
          Claim
        </button>
      ) : (
        <p className="text-yellow-600 text-lg font-semibold">
          Claimed
        </p>
      )}
    </div>
  );
};

export const P2PSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [copiedTx, setCopiedTx] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
    setLoading(false);
  };

  const calculateRatio = (
    fromAmount: number,
    fromSupply: number,
    toAmount: number,
    toSupply: number
  ) => {
    return (fromAmount / fromSupply) / (toAmount / toSupply);
  };

  const handleCreateOrder = async () => {
    if (!fromAmount || !toAmount || !swapTx) return;

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

    setFromAmount('');
    setToAmount('');
    setSwapTx('');
  };

  const handleCopyTx = async (tx: string) => {
    await navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    setTimeout(() => setCopiedTx(''), 10000);
  };

  const handleClaim = async (id: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ claimed: true })
      .eq('id', id);

    if (error) {
      console.error('Error claiming order:', error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <P2PSwapLogo className="mb-6" />

      {/* Create Order Form */}
      <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm mb-8">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
          Create Swap Order
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-yellow-600 mb-2">From</label>
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
            <label className="block text-yellow-600 mb-2">To</label>
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
          <div className="mb-6">
            <p className={`text-lg ${
              calculateRatio(
                parseInt(fromAmount),
                fromToken.totalSupply,
                parseInt(toAmount),
                toToken.totalSupply
              ) <= 6 ? 'text-green-500' : 
              calculateRatio(
                parseInt(fromAmount),
                fromToken.totalSupply,
                parseInt(toAmount),
                toToken.totalSupply
              ) <= 10 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              Trade Ratio: 1:{calculateRatio(
                parseInt(fromAmount),
                fromToken.totalSupply,
                parseInt(toAmount),
                toToken.totalSupply
              ).toFixed(2)} (compared with tokens total supply)
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-yellow-600 mb-2">
            <a 
              href="https://photonic-test.radiant4people.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-yellow-500 transition-colors no-underline"
            >
              Swap in Photonic Wallet
            </a>
            {' '}with TX:
          </label>
          <input
            type="text"
            value={swapTx}
            onChange={(e) => setSwapTx(e.target.value)}
            className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 font-mono"
            placeholder="Enter your swap transaction"
          />
        </div>

        <button
          onClick={handleCreateOrder}
          disabled={!fromAmount || !toAmount || !swapTx}
          className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Swap Order
        </button>
      </div>

      {/* Orders */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
          Active Orders
        </h2>

        {loading ? (
          <div className="text-center text-yellow-600">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-yellow-600">No active orders</div>
        ) : (
          orders.map((order) => {
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
              <OrderCard
                key={order.id}
                order={order}
                fromTokenData={fromTokenData}
                toTokenData={toTokenData}
                ratio={ratio}
                onCopy={handleCopyTx}
                copiedTx={copiedTx}
                onClaim={handleClaim}
              />
            );
          })
        )}
      </div>
    </div>
  );
};