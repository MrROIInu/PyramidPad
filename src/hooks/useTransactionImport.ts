import { useCallback } from 'react';
import { TOKENS } from '../data/tokens';

const SWAP_REGEX = /🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([^\s🟦]+)/;

interface TransactionData {
  fromAmount: string;
  fromToken: string;
  toAmount: string;
  toToken: string;
  transactionId: string;
}

export const useTransactionImport = (onImport: (data: TransactionData) => void) => {
  const parseTransaction = useCallback((text: string) => {
    const match = text.match(SWAP_REGEX);
    if (!match) return;

    const [, amount1, token1, amount2, token2, tx] = match;
    
    // Validate tokens exist
    const isToken1Valid = token1 === 'RXD' || TOKENS.some(t => t.symbol === token1);
    const isToken2Valid = token2 === 'RXD' || TOKENS.some(t => t.symbol === token2);
    
    if (!isToken1Valid || !isToken2Valid) return;

    const data = {
      fromAmount: amount1,
      fromToken: token1,
      toAmount: amount2,
      toToken: token2,
      transactionId: tx
    };

    onImport(data);
  }, [onImport]);

  return { parseTransaction };
};