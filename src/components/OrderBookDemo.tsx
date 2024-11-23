import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowLeftRight } from 'lucide-react';
import { OrderBookLogo } from './OrderBookLogo';
import { TestLogo } from './TestLogo';
import { TOKENS } from '../data/tokens';
import { supabase } from '../lib/supabase';
import { TokenSelect } from './TokenSelect';

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
  const [fromToken, setFromToken] = useState(TOKENS.find(t => t.symbol === "RXD") || TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS.find(t => t.symbol === "DOGE") || TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapTx, setSwapTx] = useState('');
  const [importedTx, setImportedTx] = useState('');
  const [isRxdToDoge, setIsRxdToDoge] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '7d'>('1d');

  useEffect(() => {
    fetchOrders();
    fetchTrades();

    // Subscribe to orderbook changes
    const ordersSubscription = supabase
      .channel('orderbook_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orderbook' }, 
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    // Subscribe to trades changes
    const tradesSubscription = supabase
      .channel('trades_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trades' }, 
        () => {
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      tradesSubscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orderbook')
        .select('*')
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

  const handleSwitch = () => {
    setIsRxdToDoge(!isRxdToDoge);
    const newFromToken = isRxdToDoge ? toToken : fromToken;
    const newToToken = isRxdToDoge ? fromToken : toToken;
    setFromToken(newFromToken);
    setToToken(newToToken);
    setFromAmount('');
    setToAmount('');
  };

  const parseImportedTx = (text: string) => {
    const match = text.match(/🔁 Swap: (\d+(?:\.\d+)?) ([A-Za-z0-9]+) ➔ (\d+(?:\.\d+)?) ([A-Za-z0-9]+) 📋([a-zA-Z0-9]+)/);
    
    if (match) {
      const [, fromAmt, fromSymbol, toAmt, toSymbol, tx] = match;
      const foundFromToken = TOKENS.find(t => t.symbol === fromSymbol);
      const foundToToken = TOKENS.find(t => t.symbol === toSymbol);
      
      if (foundFromToken && foundToToken) {
        setFromToken(foundFromToken);
        setToToken(foundToToken);
        setFromAmount(fromAmt);
        setToAmount(toAmt);
        setSwapTx(tx);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromToken || !toToken || !fromAmount || !toAmount || !swapTx) return;

    try {
      const price = parseFloat(toAmount) / parseFloat(fromAmount);
      
      const { error } = await supabase
        .from('orderbook')
        .insert([{
          from_token: fromToken.symbol,
          to_token: toToken.symbol,
          from_amount: parseFloat(fromAmount),
          to_amount: parseFloat(toAmount),
          price,
          status: 'active'
        }]);

      if (error) throw error;

      // Also record as a trade
      const { error: tradeError } = await supabase
        .from('trades')
        .insert([{
          from_token: fromToken.symbol,
          to_token: toToken.symbol,
          from_amount: parseFloat(fromAmount),
          to_amount: parseFloat(toAmount),
          price
        }]);

      if (tradeError) throw tradeError;

      setFromAmount('');
      setToAmount('');
      setSwapTx('');
      setImportedTx('');
      
      await Promise.all([fetchOrders(), fetchTrades()]);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-center mb-8">
        <OrderBookLogo />
        <TestLogo className="ml-4" size="medium" />
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create Swap Order</h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleRefresh}
                className="text-yellow-600 hover:text-yellow-500 p-1"
                title="Reload"
              >
                <RotateCw size={16} />
              </button>
              <button
                type="button"
                onClick={handleSwitch}
                className="flex items-center gap-2 text-yellow-600 hover:text-yellow-500 p-2"
              >
                <ArrowLeftRight size={20} />
                Switch Pair
              </button>
            </div>
          </div>

          {/* Rest of the form remains the same */}
        </div>
      </form>

      {/* Rest of the component remains the same */}
    </div>
  );
};