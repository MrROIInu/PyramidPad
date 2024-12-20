import React, { useState, useRef, useEffect } from 'react';
import { Token } from '../types';
import { RXD_TOKEN } from '../constants/tokens';

interface TokenSelectProps {
  tokens: Token[];
  selectedToken: Token;
  onChange: (token: Token) => void;
  defaultToken?: Token;
  isFromToken?: boolean;
  className?: string;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({
  tokens,
  selectedToken,
  onChange,
  defaultToken,
  isFromToken = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set default token on mount
    if (!selectedToken) {
      onChange(isFromToken ? RXD_TOKEN : defaultToken || tokens[0]);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sort tokens: RXD first (if from token), then RADCAT, then others alphabetically
  const sortedTokens = [...tokens].sort((a, b) => {
    if (isFromToken) {
      if (a.symbol === 'RXD') return -1;
      if (b.symbol === 'RXD') return 1;
    }
    if (a.symbol === 'RADCAT') return -1;
    if (b.symbol === 'RADCAT') return 1;
    return a.symbol.localeCompare(b.symbol);
  });

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 cursor-pointer"
      >
        <img
          src={selectedToken?.imageUrl}
          alt={selectedToken?.symbol}
          className="w-6 h-6 rounded-full"
        />
        <span className="flex-1 text-left">{selectedToken?.symbol}</span>
        <svg
          className={`w-4 h-4 text-yellow-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-64 mt-2 bg-black/95 border border-yellow-600/30 rounded-lg shadow-xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {sortedTokens.map(token => (
              <button
                key={token.symbol}
                type="button"
                onClick={() => {
                  onChange(token);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-yellow-600/10 transition-colors ${
                  token.symbol === selectedToken?.symbol ? 'bg-yellow-600/20' : ''
                }`}
              >
                <img
                  src={token.imageUrl}
                  alt={token.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <div className="text-left flex-1">
                  <div className="text-white font-medium">{token.symbol}</div>
                  <div className="text-yellow-600/80 text-sm">{token.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};