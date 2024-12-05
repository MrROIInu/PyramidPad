import { useState, useCallback, useEffect } from 'react';
import { TOKENS } from '../data/tokens';

interface TransactionData {
  fromAmount: string;
  fromToken: string;
  toAmount: string;
  toToken: string;
  transactionId: string;
}

export const useTransactionImport = (onImport: (data: TransactionData) => void) => {
  const [importedText, setImportedText] = useState('');

  const parseTransaction = useCallback((text: string): TransactionData | null => {
    const match = text.match(/🔁\s*Swap:\s*(\d+)\s*([A-Z]+)\s*➔\s*(\d+)\s*([A-Z]+)\s*📋([^\s🟦]+)/i);
    if (!match) return null;

    const [, fromAmount, fromToken, toAmount, toToken, tx] = match;
    
    // Validate tokens exist
    const isFromTokenValid = fromToken === 'RXD' || TOKENS.some(t => t.symbol === fromToken);
    const isToTokenValid = toToken === 'RXD' || TOKENS.some(t => t.symbol === toToken);
    
    if (!isFromTokenValid || !isToTokenValid) return null;

    return {
      fromAmount,
      fromToken,
      toAmount,
      toToken,
      transactionId: tx
    };
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text');
    if (text) {
      setImportedText(text);
      const data = parseTransaction(text);
      if (data) {
        onImport(data);
      }
    }
  }, [parseTransaction, onImport]);

  const handleChange = useCallback((text: string) => {
    setImportedText(text);
    const data = parseTransaction(text);
    if (data) {
      onImport(data);
    }
  }, [parseTransaction, onImport]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return {
    importedText,
    handleChange
  };
};