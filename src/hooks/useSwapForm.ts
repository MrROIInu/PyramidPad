import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Token } from '../types';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { validatePriceDeviation } from '../lib/prices/priceManager';

interface SwapFormState {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  transactionId: string;
}

export const useSwapForm = (onOrderCreated: () => Promise<void>) => {
  const [formState, setFormState] = useState<SwapFormState>({
    fromToken: RXD_TOKEN,
    toToken: TOKENS[0],
    fromAmount: '',
    toAmount: '',
    transactionId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent, walletAddress: string) => {
    e.preventDefault();
    setError(null);
    
    const fromAmount = parseFloat(formState.fromAmount);
    const toAmount = parseFloat(formState.toAmount);

    if (!fromAmount || !toAmount || !formState.transactionId) {
      setError('Please fill in all required fields');
      return;
    }

    // Get current prices
    const { data: prices } = await supabase
      .from('tokens')
      .select('symbol, price_usd')
      .in('symbol', [formState.fromToken.symbol, formState.toToken.symbol]);

    if (!prices?.length) {
      setError('Unable to validate prices. Please try again.');
      return;
    }

    const fromPrice = prices.find(p => p.symbol === formState.fromToken.symbol)?.price_usd || 0;
    const toPrice = prices.find(p => p.symbol === formState.toToken.symbol)?.price_usd || 0;

    if (!fromPrice || !toPrice) {
      setError('Token prices not available. Please try again.');
      return;
    }

    if (!validatePriceDeviation(fromAmount, toAmount, fromPrice, toPrice)) {
      setError('Price deviation exceeds 100%. Please adjust your order.');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        from_token: formState.fromToken.symbol,
        to_token: formState.toToken.symbol,
        from_amount: fromAmount,
        to_amount: toAmount,
        swap_tx: formState.transactionId,
        claimed: false,
        claim_count: 0,
        status: 'active',
        wallet_address: walletAddress
      };

      const { error: supabaseError } = await supabase
        .from('orders')
        .insert([orderData]);

      if (supabaseError) throw supabaseError;

      await onOrderCreated();
      resetForm();
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormState({
      fromToken: RXD_TOKEN,
      toToken: TOKENS[0],
      fromAmount: '',
      toAmount: '',
      transactionId: ''
    });
    setError(null);
  }, []);

  const switchTokens = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount
    }));
  }, []);

  const updateFormState = useCallback((updates: Partial<SwapFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  return {
    formState,
    loading,
    error,
    updateFormState,
    handleSubmit,
    resetForm,
    switchTokens
  };
};