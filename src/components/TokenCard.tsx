import React, { useState } from 'react';
import { Globe, Twitter, MessageCircle, Send } from 'lucide-react';
import { Token } from '../types';
import { formatPriceUSD } from '../lib/tokenPrices';
import { getMiningData } from '../lib/tokenData';
import { useRealtimePrices } from '../hooks/useRealtimePrices';

interface TokenCardProps {
  token: Token;
}

const SocialLink: React.FC<{ href: string | undefined; icon: React.ElementType }> = ({ href, icon: Icon }) => {
  const baseClasses = "p-2 rounded-lg transition-colors";
  const activeClasses = "bg-black/30 hover:bg-black/40 text-yellow-600";
  const inactiveClasses = "bg-black/10 cursor-not-allowed text-yellow-600/30";
  
  if (!href) {
    return (
      <div className={`${baseClasses} ${inactiveClasses}`}>
        <Icon size={20} />
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${activeClasses}`}
    >
      <Icon size={20} />
    </a>
  );
};

export const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  const [copied, setCopied] = useState(false);
  const prices = useRealtimePrices();
  const miningData = getMiningData(token.symbol);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={token.imageUrl} 
          alt={token.symbol} 
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="text-xl font-bold">{token.name}</h3>
          <p className="text-yellow-600">{token.symbol}</p>
        </div>
      </div>

      {token.description && (
        <p className="text-yellow-600/80 mb-4 line-clamp-2">{token.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-yellow-600/80 text-sm">Price</p>
          <p className="font-mono">{formatPriceUSD(prices[token.symbol] || 0)}</p>
        </div>
        <div>
          <p className="text-yellow-600/80 text-sm">Total Supply</p>
          <p className="font-mono">{token.totalSupply.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-yellow-600/80 text-sm">Preminted</p>
          <p className="font-mono">{miningData.premintedAmount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-yellow-600/80 text-sm">Minted</p>
          <div className="flex items-center gap-2">
            <div className="flex-grow h-2 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 to-amber-800"
                style={{ width: `${miningData.minted}%` }}
              />
            </div>
            <span className="text-sm">{miningData.minted}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <SocialLink href={token.social?.website} icon={Globe} />
          <SocialLink href={token.social?.x} icon={Twitter} />
          <SocialLink href={token.social?.discord} icon={MessageCircle} />
          <SocialLink href={token.social?.telegram} icon={Send} />
        </div>
      </div>

      <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3">
        <code className="text-sm flex-1 break-all">{token.contractAddress}</code>
        <button
          onClick={handleCopy}
          className={`px-3 py-1 rounded text-sm ${
            copied
              ? 'bg-green-500/20 text-green-500'
              : 'bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};