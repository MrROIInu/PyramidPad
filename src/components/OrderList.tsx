import React, { useState } from 'react';
import { Copy, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { TOKEN_PRICES, formatPriceUSD } from '../lib/tokenPrices';
import { Order } from '../types';
import { WalletAddressInput } from './wallet/WalletAddressInput';
import { useWalletManager } from '../hooks/useWalletManager';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface OrderListProps {
  orders: Order[];
  onCancel: (id: number) => void;
  onClaim: (id: number) => void;
  loading?: boolean;
  showCancelButton?: boolean;
  userWalletAddress?: string;
  type?: 'active' | 'claimed' | 'cancelled';
}

export const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  onCancel, 
  onClaim, 
  loading = false,
  showCancelButton = false,
  userWalletAddress,
  type = 'active'
}) => {
  const {
    walletAddress,
    isWalletChecked,
    isWalletValid,
    copied,
    isLoading,
    handleWalletChange,
    checkWallet,
    copyFeeWallet
  } = useWalletManager(false);

  const [cancelledOrders, setCancelledOrders] = useState<Record<number, boolean>>({});
  const [visibleOrders, setVisibleOrders] = useState(3);

  const handleCancel = async (id: number) => {
    await onCancel(id);
    setCancelledOrders(prev => ({ ...prev, [id]: true }));
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert('TX copied to clipboard. Claim order when you have made swap in Photonic Wallet.');
  };

  const calculatePriceDeviation = (order: Order) => {
    const fromPrice = TOKEN_PRICES[order.from_token] || 0;
    const toPrice = TOKEN_PRICES[order.to_token] || 0;
    
    if (fromPrice === 0 || toPrice === 0) return 0;

    const orderRate = order.to_amount / order.from_amount;
    const marketRate = fromPrice / toPrice;
    
    return ((orderRate / marketRate) - 1) * 100;
  };

  const getDeviationDisplay = (deviation: number) => {
    if (Math.abs(deviation) < 0.1) {
      return "Trading at market price";
    }
    return (
      <div className="flex items-center gap-1">
        Trading {deviation > 0 ? 'above' : 'below'} market price by {Math.abs(deviation).toFixed(2)}%
        {deviation > 0 ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  const title = type === 'active' ? 'Open Orders' : 
                type === 'claimed' ? 'Claimed Orders' : 
                'Cancelled Orders';

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
          {title}
        </h2>
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm text-center">
          <p className="text-yellow-600">No {type} orders</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-6">
        {title}
      </h2>

      {!userWalletAddress && type === 'active' && (
        <div className="mb-6">
          <WalletAddressInput
            walletAddress={walletAddress}
            isWalletChecked={isWalletChecked}
            isWalletValid={isWalletValid}
            copied={copied}
            isLoading={isLoading}
            onWalletChange={handleWalletChange}
            onCopyFeeWallet={copyFeeWallet}
            onCheck={checkWallet}
            showCheckButton={true}
          />
        </div>
      )}

      <div className="space-y-4">
        {orders.slice(0, visibleOrders).map(order => {
          const fromToken = order.from_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === order.from_token);
          const toToken = order.to_token === 'RXD' ? RXD_TOKEN : TOKENS.find(t => t.symbol === order.to_token);

          if (!fromToken || !toToken) return null;

          const priceDeviation = calculatePriceDeviation(order);
          const canCancel = showCancelButton && order.wallet_address === (userWalletAddress || walletAddress);
          const canClaim = isWalletValid || (userWalletAddress && userWalletAddress === order.wallet_address);
          const isCancelled = cancelledOrders[order.id];

          return (
            <div
              key={order.id}
              id={`order-${order.id}`}
              className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <img src={fromToken.imageUrl} alt={fromToken.symbol} className="w-8 h-8 rounded-full" />
                      <div>
                        <span className="text-lg">{order.from_amount} {fromToken.symbol}</span>
                        <div className="text-sm text-yellow-600/80">
                          ≈ {formatPriceUSD(order.from_amount * TOKEN_PRICES[fromToken.symbol])}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-yellow-600">→</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <img src={toToken.imageUrl} alt={toToken.symbol} className="w-8 h-8 rounded-full" />
                      <div>
                        <span className="text-lg">{order.to_amount} {toToken.symbol}</span>
                        <div className="text-sm text-yellow-600/80">
                          ≈ {formatPriceUSD(order.to_amount * TOKEN_PRICES[toToken.symbol])}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {canClaim && !isCancelled && type === 'active' && (
                    <button
                      onClick={() => onClaim(order.id)}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg hover:from-yellow-500 hover:to-amber-700 transition-all"
                    >
                      Claim
                    </button>
                  )}
                  {canCancel && !isCancelled && type === 'active' && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="px-4 py-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {isCancelled && (
                    <span className="px-4 py-2 bg-red-600/20 text-red-500 rounded-lg">
                      Order Cancelled
                    </span>
                  )}
                </div>
              </div>

              <div className={`text-center mb-4 ${Math.abs(priceDeviation) >= 10 ? 'text-red-500 font-bold' : 'text-yellow-600'}`}>
                {getDeviationDisplay(priceDeviation)}
              </div>

              {canClaim && !isCancelled && type === 'active' && (
                <div className="relative">
                  <p className="text-yellow-600 mb-2">Copy TX to Photonic Wallet. Claim after P2PSwap is done.</p>
                  <div 
                    className="flex items-start gap-2 bg-black/30 border border-yellow-600/30 rounded-lg p-4 cursor-pointer group"
                    onClick={() => handleCopy(order.swap_tx)}
                  >
                    <code className="flex-1 text-sm break-all">{order.swap_tx}</code>
                    <button className="text-yellow-600 hover:text-yellow-500 p-1">
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {orders.length > 3 && (
        <div className="mt-6 px-4">
          <Slider
            min={3}
            max={orders.length}
            value={visibleOrders}
            onChange={(value) => setVisibleOrders(typeof value === 'number' ? value : 3)}
            railStyle={{ backgroundColor: 'rgba(202, 138, 4, 0.2)' }}
            trackStyle={{ backgroundColor: 'rgb(202, 138, 4)' }}
            handleStyle={{
              borderColor: 'rgb(202, 138, 4)',
              backgroundColor: 'rgb(202, 138, 4)'
            }}
          />
          <div className="text-center text-sm text-yellow-600 mt-2">
            Showing {visibleOrders} of {orders.length} orders
          </div>
        </div>
      )}
    </div>
  );
};