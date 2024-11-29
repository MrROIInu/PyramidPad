import React, { useState, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TOKENS, DEFAULT_TOKEN } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { TokenSelect } from './TokenSelect';
import { OrderList } from './OrderList';
import { TransactionHistory } from './TransactionHistory';
import { useClipboard } from '../hooks/useClipboard';
import { TOKEN_PRICES, formatPriceUSD } from '../lib/tokenPrices';

export const OrderBookSwap: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const initialToken = tokenParam ? TOKENS.find(t => t.symbol === tokenParam) || DEFAULT_TOKEN : DEFAULT_TOKEN;

  const [selectedToken, setSelectedToken] = useState(initialToken);
  const [isRxdToToken, setIsRxdToToken] = useState(true);
  const [rxdAmount, setRxdAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Update selected token when URL parameter changes
    if (tokenParam) {
      const token = TOKENS.find(t => t.symbol === tokenParam);
      if (token) {
        setSelectedToken(token);
      }
    }
  }, [tokenParam]);

  useEffect(() => {
    fetchOrders();
  }, [selectedToken]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`from_token.eq.${selectedToken.symbol},to_token.eq.${selectedToken.symbol}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
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

  useClipboard(handleImportedTxChange);

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
    <div className="container mx-auto px-4">
      <form onSubmit={handleSubmit} className="mb-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
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
          orders={orders.filter(o => !o.claimed && o.status !== 'cancelled')}
          onCancel={async (orderId) => {
            const { error } = await supabase
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('id', orderId);
            if (!error) fetchOrders();
          }}
          onClaim={async (orderId) => {
            const { error } = await supabase
              .from('orders')
              .update({ claimed: true })
              .eq('id', orderId);
            if (!error) fetchOrders();
          }}
        />

        <TransactionHistory 
          transactions={[]}
          orders={orders}
        />
      </div>
    </div>
  );
};