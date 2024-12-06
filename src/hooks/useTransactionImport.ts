import { useState, useCallback, useEffect } from 'react';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { Token } from '../types';

interface TransactionData {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  transactionId: string;
}

const TRANSACTION_REGEX = /🔁\s*Swap:\s*(\d+)\s*([A-Z0-9$]+)\s*➔\s*(\d+)\s*([A-Z0-9$]+)\s*📋([^\s🟦]+)/i;

export const useTransactionImport = (onImport: (data: TransactionData) => void) => {
  const [importedText, setImportedText] = useState('');

  const findToken = useCallback((symbol: string): Token | null => {
    if (!symbol) return null;
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol === 'RXD') return RXD_TOKEN;
    return TOKENS.find(t => t.symbol.toUpperCase() === upperSymbol) || null;
  }, []);

  const parseTransaction = useCallback((text: string): TransactionData | null => {
    const match = text.match(TRANSACTION_REGEX);
    if (!match) return null;

    const [, fromAmount, fromTokenSymbol, toAmount, toTokenSymbol, tx] = match;
    
    const fromToken = findToken(fromTokenSymbol);
    const toToken = findToken(toTokenSymbol);
    
    if (!fromToken || !toToken) return null;

    return {
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      transactionId: tx
    };
  }, [findToken]);

  const handleImport = useCallback((text: string) => {
    setImportedText(text);
    const data = parseTransaction(text);
    if (data) {
      onImport(data);
    }
  }, [parseTransaction, onImport]);

  // Handle clipboard paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text) {
        handleImport(text);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handleImport]);

  // Handle manual text input
  const handleChange = useCallback((text: string) => {
    handleImport(text);
  }, [handleImport]);

  return {
    importedText,
    handleChange
  };
};