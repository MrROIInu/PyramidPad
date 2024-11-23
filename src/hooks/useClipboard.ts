import { useEffect, useCallback } from 'react';

export function useClipboard(callback: (text: string) => void) {
  const handleClipboardText = useCallback((text: string) => {
    if (text && text.includes('🔁 Swap:')) {
      callback(text.trim());
    }
  }, [callback]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text) {
        handleClipboardText(text);
      }
    };

    const handleCopy = async () => {
      try {
        const text = await navigator.clipboard.readText();
        handleClipboardText(text);
      } catch (error) {
        console.error('Failed to read clipboard:', error);
      }
    };

    // Listen for paste events
    window.addEventListener('paste', handlePaste);
    
    // Listen for copy events
    document.addEventListener('copy', handleCopy);
    
    // Listen for clipboard changes
    navigator.clipboard?.addEventListener?.('clipboardchange', handleCopy);

    return () => {
      window.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
      navigator.clipboard?.removeEventListener?.('clipboardchange', handleCopy);
    };
  }, [handleClipboardText]);
}