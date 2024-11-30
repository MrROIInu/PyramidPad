import { useState, useCallback } from 'react';
import { isWalletAllowed, FEE_WALLET } from '../lib/walletManager';

export const useWalletManager = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletChecked, setIsWalletChecked] = useState(false);
  const [isWalletValid, setIsWalletValid] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleWalletChange = useCallback((address: string) => {
    setWalletAddress(address);
    setIsWalletChecked(false);
  }, []);

  const checkWallet = useCallback(async () => {
    if (!walletAddress) return false;
    const isAllowed = await isWalletAllowed(walletAddress);
    setIsWalletChecked(true);
    setIsWalletValid(isAllowed);
    return isAllowed;
  }, [walletAddress]);

  const copyFeeWallet = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(FEE_WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy fee wallet address:', error);
    }
  }, []);

  return {
    walletAddress,
    isWalletChecked,
    isWalletValid,
    copied,
    handleWalletChange,
    checkWallet,
    copyFeeWallet
  };
};