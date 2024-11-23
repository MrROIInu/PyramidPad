import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowLeftRight } from 'lucide-react';
import QRCode from 'react-qr-code';
import { OrderBookLogo } from './OrderBookLogo';
import { TOKENS } from '../data/tokens';
import { supabase } from '../lib/supabase';

const RXD = TOKENS.find(t => t.symbol === 'RXD')!;
const DOGE = TOKENS.find(t => t.symbol === 'DOGE')!;

interface Trade {
  id: number;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  price: number;
  created_at: string;
}

interface Order {
  id: number;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  price: number;
  status: 'active' | 'filled' | 'cancelled';
  created_at: string;
}

export const OrderBookDemo: React.FC = () => {
  const [fromToken, setFromToken] = useState(RXD);
  const [toToken, setToToken] = useState(DOGE);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');
  const [currentPrice, setCurrentPrice] = useState(1);

  useEffect(() => {
    fetchOrders();
    fetchTrades();
    const subscription = supabase
      .channel('orderbook_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orderbook' }, () => {
        fetchOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {
        fetchTrades();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const amount = parseFloat(fromAmount);
      if (!isNaN(amount)) {
        setToAmount((amount * currentPrice).toFixed(6));
      }
    } else {
      setToAmount('');
    }
  }, [fromAmount, currentPrice]);

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
      if (data && data.length > 0) {
        setCurrentPrice(data[0].price);
      }
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAmount || !toAmount) return;

    const { error } = await supabase
      .from('orderbook')
      .insert([{
        from_token: fromToken.symbol,
        to_token: toToken.symbol,
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        price: parseFloat(toAmount) / parseFloat(fromAmount),
        status: 'active'
      }]);

    if (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } else {
      setFromAmount('');
      setToAmount('');
      setImportedTx('');
      fetchOrders();
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchTrades();
  };

  const handleSwapPair = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
    setImportedTx('');
  };

  const parseImportedTx = (text: string) => {
    // Match pattern: 🔁 Swap: 1000 RXD ➔ 1000 DOGE 📋<tx_hash>
    const match = text.match(/🔁 Swap: (\d+(?:\.\d+)?) ([A-Za-z0-9]+) ➔ (\d+(?:\.\d+)?) ([A-Za-z0-9]+) 📋([a-zA-Z0-9]+)/);
    
    if (match) {
      const [, fromAmt, fromSymbol, toAmt, toSymbol] = match;
      
      // Only allow RXD/DOGE pairs
      if ((fromSymbol === 'RXD' && toSymbol === 'DOGE') || 
          (fromSymbol === 'DOGE' && toSymbol === 'RXD')) {
        setFromToken(fromSymbol === 'RXD' ? RXD : DOGE);
        setToToken(toSymbol === 'DOGE' ? DOGE : RXD);
        setFromAmount(fromAmt);
        setToAmount(toAmt);
      }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <OrderBookLogo className="mb-8" />

      <form onSubmit={handleCreateOrder} className="mb-12">
        <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
              Create Swap Order
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwapPair}
                className="text-yellow-600 hover:text-yellow-500 p-1"
                title="Swap Pair"
              >
                <ArrowLeftRight size={16} />
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="text-yellow-600 hover:text-yellow-500 p-1"
                title="Reload"
              >
                <RotateCw size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">From</label>
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <img src={fromToken.imageUrl} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
                <span>{fromToken.symbol}</span>
              </div>
            </div>
            <div>
              <label className="block text-yellow-600 mb-2">Amount</label>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter amount"
                min="0.000001"
                step="0.000001"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">To</label>
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <img src={toToken.imageUrl} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
                <span>{toToken.symbol}</span>
              </div>
            </div>
            <div>
              <label className="block text-yellow-600 mb-2">Amount</label>
              <input
                type="number"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter amount"
                min="0.000001"
                step="0.000001"
                required
              />
              <p className="text-sm text-yellow-600 mt-1">
                Current price: 1 {fromToken.symbol} = {currentPrice} {toToken.symbol}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-yellow-600 mb-2">
              Import full Transaction text from Photonic Wallet to fill input form:
            </label>
            <textarea
              value={importedTx}
              onChange={(e) => {
                setImportedTx(e.target.value);
                parseImportedTx(e.target.value);
              }}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 mb-2"
              placeholder="Paste transaction text here"
              rows={3}
            />
            <p className="text-xs text-yellow-600/50 italic">
              Example: 🔁 Swap: 1000 RXD ➔ 1000 DOGE 📋01000000015c🟦
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all mt-6"
          >
            Create Order
          </button>
        </div>
      </form>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-4">
            Order Book for {toToken.symbol}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src={RXD.imageUrl} alt={order.from_token} className="w-6 h-6 rounded-full" />
                    <span>{order.from_amount} {order.from_token}</span>
                    <span className="text-yellow-600">→</span>
                    <img src={DOGE.imageUrl} alt={order.to_token} className="w-6 h-6 rounded-full" />
                    <span>{order.to_amount} {order.to_token}</span>
                  </div>
                  <span className={order.status === 'active' ? 'text-green-500' : 'text-yellow-600'}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-yellow-600">
                  Price: 1 {order.from_token} = {order.price} {order.to_token}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
              Floor Price Chart
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeframe('1d')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeframe === '1d'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-black/30 text-yellow-600 hover:bg-black/40'
                }`}
              >
                1D
              </button>
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeframe === '7d'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-black/30 text-yellow-600 hover:bg-black/40'
                }`}
              >
                7D
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm h-64">
            {/* Chart will be implemented here */}
            <div className="flex items-center justify-center h-full text-yellow-600">
              Chart coming soon
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-4">
            Transaction History
          </h2>
          <div className="space-y-4">
            {trades.map(trade => (
              <div
                key={trade.id}
                className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <img src={RXD.imageUrl} alt={trade.from_token} className="w-6 h-6 rounded-full" />
                  <span>{trade.from_amount} {trade.from_token}</span>
                  <span className="text-yellow-600">→</span>
                  <img src={DOGE.imageUrl} alt={trade.to_token} className="w-6 h-6 rounded-full" />
                  <span>{trade.to_amount} {trade.to_token}</span>
                  <span className="text-yellow-600 ml-auto">
                    Price: {trade.price} {trade.to_token}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};