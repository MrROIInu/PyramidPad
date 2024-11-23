import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '../lib/supabase';
import { OrderBookLogo } from './OrderBookLogo';
import { PriceChart } from './PriceChart';
import { TOKENS } from '../data/tokens';

const SWAP_WALLET = '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N';
const RXD_TOKEN = TOKENS.find(t => t.symbol === 'RXD')!;
const DOGE_TOKEN = TOKENS.find(t => t.symbol === 'DOGE')!;

interface Order {
  id: number;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  price: number;
  status: string;
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

export const OrderBookDemo: React.FC = () => {
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');

  useEffect(() => {
    fetchTrades();
    fetchOrders();
  }, []);

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

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orderbook')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const handleRefresh = () => {
    fetchTrades();
    fetchOrders();
  };

  const calculateTradeRatio = (fromAmt: number, toAmt: number) => {
    const ratio = (fromAmt / fromToken.totalSupply) / (toAmt / toToken.totalSupply);
    return ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;
  };

  const getRatioColor = (ratio: string) => {
    const numericRatio = parseFloat(ratio.split(':')[0]);
    if (numericRatio >= 0.1 && numericRatio <= 5) return 'text-green-500';
    if (numericRatio > 5 && numericRatio <= 9) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SWAP_WALLET);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
  };

  const handleSwitch = () => {
    setIsRxdToDoge(!isRxdToDoge);
    setFromAmount('');
    setToAmount('');
    setTradeRatio('');
  };

  const parseImportedTx = (text: string) => {
    const match = text.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([\w\d]+)/);
    if (match) {
      const [, amount, fromSymbol, toAmt, toSymbol, tx] = match;
      
      // Check if the pair matches RXD/DOGE in either direction
      if ((fromSymbol === 'RXD' && toSymbol === 'DOGE') || (fromSymbol === 'DOGE' && toSymbol === 'RXD')) {
        const shouldSwitchDirection = fromSymbol === 'DOGE';
        if (shouldSwitchDirection !== !isRxdToDoge) {
          setIsRxdToDoge(!shouldSwitchDirection);
        }
        
        setFromAmount(amount);
        setToAmount(toAmt);
        setTransactionId(tx);
        setTradeRatio(calculateTradeRatio(parseFloat(amount), parseFloat(toAmt)));
      }
    } else {
      // Try to extract just the TX
      const txMatch = text.match(/📋([\w\d]+)/);
      if (txMatch) {
        setTransactionId(txMatch[1]);
      }
    }
  };

  const handleCreateOrder = async () => {
    if (!fromAmount || !toAmount || !transactionId) return;

    try {
      const { error } = await supabase
        .from('orderbook')
        .insert([{
          from_token: isRxdToDoge ? 'RXD' : 'DOGE',
          to_token: isRxdToDoge ? 'DOGE' : 'RXD',
          from_amount: parseFloat(fromAmount),
          to_amount: parseFloat(toAmount),
          price: parseFloat(toAmount) / parseFloat(fromAmount),
          status: 'active'
        }]);

      if (error) throw error;

      // Add to trades history
      await supabase
        .from('trades')
        .insert([{
          from_token: isRxdToDoge ? 'RXD' : 'DOGE',
          to_token: isRxdToDoge ? 'DOGE' : 'RXD',
          from_amount: parseFloat(fromAmount),
          to_amount: parseFloat(toAmount),
          price: parseFloat(toAmount) / parseFloat(fromAmount)
        }]);

      setFromAmount('');
      setToAmount('');
      setTransactionId('');
      setImportedTx('');
      setTradeRatio('');
      fetchTrades();
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const fromToken = isRxdToDoge ? RXD_TOKEN : DOGE_TOKEN;
  const toToken = isRxdToDoge ? DOGE_TOKEN : RXD_TOKEN;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <OrderBookLogo />
      </div>

      <form className="max-w-md mx-auto">
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

          <div className="space-y-6">
            <div>
              <button
                type="button"
                onClick={handleSwitch}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 text-yellow-600 hover:bg-black/40 transition-colors mb-4"
              >
                <div className="flex items-center justify-center gap-2">
                  <img src={fromToken.imageUrl} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
                  <span>{fromToken.symbol}</span>
                  <span>→</span>
                  <img src={toToken.imageUrl} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
                  <span>{toToken.symbol}</span>
                  <span className="text-yellow-600/50 text-sm">(Click to switch)</span>
                </div>
              </button>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-yellow-600 mb-2">Amount</label>
                  <div className="relative">
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
                      placeholder={`Enter amount`}
                      min="0"
                      required
                    />
                    <img 
                      src={fromToken.imageUrl} 
                      alt={fromToken.symbol} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-yellow-600 mb-2">You will receive</label>
                  <div className="relative">
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
                      placeholder={`Enter amount`}
                      min="0"
                      required
                    />
                    <img 
                      src={toToken.imageUrl} 
                      alt={toToken.symbol} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
                    />
                  </div>
                </div>
              </div>
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
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Paste transaction text here"
                rows={3}
              />
              <p className="text-xs text-yellow-600/50 mt-1 italic">
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
              />
            </div>

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={!fromAmount || !toAmount || !transactionId}
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50"
            >
              Create Order
            </button>
          </div>
        </div>
      </form>

      <div className="mt-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-6">Order Book for DOGE</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <img 
                      src={TOKENS.find(t => t.symbol === order.from_token)?.imageUrl} 
                      alt={order.from_token} 
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{order.from_amount} {order.from_token}</span>
                    <span>→</span>
                    <img 
                      src={TOKENS.find(t => t.symbol === order.to_token)?.imageUrl} 
                      alt={order.to_token} 
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{order.to_amount} {order.to_token}</span>
                  </div>
                  <div className="text-sm text-yellow-600/80 mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <div className={getRatioColor(calculateTradeRatio(order.from_amount, order.to_amount))}>
                  {calculateTradeRatio(order.from_amount, order.to_amount)}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-yellow-600/80">No active orders</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-6">Floor Price Chart</h2>
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

      <div className="mt-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-6">Transaction History</h2>
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <img 
                      src={TOKENS.find(t => t.symbol === trade.from_token)?.imageUrl} 
                      alt={trade.from_token} 
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{trade.from_amount} {trade.from_token}</span>
                    <span>→</span>
                    <img 
                      src={TOKENS.find(t => t.symbol === trade.to_token)?.imageUrl} 
                      alt={trade.to_token} 
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{trade.to_amount} {trade.to_token}</span>
                  </div>
                  <div className="text-sm text-yellow-600/80 mt-1">
                    {new Date(trade.created_at).toLocaleString()}
                  </div>
                </div>
                <div className={getRatioColor(calculateTradeRatio(trade.from_amount, trade.to_amount))}>
                  {calculateTradeRatio(trade.from_amount, trade.to_amount)}
                </div>
              </div>
            ))}
            {trades.length === 0 && (
              <p className="text-center text-yellow-600/80">No transaction history</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};