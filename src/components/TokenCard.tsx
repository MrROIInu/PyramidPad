import React from 'react';
import { Copy } from 'lucide-react';
import { Token } from '../types';
import { formatPriceUSD, calculateRXDRatio } from '../lib/tokenPrices';
import { getMiningData } from '../lib/tokenData';
import { SocialIcons } from './SocialIcons';
import { useRealtimePrices } from '../hooks/useRealtimePrices';

interface TokenCardProps {
  token: Token;
  onCopy: (address: string) => void;
  isCopied: boolean;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, onCopy, isCopied }) => {
  const prices = useRealtimePrices();
  const miningData = getMiningData(token.symbol);

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={token.imageUrl} 
            alt={token.symbol} 
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold">{token.symbol}</h3>
            <p className="text-yellow-600">{token.name}</p>
            <div className="mt-2">
              <SocialIcons 
                website={token.social?.website}
                x={token.social?.x}
                discord={token.social?.discord}
                telegram={token.social?.telegram}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {token.description && (
            <p className="text-sm text-yellow-600/80 mb-4">{token.description}</p>
          )}
          <p className="text-sm text-yellow-600/80 break-all mb-2">
            Contract Address: {token.contractAddress}
          </p>
          <button
            onClick={() => onCopy(token.contractAddress)}
            className="flex items-center gap-2 bg-yellow-600/20 text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-600/30 transition-colors"
          >
            <Copy size={16} />
            {isCopied ? 'Copied!' : 'Copy Address'}
          </button>
        </div>

        <div className="grid gap-2">
          <div>
            <p className="text-sm text-yellow-600/80">Total Supply</p>
            <p className="font-medium">{token.totalSupply.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-yellow-600/80">Price</p>
            <p className="font-medium">{formatPriceUSD(prices[token.symbol])}</p>
          </div>
          <div>
            <p className="text-sm text-yellow-600/80">RXD Ratio</p>
            <p className="font-medium">{calculateRXDRatio(prices[token.symbol], prices.RXD)}</p>
          </div>
          <div>
            <p className="text-sm text-yellow-600/80">Preminted</p>
            <p className="font-medium">{miningData.premintedAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-yellow-600/80">Minted</p>
            <div className="flex items-center gap-2">
              <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-amber-800"
                  style={{ width: `${miningData.minted}%` }}
                />
              </div>
              <span className="text-xs whitespace-nowrap">{miningData.minted}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-yellow-600/80">Difficulty</p>
            <p className="font-medium">{miningData.difficulty}</p>
          </div>
        </div>
      </div>
    </div>
  );
};