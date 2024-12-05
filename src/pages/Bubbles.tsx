import React, { useEffect, useRef } from 'react';
import { TOKENS } from '../data/tokens';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { useNavigate } from 'react-router-dom';

export const Bubbles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { priceChanges } = usePriceHistory();

  // Filter out RXD and sort by price change
  const sortedTokens = TOKENS
    .filter(token => token.symbol !== 'RXD')
    .sort((a, b) => {
      const changeA = Math.abs(priceChanges[a.symbol] || 0);
      const changeB = Math.abs(priceChanges[b.symbol] || 0);
      return changeB - changeA;
    });

  const handleBubbleClick = (symbol: string) => {
    navigate(`/tokens?highlight=${symbol}`);
  };

  const getBubbleSize = (change: number) => {
    const absChange = Math.abs(change);
    const minSize = 80;
    const maxSize = 200;
    return minSize + (absChange / 100) * (maxSize - minSize);
  };

  const getBubbleColor = (change: number) => {
    if (change > 0) {
      const intensity = Math.min(change / 100, 1);
      return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`; // green-500
    } else {
      const intensity = Math.min(Math.abs(change) / 100, 1);
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`; // red-500
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateBubblePositions = () => {
      const bubbles = container.getElementsByClassName('bubble') as HTMLCollectionOf<HTMLElement>;
      const containerRect = container.getBoundingClientRect();
      
      Array.from(bubbles).forEach((bubble) => {
        const size = parseFloat(bubble.style.width);
        const maxX = containerRect.width - size;
        const maxY = containerRect.height - size;
        
        bubble.style.left = `${Math.random() * maxX}px`;
        bubble.style.top = `${Math.random() * maxY}px`;
      });
    };

    updateBubblePositions();
    window.addEventListener('resize', updateBubblePositions);

    return () => window.removeEventListener('resize', updateBubblePositions);
  }, [sortedTokens]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8">
        Token Bubbles
      </h1>

      <div 
        ref={containerRef}
        className="relative w-full h-[800px] bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl backdrop-blur-sm overflow-hidden"
      >
        {sortedTokens.map((token) => {
          const change = priceChanges[token.symbol] || 0;
          const size = getBubbleSize(change);
          const color = getBubbleColor(change);

          return (
            <div
              key={token.symbol}
              className="bubble absolute transition-all duration-1000 ease-in-out cursor-pointer hover:scale-110"
              style={{
                width: `${size}px`,
                height: `${size}px`
              }}
              onClick={() => handleBubbleClick(token.symbol)}
            >
              <div 
                className="w-full h-full rounded-full flex flex-col items-center justify-center p-2 text-center"
                style={{ backgroundColor: color }}
              >
                <img 
                  src={token.imageUrl} 
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full mb-1"
                />
                <span className="font-bold text-white">{token.symbol}</span>
                <span className={`text-sm font-bold ${change >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {change > 0 ? '+' : ''}{change.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};