import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowRightLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GlyphSwapLogo } from './GlyphSwapLogo';
import { TestLogo } from './TestLogo';
import { WalletConnect } from './WalletConnect';
import { PriceChart } from './PriceChart';
import { useClipboard } from '../hooks/useClipboard';
import { TransactionHistory } from './TransactionHistory';
import { CollectionChart } from './CollectionChart';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import { TOKENS } from '../data/tokens';
import { OrderList } from './OrderList';
import { TokenSelect } from './TokenSelect';

const RXD_TOKEN = TOKENS.find(t => t.symbol === 'RXD')!;

export const GlyphSwap: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState(TOKENS.find(t => t.symbol === 'DOGE')!);
  const [isRxdToToken, setIsRxdToToken] = useState(true);
  const [rxdAmount, setRxdAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [trades, setTrades] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');

  useEffect(() => {
    fetchOrders();
    fetchTrades();
  }, [selectedToken]);

  const fetchTrades = async () => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .or(`from_token.eq.${selectedToken.symbol},to_token.eq.${selectedToken.symbol}`)
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
      .or(`from_token.eq.${selectedToken.symbol},to_token.eq.${selectedToken.symbol}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchTrades();
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
      const isRxdFirst = token1 === 'RXD';
      const token = TOKENS.find(t => t.symbol === (isRxdFirst ? token2 : token1));
      
      if (token) {
        setSelectedToken(token);
        setIsRxdToToken(isRxdFirst);
        setRxdAmount(isRxdFirst ? amount1 : amount2);
        setTokenAmount(isRxdFirst ? amount2 : amount1);
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
    if (!rxdAmount || !tokenAmount || !transactionId) return;

    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          from_token: isRxdToToken ? RXD_TOKEN.symbol : selectedToken.symbol,
          to_token: isRxdToToken ? selectedToken.symbol : RXD_TOKEN.symbol,
          from_amount: parseFloat(isRxdToToken ? rxdAmount : tokenAmount),
          to_amount: parseFloat(isRxdToToken ? tokenAmount : rxdAmount),
          swap_tx: transactionId,
          claimed: false,
          claim_count: 0,
          price: TOKEN_PRICES[selectedToken.symbol]
        }]);

      if (error) throw error;

      setRxdAmount('');
      setTokenAmount('');
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
    <div className="min-h-screen">
      <TestLogo />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <GlyphSwapLogo />
          <WalletConnect />
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

            <div className="mb-6">
              <label className="block text-yellow-600 mb-2">Select Token</label>
              <div className="flex items-center gap-4">
                <TokenSelect
                  tokens={TOKENS.filter(t => t.symbol !== 'RXD')}
                  selectedToken={selectedToken}
                  onChange={setSelectedToken}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setIsRxdToToken(!isRxdToToken)}
                  className="bg-yellow-600/20 text-yellow-600 p-2 rounded-lg hover:bg-yellow-600/30 transition-colors"
                >
                  <ArrowRightLeft size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-yellow-600 mb-2">
                  {isRxdToToken ? 'RXD Amount' : `${selectedToken.symbol} Amount`}
                </label>
                <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                  <img
                    src={isRxdToToken ? RXD_TOKEN.imageUrl : selectedToken.imageUrl}
                    alt={isRxdToToken ? 'RXD' : selectedToken.symbol}
                    className="w-6 h-6"
                  />
                  <input
                    type="number"
                    value={isRxdToToken ? rxdAmount : tokenAmount}
                    onChange={(e) => {
                      if (isRxdToToken) {
                        setRxdAmount(e.target.value);
                        const ratio = TOKEN_PRICES[selectedToken.symbol] / TOKEN_PRICES.RXD;
                        setTokenAmount((parseFloat(e.target.value) * ratio).toFixed(6));
                      } else {
                        setTokenAmount(e.target.value);
                        const ratio = TOKEN_PRICES.RXD / TOKEN_PRICES[selectedToken.symbol];
                        setRxdAmount((parseFloat(e.target.value) * ratio).toFixed(6));
                      }
                    }}
                    className="flex-1 bg-transparent focus:outline-none"
                    placeholder={`Enter amount`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-yellow-600 mb-2">You Will Receive</label>
                <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                  <img
                    src={isRxdToToken ? selectedToken.imageUrl : RXD_TOKEN.imageUrl}
                    alt={isRxdToToken ? selectedToken.symbol : 'RXD'}
                    className="w-6 h-6"
                  />
                  <input
                    type="number"
                    value={isRxdToToken ? tokenAmount : rxdAmount}
                    onChange={(e) => {
                      if (isRxdToToken) {
                        setTokenAmount(e.target.value);
                        const ratio = TOKEN_PRICES.RXD / TOKEN_PRICES[selectedToken.symbol];
                        setRxdAmount((parseFloat(e.target.value) * ratio).toFixed(6));
                      } else {
                        setRxdAmount(e.target.value);
                        const ratio = TOKEN_PRICES[selectedToken.symbol] / TOKEN_PRICES.RXD;
                        setTokenAmount((parseFloat(e.target.value) * ratio).toFixed(6));
                      }
                    }}
                    className="flex-1 bg-transparent focus:outline-none"
                    placeholder={`Enter amount`}
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
                placeholder="Example: 🔁 Swap: 10 RXD ➔ 12 Doge 📋01000000011663127159c249e495🟦"
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
              Collection Overview
            </h2>
            <CollectionChart />
          </div>
        </div>

        <div className="mt-12 text-center pb-8">
          <a 
            href="https://discord.gg/pwBMDDzWWG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-yellow-600 hover:text-yellow-500 transition-colors"
          >
            Join our Discord and help us in developing GlyphSwap
          </a>
        </div>
      </div>
    </div>
  );
};