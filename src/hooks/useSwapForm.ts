import { useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { Token } from '../types';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { validatePriceDeviation } from '../lib/prices/priceValidation';

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

    try {
      setLoading(true);

      // Validate price deviation
      const { isValid, deviation } = await validatePriceDeviation(
        formState.fromToken.symbol,
        formState.toToken.symbol,
        fromAmount,
        toAmount
      );

      if (!isValid) {
        setError(`Price deviation of ${deviation.toFixed(2)}% exceeds maximum allowed (100%)`);
        return;
      }

      const orderData = {
        from_token: formState.fromToken.symbol,
        to_token: formState.toToken.symbol,
        from_amount: fromAmount,
        to_amount: toAmount,
        swap_tx: formState.transactionId,
        claimed: false,
        claim_count: 0,
        wallet_address: walletAddress,
        created_at: new Date().toISOString()
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