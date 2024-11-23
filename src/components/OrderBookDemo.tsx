import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowLeftRight } from 'lucide-react';
import QRCode from 'react-qr-code';
import { OrderBookLogo } from './OrderBookLogo';
import { TestLogo } from './TestLogo';
import { TOKENS } from '../data/tokens';
import { supabase } from '../lib/supabase';
import { TokenSelect } from './TokenSelect';

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
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');

  useEffect(() => {
    fetchOrders();
    fetchTrades();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orderbook')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const fetchTrades = async () => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
    } else {
      setTrades(data || []);
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

      setFromAmount('');
      setToAmount('');
      setSwapTx('');
      setImportedTx('');
      fetchOrders();
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
              <label className="block text-yellow-600 mb-2">From</label>
              <div className="flex gap-4">
                <TokenSelect
                  tokens={[TOKENS.find(t => t.symbol === "RXD")!, TOKENS.find(t => t.symbol === "DOGE")!]}
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
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">To</label>
              <div className="flex gap-4">
                <TokenSelect
                  tokens={[TOKENS.find(t => t.symbol === "RXD")!, TOKENS.find(t => t.symbol === "DOGE")!]}
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
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-yellow-600 mb-2">Transaction ID</label>
            <input
              type="text"
              value={swapTx}
              onChange={(e) => setSwapTx(e.target.value)}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 mb-2"
              placeholder="Enter your transaction ID"
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
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all mt-6"
          >
            Create Order
          </button>
        </div>
      </form>

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Order Book for DOGE</h2>
          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
                  <div>
                    <p className="text-white">
                      {order.from_amount} {order.from_token} ➔ {order.to_amount} {order.to_token}
                    </p>
                    <p className="text-sm text-yellow-600">
                      Price: {order.price.toFixed(8)} {order.to_token}/{order.from_token}
                    </p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-yellow-600">No active orders</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Floor Price Chart</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeframe('1d')}
                className={`px-3 py-1 rounded-lg ${
                  timeframe === '1d'
                    ? 'bg-yellow-600 text-white'
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                1D
              </button>
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-3 py-1 rounded-lg ${
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
            <div className="text-center text-yellow-600">
              Chart implementation coming soon...
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="space-y-4">
              {trades.map(trade => (
                <div key={trade.id} className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
                  <div>
                    <p className="text-white">
                      {trade.from_amount} {trade.from_token} ➔ {trade.to_amount} {trade.to_token}
                    </p>
                    <p className="text-sm text-yellow-600">
                      Price: {trade.price.toFixed(8)} {trade.to_token}/{trade.from_token}
                    </p>
                  </div>
                  <div className="text-sm text-yellow-600/80">
                    {new Date(trade.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {trades.length === 0 && (
                <p className="text-center text-yellow-600">No transaction history</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};