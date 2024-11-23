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

export const OrderBookDemo: React.FC = () => {
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

  // Rest of the component remains the same...
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Existing JSX */}
    </div>
  );
};