import React, { createContext, useContext, useState, useCallback } from 'react';
import { Token } from '../types';
import { DEFAULT_TOKEN } from '../data/tokens';

interface SwapContextType {
  selectedToken: Token;
  updateSelectedToken: (token: Token) => void;
}

const SwapContext = createContext<SwapContextType>({
  selectedToken: DEFAULT_TOKEN,
  updateSelectedToken: () => {}
});

export const useSwapContext = () => useContext(SwapContext);

export const SwapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedToken, setSelectedToken] = useState<Token>(DEFAULT_TOKEN);

  const updateSelectedToken = useCallback((token: Token) => {
    setSelectedToken(token);
  }, []);

  return (
    <SwapContext.Provider value={{ selectedToken, updateSelectedToken }}>
      {children}
    </SwapContext.Provider>
  );
};