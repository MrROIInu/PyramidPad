import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Token } from '../types';
import { DEFAULT_TOKEN } from '../data/tokens';

interface SwapFormState {
  selectedToken: Token;
  isRxdToToken: boolean;
  rxdAmount: string;
  tokenAmount: string;
  transactionId: string;
  importedTx: string;
}

const initialState: SwapFormState = {
  selectedToken: DEFAULT_TOKEN,
  isRxdToToken: true,
  rxdAmount: '',
  tokenAmount: '',
  transactionId: '',
  importedTx: ''
};

export const useSwapForm = () => {
  const [formState, setFormState] = useState<SwapFormState>(initialState);

  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.rxdAmount || !formState.tokenAmount || !formState.transactionId) {
      return;
    }

    try {
      const orderData = {
        from_token: formState.isRxdToToken ? 'RXD' : formState.selectedToken.symbol,
        to_token: formState.isRxdToToken ? formState.selectedToken.symbol : 'RXD',
        from_amount: parseFloat(formState.isRxdToToken ? formState.rxdAmount : formState.tokenAmount),
        to_amount: parseFloat(formState.isRxdToToken ? formState.tokenAmount : formState.rxdAmount),
        swap_tx: formState.transactionId,
        claimed: false,
        claim_count: 0,
        status: 'active'
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const updateFormState = useCallback((updates: Partial<SwapFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    formState,
    updateFormState,
    handleSubmit,
    resetForm
  };
};