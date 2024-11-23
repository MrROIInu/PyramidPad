import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowLeftRight } from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { TokenSelect } from './TokenSelect';
import { OrderBookLogo } from './OrderBookLogo';
import { TestLogo } from './TestLogo';
import { PriceChart } from './PriceChart';

const SWAP_WALLET = '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N';
const RXD_TOKEN = TOKENS.find(t => t.symbol === "RXD")!;
const DOGE_TOKEN = TOKENS.find(t => t.symbol === "DOGE")!;

export const OrderBookDemo: React.FC = () => {
  const [fromToken, setFromToken] = useState(RXD_TOKEN);
  const [toToken, setToToken] = useState(DOGE_TOKEN);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');

  useEffect(() => {
    fetchOrders();
    fetchTrades();

    const subscription = supabase
      .channel('orderbook_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orderbook' }, 
        () => {
          fetchOrders();
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orderbook')
        .select('*')
        .eq('status', 'active')
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

  const calculateTradeRatio = (fromAmt: number, toAmt: number) => {
    const ratio = fromAmt / toAmt;
    return ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;
  };

  const handleAmountChange = (value: string, isFromAmount: boolean) => {
    if (isFromAmount) {
      setFromAmount(value);
      if (value && fromToken && toToken) {
        setTradeRatio(calculateTradeRatio(parseFloat(value), parseFloat(toAmount) || 0));
      }
    } else {
      setToAmount(value);
      if (value && fromToken && toToken) {
        setTradeRatio(calculateTradeRatio(parseFloat(fromAmount) || 0, parseFloat(value)));
      }
    }
  };

  const handleSwitchPair = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    if (fromAmount && toAmount) {
      setTradeRatio(calculateTradeRatio(parseFloat(toAmount), parseFloat(fromAmount)));
    }
  };

  const getRatioColor = (ratio: string) => {
    if (!ratio) return '';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAmount || !toAmount || !transactionId) return;

    try {
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

      if (error) throw error;

      setFromAmount('');
      setToAmount('');
      setTransactionId('');
      setWalletAddress('');
      setTradeRatio('');
      
      await fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const parseImportedTx = (text: string) => {
    const match = text.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([\w\d]+)/);
    if (match) {
      const [, amount, fromSymbol, toAmt, toSymbol, tx] = match;
      if ((fromSymbol === 'RXD' && toSymbol === 'DOGE') || 
          (fromSymbol === 'DOGE' && toSymbol === 'RXD')) {
        setFromToken(TOKENS.find(t => t.symbol === fromSymbol)!);
        setToToken(TOKENS.find(t => t.symbol === toSymbol)!);
        setFromAmount(amount);
        setToAmount(toAmt);
        setTransactionId(tx);
        setTradeRatio(calculateTradeRatio(parseFloat(amount), parseFloat(toAmt)));
      }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center items-center gap-2 mb-8">
        <OrderBookLogo />
        <TestLogo size="large" />
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
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

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">From Token</label>
              <TokenSelect
                tokens={[RXD_TOKEN, DOGE_TOKEN]}
                selectedToken={fromToken}
                onChange={setFromToken}
              />
            </div>
            <div>
              <label className="block text-yellow-600 mb-2">Amount</label>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => handleAmountChange(e.target.value, true)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleSwitchPair}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-600 p-2 rounded-full transition-colors"
            >
              <ArrowLeftRight size={20} />
            </button>
            <div>
              <label className="block text-yellow-600 mb-2">To Token</label>
              <TokenSelect
                tokens={[RXD_TOKEN, DOGE_TOKEN]}
                selectedToken={toToken}
                onChange={setToToken}
              />
            </div>
            <div>
              <label className="block text-yellow-600 mb-2">You Will Receive</label>
              <input
                type="number"
                value={toAmount}
                onChange={(e) => handleAmountChange(e.target.value, false)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {tradeRatio && (
            <div className={`text-center mb-6 ${getRatioColor(tradeRatio)}`}>
              Trade Ratio: {tradeRatio}
            </div>
          )}

          <div>
            <label className="block text-yellow-600 mb-2">Your Photonic Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
              placeholder="Enter your wallet address"
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-yellow-600 mb-2">Import Transaction Text:</label>
            <textarea
              value={transactionId}
              onChange={(e) => {
                setTransactionId(e.target.value);
                parseImportedTx(e.target.value);
              }}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 mb-1"
              placeholder="Paste transaction text here"
              rows={3}
            />
            <p className="text-xs text-yellow-600/50 italic">
              Example: 🔁 Swap: 1000 RXD ➔ 1000 DOGE 📋01000000015c🟦
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
          >
            Create Order
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
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

        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <PriceChart trades={trades} timeframe={timeframe} />
        </div>

        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
          Order Book for DOGE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{order.from_amount} {order.from_token}</span>
                  <span className="text-yellow-600">→</span>
                  <span className="text-lg">{order.to_amount} {order.to_token}</span>
                </div>
                <span className={getRatioColor(calculateTradeRatio(order.from_amount, order.to_amount))}>
                  {calculateTradeRatio(order.from_amount, order.to_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
          Transaction History
        </h2>
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between py-2 border-b border-yellow-600/20 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{trade.from_amount} {trade.from_token}</span>
                  <span className="text-yellow-600">→</span>
                  <span>{trade.to_amount} {trade.to_token}</span>
                </div>
                <span className="text-yellow-600/80">
                  {new Date(trade.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};