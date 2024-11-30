import { useState, useCallback } from 'react';

export const useTokenAmount = (initialAmount: string = '') => {
  const [amount, setAmount] = useState(initialAmount);

  const handleChange = useCallback((value: string) => {
    // Only allow positive integers
    if (/^\d*$/.test(value)) {
      const numValue = parseInt(value) || 0;
      if (numValue >= 1 || value === '') {
        setAmount(value);
      }
    }
  }, []);

  const increment = useCallback(() => {
    const currentValue = parseInt(amount) || 0;
    setAmount((currentValue + 1).toString());
  }, [amount]);

  const decrement = useCallback(() => {
    const currentValue = parseInt(amount) || 0;
    if (currentValue > 1) {
      setAmount((currentValue - 1).toString());
    }
  }, [amount]);

  return {
    amount,
    setAmount,
    handleChange,
    increment,
    decrement
  };
};