import { useEffect } from 'react';

interface ClipboardData {
  fromAmount: string;
  fromToken: string;
  toAmount: string;
  toToken: string;
  transactionId: string;
}

export const useClipboard = (onClipboardData: (data: ClipboardData) => void) => {
  useEffect(() => {
    const handleClipboardText = (text: string) => {
      // Match the exact format with emojis and arrows
      const match = text.match(/🔁\s*Swap:\s*(\d+)\s*([A-Z]+)\s*➔\s*(\d+)\s*([A-Z]+)\s*📋([^\s🟦]+)/);
      
      if (match) {
        const [, fromAmount, fromToken, toAmount, toToken, tx] = match;
        onClipboardData({
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

    // Listen for paste events
    document.addEventListener('paste', handlePaste);

    // Also check clipboard periodically
    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        handleClipboardText(text);
      } catch (error) {
        // Ignore clipboard read errors
      }
    };

    const interval = setInterval(checkClipboard, 1000);

    return () => {
      document.removeEventListener('paste', handlePaste);
      clearInterval(interval);
    };
  }, [onClipboardData]);
};