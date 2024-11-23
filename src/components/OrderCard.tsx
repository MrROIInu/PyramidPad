import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { updateOrderStatus } from '../lib/database';
import { Order } from '../types';

interface OrderCardProps {
  order: Order;
  onClaim?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClaim }) => {
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fromToken = TOKENS.find(t => t.symbol === order.from_token);
  const toToken = TOKENS.find(t => t.symbol === order.to_token);

  if (!fromToken || !toToken) return null;

  const ratio = (order.from_amount / fromToken.totalSupply) / (order.to_amount / toToken.totalSupply);
  const displayRatio = ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;

  const getRatioColor = (ratio: number) => {
    if (ratio >= 0.1 && ratio <= 5) return 'text-green-500';
    if (ratio > 5 && ratio <= 9) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClaim = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, true);
      if (onClaim) onClaim();
    } catch (error) {
      console.error('Error claiming order:', error);
      alert('Failed to claim order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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
        Trade Ratio: {displayRatio}
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
        <div className="relative">
          <div 
            className="flex items-start gap-2 bg-black/30 border border-yellow-600/30 rounded-lg p-4 cursor-pointer group"
            onClick={() => handleCopy(order.swap_tx)}
          >
            <code className="flex-1 text-sm break-all">{order.swap_tx}</code>
            <button className="text-yellow-600 hover:text-yellow-500 p-1">
              <Copy size={20} />
            </button>
          </div>
          {showCopyMessage && (
            <div className="absolute top-full left-0 right-0 mt-2 text-center">
              <p className="text-green-500 text-sm bg-black/80 rounded-lg py-2 px-4 inline-block">
                Copied to clipboard. Use it in Photonic Wallet to make the swap.
              </p>
            </div>
          )}
        </div>
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