import { useEffect } from 'react';

const SWAP_REGEX = /🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([^\s🟦]+)/;

export function useClipboard(callback: (text: string) => void) {
  useEffect(() => {
    const handleClipboardChange = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (SWAP_REGEX.test(text)) {
          callback(text);
        }
      } catch (error) {
        // Ignore clipboard read errors
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && SWAP_REGEX.test(text)) {
        callback(text);
      }
    };

    // Listen for paste events
    document.addEventListener('paste', handlePaste);

    // Poll clipboard for changes
    const interval = setInterval(handleClipboardChange, 1000);

    return () => {
      document.removeEventListener('paste', handlePaste);
      clearInterval(interval);
    };
  }, [callback]);
}