import { useEffect, useCallback } from 'react';

export function useClipboard(callback: (text: string) => void) {
  const handleClipboardChange = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.includes('🔁 Swap:')) {
        callback(text.trim());
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'NotAllowedError') {
        console.error('Failed to read clipboard:', error);
      }
    }
  }, [callback]);

  useEffect(() => {
    // Check clipboard when component mounts
    handleClipboardChange();

    // Add paste event listener to document
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && text.includes('🔁 Swap:')) {
        callback(text.trim());
      }
    };

    document.addEventListener('paste', handlePaste);
    document.addEventListener('focus', handleClipboardChange);

    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('focus', handleClipboardChange);
    };
  }, [callback, handleClipboardChange]);
}