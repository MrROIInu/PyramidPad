import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowRightLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OrderBookLogo } from './OrderBookLogo';
import { PriceChart } from './PriceChart';
import { TransactionHistory } from './TransactionHistory';
import { CollectionChart } from './CollectionChart';
import { useClipboard } from '../hooks/useClipboard';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import { TOKENS } from '../data/tokens';
import { OrderList } from './OrderList';

const RXD_TOKEN = TOKENS.find(t => t.symbol === 'RXD')!;
const DOGE_TOKEN = TOKENS.find(t => t.symbol === 'DOGE')!;

export const OrderBookSwap: React.FC = () => {
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);
  const [rxdAmount, setRxdAmount] = useState('');
  const [dogeAmount, setDogeAmount] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [trades, setTrades] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
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
      .from('orders')
      .select('*')
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

  const handleSwitch = () => {
    setIsRxdToDoge(!isRxdToDoge);
    const tempRxd = rxdAmount;
    setRxdAmount(dogeAmount);
    setDogeAmount(tempRxd);
    if (tradeRatio) {
      const [num, den] = tradeRatio.split(':');
      setTradeRatio(`${den}:${num}`);
    }
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
    if (!text.includes('🔁 Swap:') || !text.includes('➔') || !text.includes('📋')) return;
    
    setImportedTx(text);
    
    const match = text.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([^\s🟦]+)/);
    
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
        .from('orders')
        .insert([{
          from_token: isRxdToDoge ? 'RXD' : 'DOGE',
          to_token: isRxdToDoge ? 'DOGE' : 'RXD',
          from_amount: parseFloat(isRxdToDoge ? rxdAmount : dogeAmount),
          to_amount: parseFloat(isRxdToDoge ? dogeAmount : rxdAmount),
          swap_tx: transactionId,
          claimed: false,
          claim_count: 0,
          price: TOKEN_PRICES[isRxdToDoge ? 'DOGE' : 'RXD']
        }]);

      if (error) throw error;

      setRxdAmount('');
      setDogeAmount('');
      setTransactionId('');
      setImportedTx('');
      setTradeRatio('');
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleClaimOrder = async (orderId: number) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const { error: orderError } = await supabase
        .from('orders')
        .update({ claimed: true })
        .eq('id', orderId);

      if (orderError) throw orderError;

      const { error: tradeError } = await supabase
        .from('trades')
        .insert([{
          from_token: order.from_token,
          to_token: order.to_token,
          from_amount: order.from_amount,
          to_amount: order.to_amount,
          price: order.price,
          created_at: new Date().toISOString()
        }]);

      if (tradeError) throw tradeError;

      fetchOrders();
      fetchTrades();
    } catch (error) {
      console.error('Error claiming order:', error);
      alert('Failed to claim order. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <OrderBookLogo />
      </div>

      <form onSubmit={handleSubmit} className="mb-12">
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

          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={handleSwitch}
              className="flex items-center gap-2 bg-yellow-600/20 text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-600/30 transition-colors"
            >
              <img src={isRxdToDoge ? RXD_TOKEN.imageUrl : DOGE_TOKEN.imageUrl} alt="" className="w-6 h-6" />
              <span>{isRxdToDoge ? 'RXD → DOGE' : 'DOGE → RXD'}</span>
              <ArrowRightLeft size={16} />
            </button>
          </div>

          {/* Form inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">Amount</label>
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <img
                  src={isRxdToDoge ? RXD_TOKEN.imageUrl : DOGE_TOKEN.imageUrl}
                  alt=""
                  className="w-6 h-6"
                />
                <input
                  type="number"
                  value={isRxdToDoge ? rxdAmount : dogeAmount}
                  onChange={(e) => isRxdToDoge ? setRxdAmount(e.target.value) : setDogeAmount(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none"
                  placeholder={`Enter ${isRxdToDoge ? 'RXD' : 'DOGE'} amount`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">You Will Receive</label>
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <img
                  src={isRxdToDoge ? DOGE_TOKEN.imageUrl : RXD_TOKEN.imageUrl}
                  alt=""
                  className="w-6 h-6"
                />
                <input
                  type="number"
                  value={isRxdToDoge ? dogeAmount : rxdAmount}
                  onChange={(e) => isRxdToDoge ? setDogeAmount(e.target.value) : setRxdAmount(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none"
                  placeholder={`Enter ${isRxdToDoge ? 'DOGE' : 'RXD'} amount`}
                  required
                />
              </div>
            </div>
          </div>

          {tradeRatio && (
            <div className={`text-center mb-6 ${getRatioColor(tradeRatio)}`}>
              Trade Ratio: {tradeRatio}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-yellow-600 mb-2">
              Import Transaction text from Photonic Wallet P2PSwap:
            </label>
            <textarea
              value={importedTx}
              onChange={(e) => handleImportedTxChange(e.target.value)}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 mb-2"
              placeholder="Example: 🔁 Swap: 1000 RXD ➔ 1000 DOGE 📋01000000015c🟦"
              rows={3}
              style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}
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
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all mt-6"
          >
            Create Swap Order
          </button>
        </div>
      </form>

      <div className="space-y-12">
        <OrderList
          orders={orders}
          onCancel={handleCancelOrder}
          onClaim={handleClaimOrder}
        />

        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
            Floor Price Chart
          </h2>
          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex justify-end gap-4 mb-4">
              <button
                onClick={() => setTimeframe('1d')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeframe === '1d'
                    ? 'bg-yellow-600 text-white'
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                1D
              </button>
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-4 py-2 rounded-lg transition-colors ${
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
        </div>

        <TransactionHistory transactions={trades} />

        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
            Collection Overview
          </h2>
          <CollectionChart />
        </div>
      </div>
    </div>
  );
};