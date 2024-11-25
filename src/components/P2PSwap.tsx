import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { TokenSelect } from './TokenSelect';
import { P2PSwapLogo } from './P2PSwapLogo';
import { OrderCard } from './OrderCard';
import { useClipboard } from '../hooks/useClipboard';

export const P2PSwap: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

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
    fetchOrders();
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
      
      const token1Obj = TOKENS.find(t => t.symbol === token1);
      const token2Obj = TOKENS.find(t => t.symbol === token2);
      
      if (token1Obj && token2Obj) {
        setFromToken(token1Obj);
        setToToken(token2Obj);
        setFromAmount(amount1);
        setToAmount(amount2);
        setSwapTx(tx);
        setTradeRatio(calculateTradeRatio(parseFloat(amount1), parseFloat(amount2)));
      }
    }
  };

  useClipboard((text: string) => {
    handleImportedTxChange(text);
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromToken || !toToken || !fromAmount || !toAmount || !swapTx) return;

    const { error } = await supabase
      .from('orders')
      .insert([{
        from_token: fromToken.symbol,
        to_token: toToken.symbol,
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        swap_tx: swapTx,
        claimed: false,
        claim_count: 0
      }]);

    if (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } else {
      setFromAmount('');
      setToAmount('');
      setSwapTx('');
      setImportedTx('');
      setTradeRatio('');
      fetchOrders();
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center mb-8">
        <P2PSwapLogo />
      </div>

      <form onSubmit={handleCreateOrder} className="mb-12">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">From Token</label>
              <TokenSelect
                tokens={TOKENS}
                selectedToken={fromToken}
                onChange={setFromToken}
              />
            </div>
            <div>
              <label className="block text-yellow-600 mb-2">Amount</label>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">To Token</label>
              <TokenSelect
                tokens={TOKENS}
                selectedToken={toToken}
                onChange={setToToken}
              />
            </div>
            <div>
              <label className="block text-yellow-600 mb-2">You Will Receive</label>
              <input
                type="text"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
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
              value={swapTx}
              onChange={(e) => setSwapTx(e.target.value)}
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

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
          Active Orders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.filter(order => !order.claimed).map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClaim={fetchOrders}
            />
          ))}
        </div>
      </div>

      {orders.some(order => order.claimed) && (
        <div className="space-y-6 mt-12">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
            Claimed Orders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.filter(order => order.claimed).map(order => (
              <OrderCard
                key={order.id}
                order={order}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};