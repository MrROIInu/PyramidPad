import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy } from 'lucide-react';
import { TokenSelect } from './TokenSelect';
import { TOKENS } from '../data/tokens';
import { P2PSwapLogo } from './P2PSwapLogo';

interface SwapOrder {
  id: number;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  fromTokenImage: string;
  toTokenImage: string;
  swapTx: string;
}

// Load orders from localStorage
const loadOrders = () => {
  const savedOrders = localStorage.getItem('p2pswap_orders');
  return savedOrders ? JSON.parse(savedOrders) : [];
};

const loadClaimedOrders = () => {
  const savedOrders = localStorage.getItem('p2pswap_claimed_orders');
  return savedOrders ? JSON.parse(savedOrders) : [];
};

export const P2PSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [copiedTx, setCopiedTx] = useState('');
  const [orders, setOrders] = useState<SwapOrder[]>(loadOrders());
  const [claimedOrders, setClaimedOrders] = useState<SwapOrder[]>(loadClaimedOrders());

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('p2pswap_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('p2pswap_claimed_orders', JSON.stringify(claimedOrders));
  }, [claimedOrders]);

  const handleFromAmountChange = (value: string) => {
    // Only allow whole numbers
    if (/^\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleToAmountChange = (value: string) => {
    // Only allow whole numbers
    if (/^\d*$/.test(value)) {
      setToAmount(value);
    }
  };

  const handleCopyTx = async (tx: string) => {
    await navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    setTimeout(() => setCopiedTx(''), 3000);
  };

  const handleCreateOrder = () => {
    if (!fromAmount || !toAmount || !swapTx) return;

    const newOrder: SwapOrder = {
      id: Date.now(),
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      fromAmount: Number(fromAmount),
      toAmount: Number(toAmount),
      fromTokenImage: fromToken.imageUrl,
      toTokenImage: toToken.imageUrl,
      swapTx
    };

    setOrders([...orders, newOrder]);
    setFromAmount('');
    setToAmount('');
    setSwapTx('');
  };

  const handleClaim = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setOrders(orders.filter(o => o.id !== orderId));
      setClaimedOrders([order, ...claimedOrders]);
    }
  };

  const calculateRatio = (amount1: number, supply1: number, amount2: number, supply2: number) => {
    // Calculate the percentage of total supply for each amount
    const percent1 = (amount1 / supply1);
    const percent2 = (amount2 / supply2);
    
    // Calculate the ratio between these percentages
    return percent2 / percent1;
  };

  const getSwapRatioColor = (ratio: number) => {
    if (ratio <= 6) return 'text-green-500';
    if (ratio <= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatRatio = (ratio: number) => {
    if (ratio < 1) {
      return `${(1 / ratio).toFixed(2)}:1`;
    }
    return `1:${ratio.toFixed(2)}`;
  };

  const swapRatio = fromAmount && toAmount 
    ? calculateRatio(
        Number(fromAmount), 
        fromToken.totalSupply,
        Number(toAmount), 
        toToken.totalSupply
      )
    : null;

  const OrderCard = ({ order, showClaimButton = false }: { order: SwapOrder, showClaimButton?: boolean }) => {
    const fromToken = TOKENS.find(t => t.symbol === order.fromToken);
    const toToken = TOKENS.find(t => t.symbol === order.toToken);
    
    const ratio = fromToken && toToken 
      ? calculateRatio(
          order.fromAmount,
          fromToken.totalSupply,
          order.toAmount,
          toToken.totalSupply
        )
      : 1;
      
    const ratioColor = getSwapRatioColor(ratio);

    return (
      <div className="w-full md:w-[600px] flex-shrink-0 bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={order.fromTokenImage} alt={order.fromToken} className="w-8 h-8 rounded-full" />
              <span className="text-lg">{order.fromAmount} {order.fromToken}</span>
            </div>
            <ArrowRightLeft className="text-yellow-600" />
            <div className="flex items-center gap-2">
              <img src={order.toTokenImage} alt={order.toToken} className="w-8 h-8 rounded-full" />
              <span className="text-lg">{order.toAmount} {order.toToken}</span>
            </div>
          </div>

          <div>
            <p className={`text-sm ${ratioColor}`}>
              Trade Ratio: {formatRatio(ratio)} (compared with tokens total supply)
            </p>
            <p className="text-sm text-yellow-600/80 mt-2">
              <a href="https://photonic-test.radiant4people.com/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 no-underline">
                Swap in Photonic Wallet
              </a> with TX:
            </p>
            <div 
              className="flex items-center gap-2 mt-2 cursor-pointer group"
              onClick={() => handleCopyTx(order.swapTx)}
            >
              <code className="flex-1 text-sm bg-black/30 px-3 py-2 rounded break-all group-hover:bg-black/40 transition-colors">
                {order.swapTx}
              </code>
              <button className="text-yellow-600 hover:text-yellow-500 p-2">
                <Copy size={20} />
              </button>
            </div>
            {copiedTx === order.swapTx && (
              <p className="text-green-500 text-sm mt-2">
                Copied to clipboard. Use it in Photonic Wallet to make the swap.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            {showClaimButton ? (
              <button
                onClick={() => {
                  handleClaim(order.id);
                  handleCopyTx(order.swapTx);
                }}
                className="bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-2 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
              >
                Claim
              </button>
            ) : (
              <div className="bg-green-500/20 text-green-500 rounded-lg px-6 py-2">
                Claimed
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4">
      <P2PSwapLogo className="mb-12" />

      <div className="w-full max-w-4xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-yellow-600 mb-2">From Token</label>
                <TokenSelect
                  tokens={TOKENS}
                  selectedToken={fromToken}
                  onChange={setFromToken}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="mt-2 w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                  placeholder="Amount (whole numbers only)"
                />
              </div>
              <div>
                <label className="block text-yellow-600 mb-2">To Token</label>
                <TokenSelect
                  tokens={TOKENS}
                  selectedToken={toToken}
                  onChange={setToToken}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={toAmount}
                  onChange={(e) => handleToAmountChange(e.target.value)}
                  className="mt-2 w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                  placeholder="Amount (whole numbers only)"
                />
              </div>
            </div>

            {swapRatio && (
              <div className={`text-center ${getSwapRatioColor(swapRatio)}`}>
                Swap Ratio: {formatRatio(swapRatio)} (compared with tokens total supply)
              </div>
            )}

            <div>
              <p className="text-yellow-600 mb-2">
                <a href="https://photonic-test.radiant4people.com/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 no-underline">
                  Swap in Photonic Wallet
                </a> with TX:
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
              disabled={!fromAmount || !toAmount || !swapTx}
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Swap Order
            </button>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8 text-center">
            Active Orders
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} showClaimButton={true} />
            ))}
          </div>
        </div>
      )}

      {claimedOrders.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8 text-center">
            Claimed Orders
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {claimedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};