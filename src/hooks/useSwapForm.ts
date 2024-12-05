import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
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
  importedTx: string;
}

interface ClipboardData {
  fromAmount: string;
  fromToken: string;
  toAmount: string;
  toToken: string;
  transactionId: string;
}

const initialState: SwapFormState = {
  fromToken: RXD_TOKEN,
  toToken: TOKENS[0],
  fromAmount: '',
  toAmount: '',
  transactionId: '',
  importedTx: ''
};

export const useSwapForm = (onOrderCreated: () => Promise<void>) => {
  const [formState, setFormState] = useState<SwapFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findToken = useCallback((symbol: string | undefined): Token => {
    if (!symbol) return RXD_TOKEN;
    
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol === 'RXD') return RXD_TOKEN;
    
    const token = TOKENS.find(t => t.symbol.toUpperCase() === upperSymbol);
    if (!token) {
      console.warn(`Token not found: ${symbol}`);
      return RXD_TOKEN;
    }
    return token;
  }, []);

  const handleClipboardData = useCallback((data: ClipboardData) => {
    const fromToken = findToken(data.fromToken);
    const toToken = findToken(data.toToken);

    setFormState(prev => ({
      ...prev,
      fromToken,
      toToken,
      fromAmount: data.fromAmount || '',
      toAmount: data.toAmount || '',
      transactionId: data.transactionId || '',
      importedTx: data.transactionId ? 
        `🔁 Swap: ${data.fromAmount} ${data.fromToken} ➔ ${data.toAmount} ${data.toToken} 📋${data.transactionId}🟦` : 
        ''
    }));
  }, [findToken]);

  const handleSubmit = async (e: React.FormEvent, walletAddress: string) => {
    e.preventDefault();
    setError(null);
    
    if (!formState.fromAmount || !formState.toAmount || !formState.transactionId) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate price deviation
    const { isValid, deviation } = validatePriceDeviation(
      formState.fromToken.symbol,
      formState.toToken.symbol,
      parseFloat(formState.fromAmount),
      parseFloat(formState.toAmount)
    );

    if (!isValid) {
      setError(`Price deviation of ${Math.abs(deviation).toFixed(2)}% exceeds the maximum allowed (300%). Please adjust your order.`);
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
    switchTokens,
    handleClipboardData
  };
};