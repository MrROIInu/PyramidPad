import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowLeftRight } from 'lucide-react';
import { OrderBookLogo } from './OrderBookLogo';
import { TestLogo } from './TestLogo';
import { TOKENS } from '../data/tokens';
import { supabase } from '../lib/supabase';
import { TokenSelect } from './TokenSelect';
import QRCode from 'react-qr-code';

interface Order {
  id: number;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  price: number;
  created_at: string;
}

interface Trade {
  id: number;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  price: number;
  created_at: string;
}

const SWAP_WALLET = '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N';

export const OrderBookDemo: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS.find(t => t.symbol === "RXD") || TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS.find(t => t.symbol === "DOGE") || TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchTrades();

    const ordersSubscription = supabase
      .channel('orderbook_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orderbook' }, 
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    const tradesSubscription = supabase
      .channel('trades_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trades' }, 
        () => {
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      tradesSubscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orderbook')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchTrades();
  };

  const handleSwitch = () => {
    setIsRxdToDoge(!isRxdToDoge);
    const newFromToken = isRxdToDoge ? toToken : fromToken;
    const newToToken = isRxdToDoge ? fromToken : toToken;
    setFromToken(newFromToken);
    setToToken(newToToken);
    setFromAmount('');
    setToAmount('');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SWAP_WALLET);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
  };

  const parseImportedTx = (text: string) => {
    const match = text.match(/🔁 Swap: (\d+(?:\.\d+)?) ([A-Za-z0-9]+) ➔ (\d+(?:\.\d+)?) ([A-Za-z0-9]+) 📋([a-zA-Z0-9]+)/);
    
    if (match) {
      const [, fromAmt, fromSymbol, toAmt, toSymbol, tx] = match;
      const foundFromToken = TOKENS.find(t => t.symbol === fromSymbol);
      const foundToToken = TOKENS.find(t => t.symbol === toSymbol);
      
      if (foundFromToken && foundToToken) {
        setFromToken(foundFromToken);
        setToToken(foundToToken);
        setFromAmount(fromAmt);
        setToAmount(toAmt);
        setSwapTx(tx);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromToken || !toToken || !fromAmount || !toAmount || !swapTx) return;

    try {
      const price = parseFloat(toAmount) / parseFloat(fromAmount);
      
      const { error } = await supabase
        .from('orderbook')
        .insert([{
          from_token: fromToken.symbol,
          to_token: toToken.symbol,
          from_amount: parseFloat(fromAmount),
          to_amount: parseFloat(toAmount),
          price,
          status: 'active'
        }]);

      if (error) throw error;

      const { error: tradeError } = await supabase
        .from('trades')
        .insert([{
          from_token: fromToken.symbol,
          to_token: toToken.symbol,
          from_amount: parseFloat(fromAmount),
          to_amount: parseFloat(toAmount),
          price
        }]);

      if (tradeError) throw tradeError;

      setFromAmount('');
      setToAmount('');
      setSwapTx('');
      setImportedTx('');
      
      await Promise.all([fetchOrders(), fetchTrades()]);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-center mb-8">
        <OrderBookLogo />
        <TestLogo className="ml-4" size="medium" />
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create Swap Order</h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleRefresh}
                className="text-yellow-600 hover:text-yellow-500 p-1"
                title="Reload"
              >
                <RotateCw size={16} />
              </button>
              <button
                type="button"
                onClick={handleSwitch}
                className="flex items-center gap-2 text-yellow-600 hover:text-yellow-500 p-2"
              >
                <ArrowLeftRight size={20} />
                Switch Pair
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">From Token</label>
              <TokenSelect
                tokens={[TOKENS.find(t => t.symbol === "RXD")!, TOKENS.find(t => t.symbol === "DOGE")!]}
                selectedToken={fromToken}
                onChange={setFromToken}
              />
            </div>
            <div>
              <label className="block text-yellow-600 mb-2">Amount</label>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">To Token</label>
              <TokenSelect
                tokens={[TOKENS.find(t => t.symbol === "RXD")!, TOKENS.find(t => t.symbol === "DOGE")!]}
                selectedToken={toToken}
                onChange={setToToken}
              />
            </div>
            <div>
              <label className="block text-yellow-600 mb-2">You Will Receive</label>
              <input
                type="number"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter amount"
                required
              />
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
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 mb-2"
              placeholder="Enter your swap transaction"
              required
            />
            <div>
              <label className="block text-yellow-600 mb-2">
                Import Transaction Text:
              </label>
              <textarea
                value={importedTx}
                onChange={(e) => {
                  setImportedTx(e.target.value);
                  parseImportedTx(e.target.value);
                }}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Paste transaction text here"
                rows={3}
              />
              <p className="text-xs text-yellow-600/50 mt-1 italic">
                Example: 🔁 Swap: 1000 RXD ➔ 1000 DOGE 📋01000000015c🟦
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
          >
            Create Swap Order
          </button>
        </div>
      </form>

      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
            Order Book for DOGE
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{order.from_amount} {order.from_token}</span>
                    <span className="text-yellow-600">→</span>
                    <span className="text-lg">{order.to_amount} {order.to_token}</span>
                  </div>
                  <span className="text-yellow-600">
                    Price: {order.price.toFixed(6)}
                  </span>
                </div>
                <div className="text-sm text-yellow-600/80">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
              Floor Price Chart
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeframe('1d')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeframe === '1d' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                1D
              </button>
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeframe === '7d' 
                    ? 'bg-yellow-600 text-white' 
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                7D
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm h-64">
            {/* Chart will be implemented later */}
            <div className="flex items-center justify-center h-full text-yellow-600">
              Price chart coming soon
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
            Transaction History
          </h2>
          <div className="space-y-4">
            {trades.map(trade => (
              <div key={trade.id} className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{trade.from_amount} {trade.from_token}</span>
                    <span className="text-yellow-600">→</span>
                    <span>{trade.to_amount} {trade.to_token}</span>
                  </div>
                  <div className="text-yellow-600">
                    Price: {trade.price.toFixed(6)}
                  </div>
                </div>
                <div className="text-sm text-yellow-600/80 mt-2">
                  {new Date(trade.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};