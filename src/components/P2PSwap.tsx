import React, { useState, useEffect } from 'react';
import { Copy, ArrowRightLeft } from 'lucide-react';
import { TokenSelect } from './TokenSelect';
import { P2PSwapLogo } from './P2PSwapLogo';
import { TOKENS } from '../data/tokens';
import { supabase, Order } from '../lib/supabase';

// Initial orders for development/testing
const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    fromToken: 'RXD',
    toToken: 'RADCAT',
    fromAmount: 1000,
    toAmount: 1000,
    swapTx: '0100000001dc286b296bff8a04af346371d5761344bb6fc7e3550a33d5bc7a90142342fb29000000006b483045022100e60fdf0c50df3928e50a063e64ed21af6429b703abbefbd0bfcfb7d512690029022071dd038f1fff9a978163d8d23cad3144c1ec45241e4ed69e8424e9d91e20640ac321029fcf6dc8eee648c271194df31e85be89fcc3996e5c4561cfdfd7c8e172f31a5fffffffff01007076af053200001976a91432a0a948b9fbf25697a6e47bb60e96ae6b6dd0a288ac00000000',
    claimed: false,
    created_at: '2024-02-15T12:00:00Z'
  }
];

export const P2PSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [copiedTx, setCopiedTx] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);

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

    setOrders(data || INITIAL_ORDERS);
  };

  const calculateRatio = (amount1: number, supply1: number, amount2: number, supply2: number) => {
    const ratio = (amount1 / supply1) / (amount2 / supply2);
    return ratio < 1 ? 1 / ratio : ratio;
  };

  const getRatioColor = (ratio: number) => {
    if (ratio <= 6) return 'text-green-500';
    if (ratio <= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatRatio = (ratio: number) => {
    return ratio < 1 ? `${ratio.toFixed(2)}:1` : `1:${ratio.toFixed(2)}`;
  };

  const handleFromAmountChange = (value: string) => {
    const amount = value.replace(/[^0-9]/g, '');
    setFromAmount(amount);
  };

  const handleToAmountChange = (value: string) => {
    const amount = value.replace(/[^0-9]/g, '');
    setToAmount(amount);
  };

  const handleCreateOrder = async () => {
    if (!fromAmount || !toAmount || !swapTx) return;

    const newOrder = {
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      fromAmount: Number(fromAmount),
      toAmount: Number(toAmount),
      swapTx,
      claimed: false
    };

    const { error } = await supabase
      .from('orders')
      .insert([newOrder]);

    if (error) {
      console.error('Error creating order:', error);
      return;
    }

    setFromAmount('');
    setToAmount('');
    setSwapTx('');
  };

  const handleClaim = async (orderId: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ claimed: true })
      .eq('id', orderId);

    if (error) {
      console.error('Error claiming order:', error);
      return;
    }
  };

  const handleCopyTx = async (tx: string) => {
    try {
      await navigator.clipboard.writeText(tx);
      setCopiedTx(tx);
      setShowCopyMessage(true);
      setTimeout(() => {
        setCopiedTx('');
        setShowCopyMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTokenBySymbol = (symbol: string) => {
    return TOKENS.find(t => t.symbol === symbol) || TOKENS[0];
  };

  return (
    <div className="container mx-auto px-4">
      <P2PSwapLogo className="mb-8" />

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
                type="text"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="Amount"
                className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
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
                type="text"
                value={toAmount}
                onChange={(e) => handleToAmountChange(e.target.value)}
                placeholder="Amount"
                className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
              />
            </div>
          </div>
        </div>

        {fromAmount && toAmount && (
          <div className="mt-4">
            <p className="text-center">
              Trade Ratio:{' '}
              <span className={getRatioColor(calculateRatio(
                Number(fromAmount),
                fromToken.totalSupply,
                Number(toAmount),
                toToken.totalSupply
              ))}>
                {formatRatio(calculateRatio(
                  Number(fromAmount),
                  fromToken.totalSupply,
                  Number(toAmount),
                  toToken.totalSupply
                ))}
              </span>
              {' '}(compared with tokens total supply)
            </p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-yellow-600 mb-2">
            Swap in{' '}
            <a 
              href="https://photonic-test.radiant4people.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-500 hover:text-yellow-400 no-underline"
            >
              Photonic Wallet
            </a>
            {' '}with TX:
          </p>
          <input
            type="text"
            value={swapTx}
            onChange={(e) => setSwapTx(e.target.value)}
            placeholder="Enter your swap transaction"
            className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-yellow-600 font-mono"
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

      {/* Active Orders */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 text-center">
          Active Orders
        </h2>
        
        {orders.filter(order => !order.claimed).map((order) => {
          const fromTokenData = getTokenBySymbol(order.fromToken);
          const toTokenData = getTokenBySymbol(order.toToken);
          const ratio = calculateRatio(
            order.fromAmount,
            fromTokenData.totalSupply,
            order.toAmount,
            toTokenData.totalSupply
          );

          return (
            <div key={order.id} className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <img src={fromTokenData.imageUrl} alt={order.fromToken} className="w-8 h-8 rounded-full" />
                  <span>{order.fromAmount} {order.fromToken}</span>
                </div>
                <ArrowRightLeft className="text-yellow-600" />
                <div className="flex items-center gap-2">
                  <img src={toTokenData.imageUrl} alt={order.toToken} className="w-8 h-8 rounded-full" />
                  <span>{order.toAmount} {order.toToken}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className={`${getRatioColor(ratio)} text-sm`}>
                  Trade Ratio: {formatRatio(ratio)} (compared with tokens total supply)
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  <a 
                    href="https://photonic-test.radiant4people.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-500 hover:text-yellow-400 no-underline"
                  >
                    Swap in Photonic Wallet
                  </a>
                  {' '}with TX:
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 font-mono text-sm overflow-x-auto">
                  {order.swapTx}
                </div>
                <button
                  onClick={() => handleCopyTx(order.swapTx)}
                  className="bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg px-4 transition-colors"
                >
                  <Copy size={20} />
                </button>
              </div>

              {copiedTx === order.swapTx && showCopyMessage && (
                <p className="text-green-500 text-sm mt-2">
                  Copied to clipboard. Use it in Photonic Wallet to make the swap.
                </p>
              )}

              <button
                onClick={() => handleClaim(order.id)}
                className="mt-4 bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
              >
                Claim
              </button>
            </div>
          );
        })}
      </div>

      {/* Claimed Orders */}
      {orders.some(order => order.claimed) && (
        <div className="mt-12 space-y-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 text-center">
            Claimed Orders
          </h2>
          
          {orders.filter(order => order.claimed).map((order) => {
            const fromTokenData = getTokenBySymbol(order.fromToken);
            const toTokenData = getTokenBySymbol(order.toToken);
            const ratio = calculateRatio(
              order.fromAmount,
              fromTokenData.totalSupply,
              order.toAmount,
              toTokenData.totalSupply
            );

            return (
              <div key={order.id} className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm opacity-75">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <img src={fromTokenData.imageUrl} alt={order.fromToken} className="w-8 h-8 rounded-full" />
                    <span>{order.fromAmount} {order.fromToken}</span>
                  </div>
                  <ArrowRightLeft className="text-yellow-600" />
                  <div className="flex items-center gap-2">
                    <img src={toTokenData.imageUrl} alt={order.toToken} className="w-8 h-8 rounded-full" />
                    <span>{order.toAmount} {order.toToken}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className={`${getRatioColor(ratio)} text-sm`}>
                    Trade Ratio: {formatRatio(ratio)} (compared with tokens total supply)
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 font-mono text-sm overflow-x-auto">
                    {order.swapTx}
                  </div>
                  <button
                    onClick={() => handleCopyTx(order.swapTx)}
                    className="bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg px-4 transition-colors"
                  >
                    <Copy size={20} />
                  </button>
                </div>

                {copiedTx === order.swapTx && showCopyMessage && (
                  <p className="text-green-500 text-sm mt-2">
                    Copied to clipboard. Use it in Photonic Wallet to make the swap.
                  </p>
                )}

                <p className="mt-4 text-yellow-600/80 text-sm">Claimed</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};