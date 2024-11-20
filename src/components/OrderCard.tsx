import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fromToken = TOKENS.find(t => t.symbol === order.from_token);
  const toToken = TOKENS.find(t => t.symbol === order.to_token);

  if (!fromToken || !toToken) return null;

  const ratio = (order.from_amount / fromToken.totalSupply) / (order.to_amount / toToken.totalSupply);
  const displayRatio = ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;

  const getRatioColor = (ratio: number) => {
    if (ratio >= 0.1 && ratio <= 6) return 'text-green-500';
    if (ratio > 6 && ratio <= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(order.swap_tx);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 10000);
  };

  const handleClaim = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ 
        claimed: true,
        claim_count: (order.claim_count || 0) + 1 
      })
      .eq('id', order.id);

    if (error) {
      console.error('Error claiming order:', error);
    }
    setIsUpdating(false);
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <img src={fromToken.imageUrl} alt={fromToken.symbol} className="w-8 h-8 rounded-full" />
          <span className="text-lg">{order.from_amount} {fromToken.symbol}</span>
        </div>
        <span className="text-yellow-600">→</span>
        <div className="flex items-center gap-2">
          <img src={toToken.imageUrl} alt={toToken.symbol} className="w-8 h-8 rounded-full" />
          <span className="text-lg">{order.to_amount} {toToken.symbol}</span>
        </div>
      </div>

      <p className={`mb-4 ${getRatioColor(ratio)}`}>
        Trade Ratio: {displayRatio} (compared with tokens total supply)
      </p>

      <div className="mb-4">
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
        <div className="flex items-start gap-2 bg-black/30 border border-yellow-600/30 rounded-lg p-4">
          <code className="flex-1 text-sm break-all">{order.swap_tx}</code>
          <button
            onClick={handleCopy}
            className="text-yellow-600 hover:text-yellow-500 p-1"
          >
            <Copy size={20} />
          </button>
        </div>
        {showCopyMessage && (
          <p className="text-green-500 text-sm mt-1">
            Copied to clipboard. Use it in Photonic Wallet to make the swap.
          </p>
        )}
      </div>

      {!order.claimed ? (
        <button
          onClick={handleClaim}
          disabled={isUpdating}
          className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50"
        >
          {isUpdating ? 'Processing...' : 'Claim'}
        </button>
      ) : (
        <p className="text-center text-yellow-600">Claimed</p>
      )}
    </div>
  );
};