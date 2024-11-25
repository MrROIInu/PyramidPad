import React, { useState, useEffect } from 'react';
import { Copy, RotateCw, ArrowRightLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { TokenSelect } from './TokenSelect';
import { OrderList } from './OrderList';
import { PriceChart } from './PriceChart';
import { TransactionHistory } from './TransactionHistory';
import { CollectionChart } from './CollectionChart';
import { TestLogo } from './TestLogo';
import { WalletConnect } from './WalletConnect';
import { TOKEN_PRICES, formatPriceUSD } from '../lib/tokenPrices';

const RXD_TOKEN = TOKENS.find(t => t.symbol === 'RXD')!;
const RADCAT_TOKEN = TOKENS.find(t => t.symbol === 'RADCAT')!;

export const GlyphSwap: React.FC = () => {
  // ... existing state declarations ...

  const calculateUSDValue = (amount: string, token: typeof RADCAT_TOKEN) => {
    const tokenPrice = TOKEN_PRICES[token.symbol];
    return tokenPrice * parseFloat(amount || '0');
  };

  // ... rest of the component code until the form inputs ...

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... existing header code ... */}

      <form onSubmit={handleSubmit} className="mb-12">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          {/* ... existing form header ... */}

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
                  ≈ {formatPriceUSD(calculateUSDValue(
                    isRxdToToken ? rxdAmount : tokenAmount,
                    isRxdToToken ? RXD_TOKEN : selectedToken
                  ))}
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
                  ≈ {formatPriceUSD(calculateUSDValue(
                    isRxdToToken ? tokenAmount : rxdAmount,
                    isRxdToToken ? selectedToken : RXD_TOKEN
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ... rest of the form code ... */}
        </div>
      </form>

      {/* ... rest of the component code ... */}
    </div>
  );
};