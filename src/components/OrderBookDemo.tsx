import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { TokenSelect } from './TokenSelect';
import { OrderBookLogo } from './OrderBookLogo';
import { PriceChart } from './PriceChart';

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

export const OrderBookDemo: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [fromToken, setFromToken] = useState(TOKENS.find(t => t.symbol === 'RXD'));
  const [toToken, setToToken] = useState(TOKENS.find(t => t.symbol === 'DOGE'));
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);

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
    setFromToken(isRxdToDoge ? TOKENS.find(t => t.symbol === 'DOGE') : TOKENS.find(t => t.symbol === 'RXD'));
    setToToken(isRxdToDoge ? TOKENS.find(t => t.symbol === 'RXD') : TOKENS.find(t => t.symbol === 'DOGE'));
    setFromAmount('');
    setToAmount('');
    setTradeRatio('');
  };

  const calculateTradeRatio = (fromAmount: number, toAmount: number) => {
    const ratio = fromAmount / toAmount;
    return ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;
  };

  const parseImportedTx = (text: string) => {
    const match = text.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([\w\d]+)/);
    if (match) {
      const [, amount, fromSymbol, toAmt, toSymbol] = match;
      if ((fromSymbol === 'RXD' && toSymbol === 'DOGE') || (fromSymbol === 'DOGE' && toSymbol === 'RXD')) {
        setFromAmount(amount);
        setToAmount(toAmt);
        setTradeRatio(calculateTradeRatio(parseFloat(amount), parseFloat(toAmt)));
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <OrderBookLogo />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
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
            <div className="flex justify-center mb-4">
              <button
                onClick={handleSwitch}
                className="bg-yellow-600/20 text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-600/30 transition-colors"
              >
                Switch to {isRxdToDoge ? 'DOGE → RXD' : 'RXD → DOGE'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-yellow-600 mb-2">From</label>
                <div className="flex gap-4">
                  <TokenSelect
                    tokens={[fromToken!]}
                    selectedToken={fromToken}
                    onChange={() => {}}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => {
                      setFromAmount(e.target.value);
                      if (e.target.value && toAmount) {
                        setTradeRatio(calculateTradeRatio(parseFloat(e.target.value), parseFloat(toAmount)));
                      }
                    }}
                    className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
                    placeholder="Amount"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-yellow-600 mb-2">To</label>
                <div className="flex gap-4">
                  <TokenSelect
                    tokens={[toToken!]}
                    selectedToken={toToken}
                    onChange={() => {}}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={toAmount}
                    onChange={(e) => {
                      setToAmount(e.target.value);
                      if (fromAmount && e.target.value) {
                        setTradeRatio(calculateTradeRatio(parseFloat(fromAmount), parseFloat(e.target.value)));
                      }
                    }}
                    className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
                    placeholder="Amount"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {tradeRatio && (
              <div className={`text-center ${
                parseFloat(tradeRatio.split(':')[0]) <= 5 ? 'text-green-500' :
                parseFloat(tradeRatio.split(':')[0]) <= 9 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
            >
              Create Order
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
              Floor Price Chart
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeframe('1d')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeframe === '1d'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30'
                }`}
              >
                1D
              </button>
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeframe === '7d'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30'
                }`}
              >
                7D
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
            <PriceChart trades={trades} timeframe={timeframe} />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-4">
            Order Book for DOGE
          </h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg">
                      {order.from_amount} {order.from_token} ➔ {order.to_amount} {order.to_token}
                    </p>
                    <p className="text-yellow-600">
                      Price: {order.price.toFixed(8)} {order.to_token}/{order.from_token}
                    </p>
                  </div>
                  <span className="text-yellow-600/80 text-sm">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-4">
            Transaction History
          </h2>
          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-yellow-600 border-b border-yellow-600/20">
                    <th className="text-left py-2 px-4">Time</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-right py-2 px-4">Amount</th>
                    <th className="text-right py-2 px-4">Price</th>
                    <th className="text-right py-2 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => {
                    const isBuy = trade.to_token === 'DOGE';
                    return (
                      <tr key={trade.id} className="border-b border-yellow-600/10">
                        <td className="py-2 px-4 text-yellow-600/80">
                          {new Date(trade.created_at).toLocaleString()}
                        </td>
                        <td className={`py-2 px-4 ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                          {isBuy ? 'BUY' : 'SELL'}
                        </td>
                        <td className="py-2 px-4 text-right">
                          {trade.to_amount.toFixed(8)} {trade.to_token}
                        </td>
                        <td className="py-2 px-4 text-right">
                          {trade.price.toFixed(8)} {trade.from_token}
                        </td>
                        <td className="py-2 px-4 text-right">
                          {trade.from_amount.toFixed(8)} {trade.from_token}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};