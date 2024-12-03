import { useEffect } from 'react';

const SWAP_REGEX = /🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([^\s🟦]+)/;

interface ClipboardData {
  fromAmount: string;
  fromToken: string;
  toAmount: string;
  toToken: string;
  transactionId: string;
}

export function useClipboard(callback: (data: ClipboardData) => void) {
  useEffect(() => {
    const handleClipboardData = (text: string) => {
      const match = text.match(SWAP_REGEX);
      if (match) {
        const [, fromAmount, fromToken, toAmount, toToken, tx] = match;
        callback({
          fromAmount,
          fromToken,
          toAmount,
          toToken,
          transactionId: tx
        });
      }
    };

    const handleClipboardChange = async () => {
      try {
        const text = await navigator.clipboard.readText();
        handleClipboardData(text);
      } catch (error) {
        // Ignore clipboard read errors
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text) {
        handleClipboardData(text);
      }
    };

    document.addEventListener('paste', handlePaste);
    const interval = setInterval(handleClipboardChange, 1000);

    return () => {
      document.removeEventListener('paste', handlePaste);
      clearInterval(interval);
    };
  }, [callback]);
}