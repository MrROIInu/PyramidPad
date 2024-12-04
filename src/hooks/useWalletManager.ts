import { useState, useCallback, useEffect } from 'react';
import { isWalletAllowed } from '../lib/walletManager';

export const useWalletManager = (autoCheck: boolean = false) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletChecked, setIsWalletChecked] = useState(false);
  const [isWalletValid, setIsWalletValid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkWallet = useCallback(async () => {
    if (!walletAddress) return false;
    
    setIsLoading(true);
    try {
      const isAllowed = await isWalletAllowed(walletAddress);
      setIsWalletChecked(true);
      setIsWalletValid(isAllowed);
      return isAllowed;
    } catch (error) {
      console.error('Error checking wallet:', error);
      setIsWalletChecked(true);
      setIsWalletValid(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const handleWalletChange = useCallback((address: string) => {
    setWalletAddress(address);
    setIsWalletChecked(false);
    setIsWalletValid(false);
  }, []);

  const copyFeeWallet = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('1LqoPnuUm3kdKvPJrELoe6JY3mJc9C7d1e');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy fee wallet address:', error);
    }
  }, []);

  useEffect(() => {
    if (autoCheck && walletAddress && !isWalletChecked) {
      checkWallet();
    }
  }, [autoCheck, walletAddress, isWalletChecked, checkWallet]);

  return {
    walletAddress,
    isWalletChecked,
    isWalletValid,
    copied,
    isLoading,
    handleWalletChange,
    checkWallet,
    copyFeeWallet
  };
};