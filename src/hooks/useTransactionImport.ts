import { useEffect, useCallback } from 'react';
import { TOKENS } from '../data/tokens';

const SWAP_REGEX = /🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([^\s🟦]+)/;

interface TransactionData {
  fromAmount: string;
  fromToken: string;
  toAmount: string;
  toToken: string;
  transactionId: string;
}

export const useTransactionImport = (callback: (data: TransactionData) => void) => {
  const parseTransaction = useCallback((text: string): TransactionData | null => {
    const match = text.match(SWAP_REGEX);
    if (!match) return null;

    const [, amount1, token1, amount2, token2, tx] = match;
    
    // Validate tokens exist
    const isToken1Valid = token1 === 'RXD' || TOKENS.some(t => t.symbol === token1);
    const isToken2Valid = token2 === 'RXD' || TOKENS.some(t => t.symbol === token2);
    
    if (!isToken1Valid || !isToken2Valid) return null;

    return {
      fromAmount: amount1,
      fromToken: token1,
      toAmount: amount2,
      toToken: token2,
      transactionId: tx
    };
  }, []);

  const handleClipboardChange = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = parseTransaction(text);
      if (data) {
        callback(data);
      }
    } catch (error) {
      // Ignore clipboard read errors
    }
  }, [callback, parseTransaction]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text');
    if (text) {
      const data = parseTransaction(text);
      if (data) {
        callback(data);
      }
    }
  }, [callback, parseTransaction]);

  useEffect(() => {
    const pasteHandler = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener('paste', pasteHandler);
    
    // Poll clipboard for changes
    const interval = setInterval(handleClipboardChange, 1000);

    return () => {
      document.removeEventListener('paste', pasteHandler);
      clearInterval(interval);
    };
  }, [handlePaste, handleClipboardChange]);

  return { parseTransaction };
};