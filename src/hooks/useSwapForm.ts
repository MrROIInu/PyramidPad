import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Token } from '../types';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';

interface SwapFormState {
  selectedToken: Token;
  isRxdToToken: boolean;
  rxdAmount: string;
  tokenAmount: string;
  transactionId: string;
  importedTx: string;
}

const initialState: SwapFormState = {
  selectedToken: TOKENS[0],
  isRxdToToken: true,
  rxdAmount: '',
  tokenAmount: '',
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

  const handleClipboardData = useCallback((data: { 
    fromAmount: string;
    fromToken: string;
    toAmount: string;
    toToken: string;
    transactionId: string;
  }) => {
    const { fromToken, toToken } = data;
    const isRxdFrom = fromToken === 'RXD';
    const targetToken = isRxdFrom ? toToken : fromToken;
    const selectedToken = TOKENS.find(t => t.symbol.toUpperCase() === targetToken.toUpperCase()) || RXD_TOKEN;

    setFormState(prev => ({
      ...prev,
      selectedToken,
      isRxdToToken: isRxdFrom,
      rxdAmount: isRxdFrom ? data.fromAmount : data.toAmount,
      tokenAmount: isRxdFrom ? data.toAmount : data.fromAmount,
      transactionId: data.transactionId,
      importedTx: `🔁 Swap: ${data.fromAmount} ${data.fromToken} ➔ ${data.toAmount} ${data.toToken} 📋${data.transactionId}🟦`
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent, walletAddress: string) => {
    e.preventDefault();
    setError(null);
    
    if (!formState.rxdAmount || !formState.tokenAmount || !formState.transactionId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        from_token: formState.isRxdToToken ? 'RXD' : formState.selectedToken.symbol,
        to_token: formState.isRxdToToken ? formState.selectedToken.symbol : 'RXD',
        from_amount: parseFloat(formState.isRxdToToken ? formState.rxdAmount : formState.tokenAmount),
        to_amount: parseFloat(formState.isRxdToToken ? formState.tokenAmount : formState.rxdAmount),
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
    handleClipboardData
  };
};