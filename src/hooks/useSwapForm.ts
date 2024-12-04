import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Token } from '../types';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';

interface SwapFormState {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  transactionId: string;
  importedTx: string;
}

const initialState: SwapFormState = {
  fromToken: TOKENS[0],
  toToken: RXD_TOKEN,
  fromAmount: '',
  toAmount: '',
  transactionId: '',
  importedTx: ''
};

export const useSwapForm = (onOrderCreated: () => Promise<void>) => {
  const [formState, setFormState] = useState<SwapFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setFormState(initialState);
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

  const handleClipboardData = useCallback((data: { 
    fromAmount: string;
    fromToken: string;
    toAmount: string;
    toToken: string;
    transactionId: string;
  }) => {
    const { fromToken: fromSymbol, toToken: toSymbol } = data;
    const fromToken = fromSymbol === 'RXD' ? RXD_TOKEN : 
      TOKENS.find(t => t.symbol === fromSymbol) || RXD_TOKEN;
    const toToken = toSymbol === 'RXD' ? RXD_TOKEN :
      TOKENS.find(t => t.symbol === toSymbol) || RXD_TOKEN;

    setFormState(prev => ({
      ...prev,
      fromToken,
      toToken,
      fromAmount: data.fromAmount,
      toAmount: data.toAmount,
      transactionId: data.transactionId,
      importedTx: `🔁 Swap: ${data.fromAmount} ${data.fromToken} ➔ ${data.toAmount} ${data.toToken} 📋${data.transactionId}🟦`
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent, walletAddress: string) => {
    e.preventDefault();
    setError(null);
    
    if (!formState.fromAmount || !formState.toAmount || !formState.transactionId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        from_token: formState.fromToken.symbol,
        to_token: formState.toToken.symbol,
        from_amount: parseFloat(formState.fromAmount),
        to_amount: parseFloat(formState.toAmount),
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
    handleClipboardData,
    switchTokens
  };
};