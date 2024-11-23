import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OrderBookLogo } from './OrderBookLogo';
import { PriceChart } from './PriceChart';
import { useClipboard } from '../hooks/useClipboard';

export const OrderBookDemo: React.FC = () => {
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);
  const [rxdAmount, setRxdAmount] = useState('');
  const [dogeAmount, setDogeAmount] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');

  useEffect(() => {
    fetchOrders();
    fetchTrades();
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

  const handleRefresh = () => {
    fetchOrders();
    fetchTrades();
  };

  const calculateTradeRatio = (rxd: number, doge: number) => {
    const ratio = rxd / doge;
    return ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;
  };

  const getRatioColor = (ratio: string) => {
    const numericRatio = parseFloat(ratio.split(':')[0]);
    if (numericRatio >= 0.1 && numericRatio <= 5) return 'text-green-500';
    if (numericRatio > 5 && numericRatio <= 9) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleSwitch = () => {
    setIsRxdToDoge(!isRxdToDoge);
    setRxdAmount('');
    setDogeAmount('');
    setTradeRatio('');
  };

  useClipboard((text: string) => {
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
        setImportedTx(text);
        
        const ratio = calculateTradeRatio(
          parseFloat(isRxdFirst ? amount1 : amount2),
          parseFloat(isRxdFirst ? amount2 : amount1)
        );
        setTradeRatio(ratio);
      }
    }
  });

  const handleCreateOrder = async () => {
    if (!rxdAmount || !dogeAmount || !transactionId) return;

    try {
      const { error } = await supabase
        .from('orderbook')
        .insert([{
          from_token: isRxdToDoge ? 'RXD' : 'DOGE',
          to_token: isRxdToDoge ? 'DOGE' : 'RXD',
          from_amount: isRxdToDoge ? rxdAmount : dogeAmount,
          to_amount: isRxdToDoge ? dogeAmount : rxdAmount,
          price: parseFloat(rxdAmount) / parseFloat(dogeAmount),
          status: 'active'
        }]);

      if (error) throw error;

      // Clear form
      setRxdAmount('');
      setDogeAmount('');
      setTransactionId('');
      setImportedTx('');
      setTradeRatio('');

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <OrderBookLogo />
      </div>

      <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Create Swap Order</h2>
          <button
            onClick={handleRefresh}
            className="text-yellow-600 hover:text-yellow-500 p-2"
            title="Refresh"
          >
            <RotateCw size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleSwitch}
            className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 text-yellow-600 hover:bg-black/40 transition-colors flex items-center justify-center gap-2"
          >
            <img src="https://static.wixstatic.com/media/c0fd9f_33dd965b95d54dfe9af12ed99fe5c43a~mv2.png" alt="RXD" className="w-6 h-6" />
            RXD → 
            <img src="https://static.wixstatic.com/media/c0fd9f_b30b39721c80429ebba9a87f706cf9a7~mv2.webp" alt="DOGE" className="w-6 h-6" />
            DOGE
            {!isRxdToDoge && ' (Click to switch)'}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-yellow-600 mb-2">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={rxdAmount}
                  onChange={(e) => {
                    setRxdAmount(e.target.value);
                    if (e.target.value) {
                      const ratio = calculateTradeRatio(parseFloat(e.target.value), parseFloat(dogeAmount));
                      setTradeRatio(ratio);
                    }
                  }}
                  className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                  placeholder="Enter amount"
                  min="1"
                />
                <span className="absolute right-3 top-2 text-yellow-600">RXD</span>
              </div>
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">You will receive</label>
              <div className="relative">
                <input
                  type="number"
                  value={dogeAmount}
                  onChange={(e) => {
                    setDogeAmount(e.target.value);
                    if (e.target.value) {
                      const ratio = calculateTradeRatio(parseFloat(rxdAmount), parseFloat(e.target.value));
                      setTradeRatio(ratio);
                    }
                  }}
                  className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                  placeholder="Enter amount"
                  min="1"
                />
                <span className="absolute right-3 top-2 text-yellow-600">DOGE</span>
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
              onChange={(e) => setImportedTx(e.target.value)}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 mb-2"
              placeholder="Example: 🔁 Swap: 1000 RXD ➔ 1000 DOGE 📋01000000015c🟦"
              rows={2}
              style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}
            />
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
            onClick={handleCreateOrder}
            disabled={!rxdAmount || !dogeAmount || !transactionId}
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50"
          >
            Create Order
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Floor Price Chart</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setTimeframe('1d')}
            className={`px-4 py-2 rounded-lg ${
              timeframe === '1d' 
                ? 'bg-yellow-600 text-white' 
                : 'text-yellow-600 hover:bg-yellow-600/10'
            }`}
          >
            1 Day
          </button>
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-4 py-2 rounded-lg ${
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

      <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-6">Order Book for DOGE</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-black/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-yellow-600">{order.from_amount} {order.from_token}</span>
                  {' → '}
                  <span className="text-yellow-600">{order.to_amount} {order.to_token}</span>
                </div>
                <span className={getRatioColor(calculateTradeRatio(order.from_amount, order.to_amount))}>
                  {calculateTradeRatio(order.from_amount, order.to_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};