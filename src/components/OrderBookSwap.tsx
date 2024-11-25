import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OrderBookLogo } from './OrderBookLogo';
import { PriceChart } from './PriceChart';
import { useClipboard } from '../hooks/useClipboard';

const RXD_TOKEN = {
  symbol: 'RXD',
  name: 'Radiant',
  imageUrl: 'https://static.wixstatic.com/media/c0fd9f_33dd965b95d54dfe9af12ed99fe5c43a~mv2.png',
  totalSupply: 21000000000
};

const DOGE_TOKEN = {
  symbol: 'DOGE',
  name: 'Doge',
  imageUrl: 'https://static.wixstatic.com/media/c0fd9f_b30b39721c80429ebba9a87f706cf9a7~mv2.webp',
  totalSupply: 90000000000
};

export const OrderBookSwap: React.FC = () => {
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);
  const [rxdAmount, setRxdAmount] = useState('');
  const [dogeAmount, setDogeAmount] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [trades, setTrades] = useState([]);
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

  const handleSwitch = () => {
    setIsRxdToDoge(!isRxdToDoge);
    setRxdAmount('');
    setDogeAmount('');
    setTradeRatio('');
  };

  const calculateTradeRatio = (fromAmount: number, toAmount: number) => {
    const ratio = fromAmount / toAmount;
    return ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;
  };

  const getRatioColor = (ratio: string) => {
    const numericRatio = parseFloat(ratio.split(':')[0]);
    if (numericRatio >= 0.1 && numericRatio <= 5) return 'text-green-500';
    if (numericRatio > 5 && numericRatio <= 9) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleImportedTxChange = (text: string) => {
    setImportedTx(text);
    const match = text.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([\w\d]+)/);
    if (match) {
      const [, amount1, token1, amount2, token2, tx] = match;
      if ((token1 === 'RXD' && token2 === 'DOGE') || (token1 === 'DOGE' && token2 === 'RXD')) {
        const isRxdFirst = token1 === 'RXD';
        setIsRxdToDoge(isRxdFirst);
        if (isRxdFirst) {
          setRxdAmount(amount1);
          setDogeAmount(amount2);
        } else {
          setRxdAmount(amount2);
          setDogeAmount(amount1);
        }
        setTransactionId(tx);
        setTradeRatio(calculateTradeRatio(
          parseFloat(isRxdFirst ? amount1 : amount2),
          parseFloat(isRxdFirst ? amount2 : amount1)
        ));
      }
    }
  };

  useClipboard((text: string) => {
    handleImportedTxChange(text);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxdAmount || !dogeAmount || !transactionId) return;

    try {
      const { error } = await supabase
        .from('trades')
        .insert([{
          from_token: isRxdToDoge ? 'RXD' : 'DOGE',
          to_token: isRxdToDoge ? 'DOGE' : 'RXD',
          from_amount: parseFloat(isRxdToDoge ? rxdAmount : dogeAmount),
          to_amount: parseFloat(isRxdToDoge ? dogeAmount : rxdAmount),
          price: parseFloat(dogeAmount) / parseFloat(rxdAmount)
        }]);

      if (error) throw error;

      setRxdAmount('');
      setDogeAmount('');
      setTransactionId('');
      setImportedTx('');
      setTradeRatio('');
      fetchTrades();
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Failed to save trade. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderBookLogo className="mb-8" />

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm mb-8">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <button
              type="button"
              onClick={handleSwitch}
              className="w-full flex items-center justify-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-3 text-yellow-600 hover:bg-black/40 transition-colors"
            >
              <img src={isRxdToDoge ? RXD_TOKEN.imageUrl : DOGE_TOKEN.imageUrl} alt="" className="w-6 h-6" />
              <span>{isRxdToDoge ? 'RXD' : 'DOGE'}</span>
              <span className="mx-2">→</span>
              <img src={isRxdToDoge ? DOGE_TOKEN.imageUrl : RXD_TOKEN.imageUrl} alt="" className="w-6 h-6" />
              <span>{isRxdToDoge ? 'DOGE' : 'RXD'}</span>
              <span className="ml-2">(Click to switch)</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-yellow-600 mb-2">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={isRxdToDoge ? rxdAmount : dogeAmount}
                    onChange={(e) => {
                      if (isRxdToDoge) {
                        setRxdAmount(e.target.value);
                      } else {
                        setDogeAmount(e.target.value);
                      }
                    }}
                    className="w-full bg-black/30 border border-yellow-600/30 rounded-lg pl-4 pr-16 py-2 focus:outline-none focus:border-yellow-600"
                    placeholder="Enter amount"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <img
                      src={isRxdToDoge ? RXD_TOKEN.imageUrl : DOGE_TOKEN.imageUrl}
                      alt=""
                      className="w-6 h-6 mr-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-yellow-600 mb-2">You will receive</label>
                <div className="relative">
                  <input
                    type="number"
                    value={isRxdToDoge ? dogeAmount : rxdAmount}
                    onChange={(e) => {
                      if (isRxdToDoge) {
                        setDogeAmount(e.target.value);
                      } else {
                        setRxdAmount(e.target.value);
                      }
                    }}
                    className="w-full bg-black/30 border border-yellow-600/30 rounded-lg pl-4 pr-16 py-2 focus:outline-none focus:border-yellow-600"
                    placeholder="Enter amount"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <img
                      src={isRxdToDoge ? DOGE_TOKEN.imageUrl : RXD_TOKEN.imageUrl}
                      alt=""
                      className="w-6 h-6 mr-1"
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
              <label className="block text-yellow-600 mb-2">
                Import Transaction text from Photonic Wallet P2PSwap:
              </label>
              <textarea
                value={importedTx}
                onChange={(e) => handleImportedTxChange(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 mb-2"
                placeholder="Paste transaction text here"
                rows={3}
              />
              <div className="text-yellow-600/50 text-sm italic">
                Example: 🔁 Swap: 1000 RXD ➔ 1000 DOGE 📋01000000015c🟦
              </div>
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
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
            >
              Create Order
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Floor Price Chart</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setTimeframe('1d')}
              className={`px-4 py-2 rounded-lg ${
                timeframe === '1d'
                  ? 'bg-yellow-600 text-white'
                  : 'text-yellow-600 hover:bg-yellow-600/10'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-4 py-2 rounded-lg ${
                timeframe === '7d'
                  ? 'bg-yellow-600 text-white'
                  : 'text-yellow-600 hover:bg-yellow-600/10'
              }`}
            >
              7d
            </button>
          </div>
          <PriceChart trades={trades} timeframe={timeframe} />
        </div>

        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-6">Order Book for DOGE</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-yellow-600 border-b border-yellow-600/30">
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade: any) => (
                  <tr key={trade.id} className="border-b border-yellow-600/10">
                    <td className="px-4 py-2 text-left">
                      {new Date(trade.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">{trade.from_amount}</td>
                    <td className="px-4 py-2 text-right">{trade.price.toFixed(6)}</td>
                    <td className="px-4 py-2 text-right">{trade.to_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};