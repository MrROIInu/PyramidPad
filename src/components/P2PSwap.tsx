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
  ratio: string;
  onCopy: (tx: string) => void;
  copiedTx: string;
  onClaim: (id: number) => Promise<void>;
  getRatioColor: (ratio: string) => string;
}

const getRatioColor = (ratio: string) => {
  if (!ratio) return '';
  const ratioNum = parseFloat(ratio.split(':')[1]);
  if (ratioNum <= 6) return 'text-green-500';
  if (ratioNum <= 10) return 'text-yellow-500';
  return 'text-red-500';
};

export const P2PSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [copiedTx, setCopiedTx] = useState('');

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
  };

  const calculateRatio = (fromToken: typeof TOKENS[0], toToken: typeof TOKENS[0], fromAmt: string, toAmt: string) => {
    if (!fromAmt || !toAmt) return '';
    
    const ratio = (Number(fromAmt) * toToken.totalSupply) / (Number(toAmt) * fromToken.totalSupply);
    return `1:${ratio.toFixed(2)}`;
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

  const handleClaim = async (id: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ claimed: true })
      .eq('id', id);

    if (error) {
      console.error('Error claiming order:', error);
      return;
    }

    await fetchOrders();
  };

  const handleCopyTx = async (tx: string) => {
    try {
      await navigator.clipboard.writeText(tx);
      setCopiedTx(tx);
      setTimeout(() => setCopiedTx(''), 10000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const activeOrders = orders.filter(order => !order.claimed);
  const claimedOrders = orders.filter(order => order.claimed);

  return (
    <div className="container mx-auto px-4">
      <P2PSwapLogo className="mb-6" />
      
      <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
                placeholder="Amount"
                min="1"
                step="1"
              />
            </div>
          </div>
        </div>

        {fromAmount && toAmount && (
          <div className="mt-4">
            <p className={`text-lg ${getRatioColor(calculateRatio(fromToken, toToken, fromAmount, toAmount))}`}>
              Trade Ratio: {calculateRatio(fromToken, toToken, fromAmount, toAmount)} (compared with tokens total supply)
            </p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-yellow-600 mb-2">
            <a 
              href="https://photonic-test.radiant4people.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-500 transition-colors no-underline"
            >
              Swap in Photonic Wallet
            </a> with TX:
          </p>
          <input
            type="text"
            value={swapTx}
            onChange={(e) => setSwapTx(e.target.value)}
            className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-yellow-600"
            placeholder="Enter your swap transaction"
          />
        </div>

        <button
          onClick={handleCreateOrder}
          disabled={!fromAmount || !toAmount || !swapTx}
          className="mt-6 w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50"
        >
          Create Swap Order
        </button>
      </div>

      {activeOrders.length > 0 && (
        <>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8 text-center">
            Active Orders
          </h2>
          <div className="grid grid-cols-1 gap-6 mb-16">
            {activeOrders.map(order => {
              const fromTokenData = TOKENS.find(t => t.symbol === order.from_token)!;
              const toTokenData = TOKENS.find(t => t.symbol === order.to_token)!;
              const ratio = calculateRatio(
                fromTokenData,
                toTokenData,
                order.from_amount.toString(),
                order.to_amount.toString()
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
                  getRatioColor={getRatioColor}
                />
              );
            })}
          </div>
        </>
      )}

      {claimedOrders.length > 0 && (
        <>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8 text-center">
            Claimed Orders
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {claimedOrders.map(order => {
              const fromTokenData = TOKENS.find(t => t.symbol === order.from_token)!;
              const toTokenData = TOKENS.find(t => t.symbol === order.to_token)!;
              const ratio = calculateRatio(
                fromTokenData,
                toTokenData,
                order.from_amount.toString(),
                order.to_amount.toString()
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
                  getRatioColor={getRatioColor}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  fromTokenData,
  toTokenData,
  ratio,
  onCopy,
  copiedTx,
  onClaim,
  getRatioColor
}) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    await onClaim(order.id);
    setIsClaiming(false);
  };

  const handleCopyClick = async (tx: string) => {
    try {
      await navigator.clipboard.writeText(tx);
      onCopy(tx);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
          <span className="text-lg">{order.from_amount} {fromTokenData.symbol}</span>
        </div>
        <ArrowLeftRight className="text-yellow-600" />
        <div className="flex items-center gap-2">
          <img
            src={toTokenData.imageUrl}
            alt={toTokenData.symbol}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-lg">{order.to_amount} {toTokenData.symbol}</span>
        </div>
      </div>

      <p className={`text-lg mb-4 ${getRatioColor(ratio)}`}>
        Trade Ratio: {ratio} (compared with tokens total supply)
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
            onClick={() => handleCopyClick(order.swap_tx)}
          >
            {order.swap_tx}
          </code>
          <button
            onClick={() => handleCopyClick(order.swap_tx)}
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
          onClick={handleClaim}
          disabled={isClaiming}
          className="bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-8 py-3 text-lg font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50"
        >
          {isClaiming ? 'Claiming...' : 'Claim'}
        </button>
      ) : (
        <p className="text-yellow-600 text-lg font-semibold">
          Claimed
        </p>
      )}
    </div>
  );
};