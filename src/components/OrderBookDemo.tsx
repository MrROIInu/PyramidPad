import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowLeftRight } from 'lucide-react';
import { OrderBookLogo } from './OrderBookLogo';
import { TOKENS } from '../data/tokens';
import { PriceChart } from './PriceChart';
import { supabase } from '../lib/supabase';

interface Trade {
  id: number;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  price: number;
  transaction_id: string;
  created_at: string;
}

export const OrderBookDemo: React.FC = () => {
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');

  const rxd = TOKENS.find(t => t.symbol === 'RXD')!;
  const doge = TOKENS.find(t => t.symbol === 'DOGE')!;

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

  const handleSwitch = () => {
    setIsRxdToDoge(!isRxdToDoge);
    // Swap amounts if they exist
    if (fromAmount && toAmount) {
      setFromAmount(toAmount);
      setToAmount(fromAmount);
      if (tradeRatio) {
        const [num, denom] = tradeRatio.split(':');
        setTradeRatio(`${denom}:${num}`);
      }
    }
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
      const [, amount1, token1, amount2, token2, tx] = match;
      
      // Only process if it's RXD/DOGE pair
      if ((token1 === 'RXD' && token2 === 'DOGE') || (token1 === 'DOGE' && token2 === 'RXD')) {
        const isRxdFirst = token1 === 'RXD';
        setIsRxdToDoge(isRxdFirst);
        setFromAmount(isRxdFirst ? amount1 : amount2);
        setToAmount(isRxdFirst ? amount2 : amount1);
        setTransactionId(tx);
        setTradeRatio(calculateTradeRatio(
          parseFloat(isRxdFirst ? amount1 : amount2),
          parseFloat(isRxdFirst ? amount2 : amount1)
        ));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAmount || !toAmount || !transactionId) return;

    try {
      const { error } = await supabase
        .from('trades')
        .insert([{
          from_token: isRxdToDoge ? 'RXD' : 'DOGE',
          to_token: isRxdToDoge ? 'DOGE' : 'RXD',
          from_amount: parseFloat(fromAmount),
          to_amount: parseFloat(toAmount),
          price: isRxdToDoge ? parseFloat(toAmount) / parseFloat(fromAmount) : parseFloat(fromAmount) / parseFloat(toAmount),
          transaction_id: transactionId
        }]);

      if (error) throw error;

      // Reset form and refresh trades
      setFromAmount('');
      setToAmount('');
      setTransactionId('');
      setImportedTx('');
      setTradeRatio('');
      fetchTrades();
    } catch (error) {
      console.error('Error saving trade:', error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center mb-8">
        <OrderBookLogo />
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
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

          <button
            type="button"
            onClick={handleSwitch}
            className="w-full flex items-center justify-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 mb-6 text-yellow-600 hover:bg-black/40 transition-colors"
          >
            <img 
              src={isRxdToDoge ? rxd.imageUrl : doge.imageUrl}
              alt={isRxdToDoge ? "RXD" : "DOGE"}
              className="w-6 h-6 rounded-full"
            />
            <span>{isRxdToDoge ? 'RXD' : 'DOGE'}</span>
            <ArrowLeftRight size={16} className="mx-2" />
            <img 
              src={isRxdToDoge ? doge.imageUrl : rxd.imageUrl}
              alt={isRxdToDoge ? "DOGE" : "RXD"}
              className="w-6 h-6 rounded-full"
            />
            <span>{isRxdToDoge ? 'DOGE' : 'RXD'}</span>
            <span className="text-yellow-600/50 ml-2">(Click to switch)</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">From</label>
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <img 
                  src={isRxdToDoge ? rxd.imageUrl : doge.imageUrl}
                  alt={isRxdToDoge ? "RXD" : "DOGE"}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white">{isRxdToDoge ? 'RXD' : 'DOGE'}</span>
              </div>
            </div>
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
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">To</label>
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <img 
                  src={isRxdToDoge ? doge.imageUrl : rxd.imageUrl}
                  alt={isRxdToDoge ? "DOGE" : "RXD"}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white">{isRxdToDoge ? 'DOGE' : 'RXD'}</span>
              </div>
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
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>
          </div>

          {tradeRatio && (
            <div className={`text-center mb-6 ${getRatioColor(tradeRatio)}`}>
              Trade Ratio: {tradeRatio}
            </div>
          )}

          <div className="mb-6">
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

          <div className="mb-6">
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
      </form>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-6">Order Book for DOGE</h2>
          <div className="mb-4 flex justify-end gap-2">
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
          <PriceChart trades={trades} timeframe={timeframe} />
        </div>

        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-6">Transaction History</h2>
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={trade.from_token === 'RXD' ? rxd.imageUrl : doge.imageUrl}
                      alt={trade.from_token}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white">{trade.from_amount} {trade.from_token}</span>
                  </div>
                  <span className="text-yellow-600">→</span>
                  <div className="flex items-center gap-2">
                    <img 
                      src={trade.to_token === 'RXD' ? rxd.imageUrl : doge.imageUrl}
                      alt={trade.to_token}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white">{trade.to_amount} {trade.to_token}</span>
                  </div>
                </div>
                <div>
                  <div className={getRatioColor(calculateTradeRatio(trade.from_amount, trade.to_amount))}>
                    {calculateTradeRatio(trade.from_amount, trade.to_amount)}
                  </div>
                  <p className="text-sm text-yellow-600 text-right">
                    {new Date(trade.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};