import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface TokenAmountInputProps {
  amount: string;
  token: {
    symbol: string;
    imageUrl: string;
  };
  onChange: (value: string) => void;
  usdValue: string;
  disabled?: boolean;
  readOnly?: boolean;
  showSlider?: boolean;
}

export const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  amount,
  token,
  onChange,
  usdValue,
  disabled = false,
  readOnly = false,
  showSlider = false
}) => {
  const currentValue = parseInt(amount) || 0;

  const handleIncrease = () => {
    onChange((currentValue + 1).toString());
  };

  const handleDecrease = () => {
    if (currentValue > 1) {
      onChange((currentValue - 1).toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    
    const value = e.target.value;
    // Only allow positive integers
    if (/^\d*$/.test(value)) {
      const numValue = parseInt(value) || 0;
      if (numValue >= 1 || value === '') {
        onChange(value);
      }
    }
  };

  const handleSliderChange = (value: number) => {
    onChange(value.toString());
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg">
        <div className="flex items-center gap-2 flex-1 px-4 py-2">
          <img
            src={token.imageUrl}
            alt={token.symbol}
            className="w-6 h-6 rounded-full"
          />
          <input
            type="text"
            value={amount}
            onChange={handleChange}
            className="flex-1 bg-transparent focus:outline-none disabled:opacity-50"
            placeholder="Enter amount"
            required
            disabled={disabled}
            readOnly={readOnly}
          />
          <span className="text-yellow-600/80">{token.symbol}</span>
        </div>
        {!readOnly && (
          <div className="flex flex-col border-l border-yellow-600/30">
            <button
              type="button"
              onClick={handleIncrease}
              disabled={disabled}
              className="px-2 py-1 hover:bg-yellow-600/20 transition-colors disabled:opacity-50"
            >
              <ChevronUp size={20} />
            </button>
            <button
              type="button"
              onClick={handleDecrease}
              disabled={disabled || !amount || parseInt(amount) <= 1}
              className="px-2 py-1 hover:bg-yellow-600/20 transition-colors disabled:opacity-50 border-t border-yellow-600/30"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        )}
      </div>
      {showSlider && currentValue > 0 && (
        <div className="px-2 py-3">
          <Slider
            min={Math.max(1, currentValue - 100)}
            max={currentValue + 100}
            value={currentValue}
            onChange={handleSliderChange}
            railStyle={{ backgroundColor: 'rgba(202, 138, 4, 0.2)' }}
            trackStyle={{ backgroundColor: 'rgb(202, 138, 4)' }}
            handleStyle={{
              borderColor: 'rgb(202, 138, 4)',
              backgroundColor: 'rgb(202, 138, 4)'
            }}
          />
        </div>
      )}
      <div className="text-sm text-yellow-600/80 px-2">
        ≈ {usdValue}
      </div>
    </div>
  );
};