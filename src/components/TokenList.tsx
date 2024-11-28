import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { TOKEN_PRICES, formatPriceUSD, formatMarketCap } from '../lib/tokenPrices';
import { getMiningData } from '../lib/tokenData';
import { SocialIcons } from './SocialIcons';

export const TokenList: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Sort tokens to ensure RADCAT is first
  const sortedTokens = [...TOKENS]
    .filter(token => token.symbol !== 'RXD')
    .sort((a, b) => {
      if (a.symbol === 'RADCAT') return -1;
      if (b.symbol === 'RADCAT') return 1;
      return a.symbol.localeCompare(b.symbol);
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8">
        RXD20 Token List
      </h1>
      
      <div className="grid gap-4">
        {sortedTokens.map((token, index) => {
          const miningData = getMiningData(token.symbol);
          
          return (
            <div 
              key={token.symbol}
              className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm"
            >
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
                  <p className="text-sm text-yellow-600/80 break-all mb-2">
                    Contract Address: {token.contractAddress}
                  </p>
                  <button
                    onClick={() => handleCopy(token.contractAddress, index)}
                    className="flex items-center gap-2 bg-yellow-600/20 text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-600/30 transition-colors"
                  >
                    <Copy size={16} />
                    {copiedIndex === index ? 'Copied!' : 'Copy Address'}
                  </button>
                </div>

                <div className="grid gap-2">
                  <div>
                    <p className="text-sm text-yellow-600/80">Total Supply</p>
                    <p className="font-medium">{token.totalSupply.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600/80">Price</p>
                    <p className="font-medium">{formatPriceUSD(TOKEN_PRICES[token.symbol])}</p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600/80">Market Cap</p>
                    <p className="font-medium">{formatMarketCap(TOKEN_PRICES[token.symbol], token.totalSupply)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600/80">Mining Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-600 to-amber-800"
                          style={{ width: `${miningData.mined}%` }}
                        />
                      </div>
                      <span className="text-sm whitespace-nowrap">{miningData.mined}%</span>
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
        })}
      </div>
    </div>
  );
};