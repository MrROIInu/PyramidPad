import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '../lib/supabase';
import { OrderBookLogo } from './OrderBookLogo';
import { PriceChart } from './PriceChart';

const SWAP_WALLET = '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N';

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
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');

  useEffect(() => {
    fetchTrades();
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

  const handleRefresh = () => {
    fetchTrades();
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
      if ((fromSymbol === 'RXD' && toSymbol === 'DOGE') || (fromSymbol === 'DOGE' && toSymbol === 'RXD')) {
        setFromAmount(amount);
        setToAmount(toAmt);
        setTransactionId(tx);
        setTradeRatio(calculateTradeRatio(parseFloat(amount), parseFloat(toAmt)));
        setIsRxdToDoge(fromSymbol === 'RXD');
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
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

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
                {isRxdToDoge ? 'RXD → DOGE' : 'DOGE → RXD'} (Click to switch)
              </button>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-yellow-600 mb-2">Amount</label>
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => {
                      setFromAmount(e.target.value);
                      if (e.target.value) {
                        const ratio = 1; // 1:1 trading
                        const calculated = parseFloat(e.target.value) * ratio;
                        setToAmount(calculated.toString());
                        setTradeRatio(calculateTradeRatio(parseFloat(e.target.value), calculated));
                      } else {
                        setToAmount('');
                        setTradeRatio('');
                      }
                    }}
                    className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                    placeholder={`Enter ${isRxdToDoge ? 'RXD' : 'DOGE'} amount`}
                    min="0"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-yellow-600 mb-2">You will receive</label>
                  <input
                    type="number"
                    value={toAmount}
                    onChange={(e) => {
                      setToAmount(e.target.value);
                      if (e.target.value) {
                        setTradeRatio(calculateTradeRatio(parseFloat(fromAmount), parseFloat(e.target.value)));
                      } else {
                        setTradeRatio('');
                      }
                    }}
                    className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                    placeholder={`Enter ${isRxdToDoge ? 'DOGE' : 'RXD'} amount`}
                    min="0"
                    required
                  />
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
          
          <div className="mb-4">
            <div className="flex gap-4 mb-4">
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

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-yellow-600 mb-4">Transaction History</h3>
            <div className="space-y-4">
              {trades.map((trade) => (
                <div key={trade.id} className="bg-black/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-yellow-600">{trade.from_amount} {trade.from_token}</span>
                      <span className="text-yellow-600/50 mx-2">→</span>
                      <span className="text-yellow-600">{trade.to_amount} {trade.to_token}</span>
                    </div>
                    <div className="text-yellow-600/50 text-sm">
                      {new Date(trade.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};