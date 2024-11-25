import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { TokenSelect } from './TokenSelect';
import { P2PSwapLogo } from './P2PSwapLogo';
import { OrderCard } from './OrderCard';
import { Order } from '../types';
import { saveOrder } from '../lib/database';

export const P2PSwap: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    fetchOrders();
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

  const calculateRatio = () => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) return 0;
    return (parseFloat(fromAmount) / fromToken.totalSupply) / (parseFloat(toAmount) / toToken.totalSupply);
  };

  const getRatioColor = (ratio: number) => {
    if (ratio >= 0.1 && ratio <= 5) return 'text-green-500';
    if (ratio > 5 && ratio <= 9) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromToken || !toToken || !fromAmount || !toAmount || !swapTx) return;

    try {
      await saveOrder({
        from_token: fromToken.symbol,
        to_token: toToken.symbol,
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        swap_tx: swapTx
      });

      setFromAmount('');
      setToAmount('');
      setSwapTx('');
      setImportedTx('');
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const parseImportedTx = (text: string) => {
    const match = text.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([\w\d]+)/);
    if (match) {
      const [, amount, fromSymbol, toAmt, toSymbol, tx] = match;
      const foundFromToken = TOKENS.find(t => t.symbol === fromSymbol);
      const foundToToken = TOKENS.find(t => t.symbol === toSymbol);
      
      if (foundFromToken && foundToToken) {
        setFromToken(foundFromToken);
        setToToken(foundToToken);
        setFromAmount(amount);
        setToAmount(toAmt);
        setSwapTx(tx);
      }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <P2PSwapLogo className="mb-8" />

      <form onSubmit={handleCreateOrder} className="mb-12">
        <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleRefresh}
              className="text-yellow-600 hover:text-yellow-500 p-1"
              title="Reload"
            >
              <RotateCw size={16} />
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
                type="number"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter amount"
                required
              />
              {fromAmount && toAmount && (
                <p className={`text-sm mt-1 ${getRatioColor(calculateRatio())}`}>
                  Trade Ratio: {calculateRatio().toFixed(2)}:1
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-yellow-600 mb-2">
              <a 
                href="https://photonic-test.radiant4people.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-500 no-underline"
              >
                Swap in Photonic Wallet
              </a> with TX:
            </p>
            <input
              type="text"
              value={swapTx}
              onChange={(e) => setSwapTx(e.target.value)}
              className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 mb-2"
              placeholder="Enter your swap transaction"
              required
            />
            <div>
              <label className="block text-yellow-600 mb-2">
                Import full Transaction text from Photonic Wallet to fill input form:
              </label>
              <textarea
                value={importedTx}
                onChange={(e) => {
                  setImportedTx(e.target.value);
                  parseImportedTx(e.target.value);
                }}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Example: 🔁 Swap: 1000 RXD ➔ 1000 POW 📋01000000015c943f068b829d3e00c0638948303463f74aa6839fea2ee5698b712061a8482a000000006a47304402203eef3431f97c5ad0f59bcc5198747771a85dc3d9513d3594c8b042a943e872c302201f332de8b6349831ed01dc530f339fb42f0017e9a30ccfdecfe22ba31f26e2aac32102a86b11635102f4e0f74f2cba09c8db13363ad25e5b656380d8fe271ffb769473ffffffff01e8030000000000004b76a9142b91c3856057c3fc1526bad0ed2069421782a73b88acbdd0b01b97916dd47320f939b42eb0f51709928d874dfd773dd6e92166afc5db190500000000dec0e9aa76e378e4a269e69d00000000🟦"
                rows={3}
                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
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
                onClaim={fetchOrders}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};