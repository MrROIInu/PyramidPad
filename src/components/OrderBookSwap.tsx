import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { TokenSelect } from './TokenSelect';
import { OrderList } from './OrderList';
import { PriceChart } from './PriceChart';
import { TransactionHistory } from './TransactionHistory';
import { CollectionChart } from './CollectionChart';
import { TOKEN_PRICES, formatPriceUSD } from '../lib/tokenPrices';

// Find RADCAT token to use as default
const DEFAULT_TOKEN = TOKENS.find(t => t.symbol === 'RADCAT') || TOKENS[0];

export const OrderBookSwap: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState(DEFAULT_TOKEN);
  const [isRxdToToken, setIsRxdToToken] = useState(true);
  const [rxdAmount, setRxdAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');

  useEffect(() => {
    fetchOrders();
    fetchTrades();
  }, [selectedToken]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`from_token.eq.${selectedToken.symbol},to_token.eq.${selectedToken.symbol}`)
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
        .or(`from_token.eq.${selectedToken.symbol},to_token.eq.${selectedToken.symbol}`)
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

  const handleImportedTxChange = (text: string) => {
    if (!text.includes('🔁 Swap:') || !text.includes('➔') || !text.includes('📋')) return;
    
    setImportedTx(text);
    
    const match = text.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([^\s🟦]+)/);
    
    if (match) {
      const [, amount1, token1, amount2, token2, tx] = match;
      const token = TOKENS.find(t => t.symbol === token2);
      
      if (token) {
        setSelectedToken(token);
        setRxdAmount(amount1);
        setTokenAmount(amount2);
        setTransactionId(tx);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxdAmount || !tokenAmount || !transactionId) return;

    try {
      const orderData = {
        from_token: isRxdToToken ? RXD_TOKEN.symbol : selectedToken.symbol,
        to_token: isRxdToToken ? selectedToken.symbol : RXD_TOKEN.symbol,
        from_amount: parseFloat(isRxdToToken ? rxdAmount : tokenAmount),
        to_amount: parseFloat(isRxdToToken ? tokenAmount : rxdAmount),
        swap_tx: transactionId,
        claimed: false,
        claim_count: 0,
        status: 'active'
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      setRxdAmount('');
      setTokenAmount('');
      setTransactionId('');
      setImportedTx('');
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
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

          <div className="mb-6">
            <label className="block text-yellow-600 mb-2">Select Token</label>
            <TokenSelect
              tokens={TOKENS.filter(t => t.symbol !== 'RXD')}
              selectedToken={selectedToken}
              onChange={setSelectedToken}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-yellow-600 mb-2">
                {isRxdToToken ? 'RXD Amount' : `${selectedToken.symbol} Amount`}
              </label>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                  <img
                    src={isRxdToToken ? RXD_TOKEN.imageUrl : selectedToken.imageUrl}
                    alt=""
                    className="w-6 h-6"
                  />
                  <input
                    type="number"
                    value={isRxdToToken ? rxdAmount : tokenAmount}
                    onChange={(e) => isRxdToToken ? setRxdAmount(e.target.value) : setTokenAmount(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="text-sm text-yellow-600/80 px-2">
                  ≈ {formatPriceUSD(parseFloat(isRxdToToken ? rxdAmount : tokenAmount) * TOKEN_PRICES[isRxdToToken ? 'RXD' : selectedToken.symbol])}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">You Will Receive</label>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                  <img
                    src={isRxdToToken ? selectedToken.imageUrl : RXD_TOKEN.imageUrl}
                    alt=""
                    className="w-6 h-6"
                  />
                  <input
                    type="number"
                    value={isRxdToToken ? tokenAmount : rxdAmount}
                    onChange={(e) => isRxdToToken ? setTokenAmount(e.target.value) : setRxdAmount(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="text-sm text-yellow-600/80 px-2">
                  ≈ {formatPriceUSD(parseFloat(isRxdToToken ? tokenAmount : rxdAmount) * TOKEN_PRICES[isRxdToToken ? selectedToken.symbol : 'RXD'])}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRxdToToken(!isRxdToToken)}
            className="w-full flex items-center justify-center gap-2 bg-yellow-600/20 text-yellow-600 rounded-lg px-6 py-3 font-semibold hover:bg-yellow-600/30 transition-all mb-6"
          >
            <ArrowUpDown size={20} />
            Switch Direction
          </button>

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
          onCancel={async (orderId) => {
            const { error } = await supabase
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('id', orderId);
            if (!error) fetchOrders();
          }}
          onClaim={async (orderId) => {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            const { error: orderError } = await supabase
              .from('orders')
              .update({ claimed: true })
              .eq('id', orderId);

            if (!orderError) {
              const { error: tradeError } = await supabase
                .from('trades')
                .insert([{
                  from_token: order.from_token,
                  to_token: order.to_token,
                  from_amount: order.from_amount,
                  to_amount: order.to_amount,
                  price: TOKEN_PRICES[order.to_token],
                  created_at: new Date().toISOString()
                }]);

              if (!tradeError) {
                fetchOrders();
                fetchTrades();
              }
            }
          }}
        />

        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
            Floor Price Chart for {selectedToken.symbol}
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
            RXD20 Glyph Token Chart
          </h2>
          <CollectionChart />
        </div>
      </div>
    </div>
  );
};