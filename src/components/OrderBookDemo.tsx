import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { OrderBookLogo } from './OrderBookLogo';
import { PriceChart } from './PriceChart';

const RXD = TOKENS.find(t => t.symbol === 'RXD')!;
const DOGE = TOKENS.find(t => t.symbol === 'DOGE')!;

export const OrderBookDemo: React.FC = () => {
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
    fetchTrades();
    fetchTransactionHistory();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orderbook')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const fetchTrades = async () => {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: true });
    setTrades(data || []);
  };

  const fetchTransactionHistory = async () => {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setTransactionHistory(data || []);
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchTrades();
    fetchTransactionHistory();
  };

  const calculateTradeRatio = (fromAmt: number, toAmt: number) => {
    const ratio = fromAmt / toAmt;
    return ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;
  };

  const getRatioColor = (ratio: string) => {
    const numericRatio = parseFloat(ratio.split(':')[0]);
    if (numericRatio >= 0.1 && numericRatio <= 5) return 'text-green-500';
    if (numericRatio > 5 && numericRatio <= 9) return 'text-yellow-500';
    return 'text-red-500';
  };

  const parseImportedTx = (text: string) => {
    const match = text.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([\w\d]+)/);
    if (match) {
      const [, amount, fromSymbol, toAmt, toSymbol, tx] = match;
      
      if ((fromSymbol === 'RXD' && toSymbol === 'DOGE') || (fromSymbol === 'DOGE' && toSymbol === 'RXD')) {
        const shouldSwitchDirection = fromSymbol === 'DOGE';
        setIsRxdToDoge(!shouldSwitchDirection);
        
        if (shouldSwitchDirection) {
          setFromAmount(toAmt);
          setToAmount(amount);
        } else {
          setFromAmount(amount);
          setToAmount(toAmt);
        }
        
        setTransactionId(tx);
        setTradeRatio(calculateTradeRatio(
          parseFloat(shouldSwitchDirection ? toAmt : amount),
          parseFloat(shouldSwitchDirection ? amount : toAmt)
        ));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAmount || !toAmount || !transactionId) return;

    try {
      const order = {
        from_token: isRxdToDoge ? 'RXD' : 'DOGE',
        to_token: isRxdToDoge ? 'DOGE' : 'RXD',
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        price: parseFloat(toAmount) / parseFloat(fromAmount),
        status: 'active'
      };

      const { error } = await supabase.from('orderbook').insert([order]);
      if (error) throw error;

      // Record the trade
      await supabase.from('trades').insert([{
        from_token: order.from_token,
        to_token: order.to_token,
        from_amount: order.from_amount,
        to_amount: order.to_amount,
        price: order.price
      }]);

      setFromAmount('');
      setToAmount('');
      setTransactionId('');
      setImportedTx('');
      setTradeRatio('');
      
      handleRefresh();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <OrderBookLogo />
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Create Swap Order</h2>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-yellow-600 hover:text-yellow-500 p-2"
              title="Refresh"
            >
              <RotateCw size={20} />
            </button>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRxdToDoge(!isRxdToDoge);
                setFromAmount('');
                setToAmount('');
                setTradeRatio('');
              }}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-3 text-yellow-600 hover:bg-black/40 transition-colors flex items-center justify-center gap-2"
            >
              <img src={isRxdToDoge ? RXD.imageUrl : DOGE.imageUrl} alt={isRxdToDoge ? 'RXD' : 'DOGE'} className="w-6 h-6 rounded-full" />
              {isRxdToDoge ? 'RXD' : 'DOGE'}
              <span className="mx-2">→</span>
              <img src={isRxdToDoge ? DOGE.imageUrl : RXD.imageUrl} alt={isRxdToDoge ? 'DOGE' : 'RXD'} className="w-6 h-6 rounded-full" />
              {isRxdToDoge ? 'DOGE' : 'RXD'}
              <span className="ml-2">(Click to switch)</span>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-yellow-600 mb-2">Amount</label>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.target.value);
                  if (e.target.value && toAmount) {
                    setTradeRatio(calculateTradeRatio(parseFloat(e.target.value), parseFloat(toAmount)));
                  }
                }}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder={`Enter ${isRxdToDoge ? 'RXD' : 'DOGE'} amount`}
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">You Will Receive</label>
              <input
                type="number"
                value={toAmount}
                onChange={(e) => {
                  setToAmount(e.target.value);
                  if (fromAmount && e.target.value) {
                    setTradeRatio(calculateTradeRatio(parseFloat(fromAmount), parseFloat(e.target.value)));
                  }
                }}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder={`Enter ${isRxdToDoge ? 'DOGE' : 'RXD'} amount`}
                min="1"
                required
              />
            </div>

            {tradeRatio && (
              <div className={`text-center ${getRatioColor(tradeRatio)}`}>
                Trade Ratio: {tradeRatio}
              </div>
            )}

            <div>
              <label className="block text-yellow-600 mb-2">Import Transaction text from Photonic Wallet:</label>
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

            <div>
              <label className="block text-yellow-600 mb-2">TX for Photonic Wallet:</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="If using only TX put it here"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
            >
              Create Order
            </button>
          </div>
        </div>
      </form>

      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6">Floor Price Chart</h2>
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setTimeframe('1d')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeframe === '1d'
                  ? 'bg-yellow-600 text-white'
                  : 'text-yellow-600 hover:bg-yellow-600/10'
              }`}
            >
              1 Day
            </button>
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeframe === '7d'
                  ? 'bg-yellow-600 text-white'
                  : 'text-yellow-600 hover:bg-yellow-600/10'
              }`}
            >
              7 Days
            </button>
          </div>
          <PriceChart trades={trades} timeframe={timeframe} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6">Order Book for DOGE</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-black/30 rounded-lg p-4 border border-yellow-600/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={order.from_token === 'RXD' ? RXD.imageUrl : DOGE.imageUrl}
                      alt={order.from_token}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{order.from_amount} {order.from_token}</span>
                    <span className="text-yellow-600">→</span>
                    <img
                      src={order.to_token === 'RXD' ? RXD.imageUrl : DOGE.imageUrl}
                      alt={order.to_token}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{order.to_amount} {order.to_token}</span>
                  </div>
                  <span className="text-yellow-600">
                    Price: {order.price.toFixed(6)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
          <div className="space-y-4">
            {transactionHistory.map((trade) => (
              <div
                key={trade.id}
                className="bg-black/30 rounded-lg p-4 border border-yellow-600/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={trade.from_token === 'RXD' ? RXD.imageUrl : DOGE.imageUrl}
                      alt={trade.from_token}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{trade.from_amount} {trade.from_token}</span>
                    <span className="text-yellow-600">→</span>
                    <img
                      src={trade.to_token === 'RXD' ? RXD.imageUrl : DOGE.imageUrl}
                      alt={trade.to_token}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{trade.to_amount} {trade.to_token}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-yellow-600">
                      Price: {trade.price.toFixed(6)}
                    </span>
                    <div className="text-sm text-yellow-600/60">
                      {new Date(trade.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};