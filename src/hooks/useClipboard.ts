import { useEffect } from 'react';

export function useClipboard(callback: (text: string) => void) {
  useEffect(() => {
    const isValidSwapText = (text: string) => {
      return text.includes('🔁 Swap:') && 
             text.includes('➔') && 
             text.includes('📋');
    };

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && isValidSwapText(text)) {
        callback(text);
      }
    };

    const handleClipboardChange = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && isValidSwapText(text)) {
          callback(text);
        }
      } catch (error) {
        // Ignore clipboard read errors
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