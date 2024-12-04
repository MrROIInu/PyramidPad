import { useEffect } from 'react';

interface ClipboardData {
  fromAmount: string;
  fromToken: string;
  toAmount: string;
  toToken: string;
  transactionId: string;
}

export const useClipboard = (callback: (data: ClipboardData) => void) => {
  useEffect(() => {
    const handleClipboardText = (text: string) => {
      const match = text.match(/🔁\s*Swap:\s*(\d+)\s*([A-Za-z0-9$]+)\s*➔\s*(\d+)\s*([A-Za-z0-9$]+)\s*📋([^\s🟦]+)/i);
      
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

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text) {
        handleClipboardText(text);
      }
    };

    const handleClipboardChange = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleClipboardText(text);
        }
      } catch (error) {
        // Ignore clipboard read errors
      }
    };

    document.addEventListener('paste', handlePaste);
    const interval = setInterval(handleClipboardChange, 1000);

    return () => {
      document.removeEventListener('paste', handlePaste);
      clearInterval(interval);
    };
  }, [callback]);
};