import React, { useCallback, useEffect } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { TokenSelect } from './TokenSelect';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { useSwapForm } from '../hooks/useSwapForm';
import { useSwapContext } from '../contexts/SwapContext';
import { formatPriceUSD } from '../lib/tokenPrices';
import { useWalletManager } from '../hooks/useWalletManager';
import { WalletAddressInput } from './wallet/WalletAddressInput';
import { TokenAmountInput } from './TokenAmountInput';
import { useTransactionImport } from '../hooks/useTransactionImport';
import { useMarketPrice } from '../hooks/useMarketPrice';

interface SwapFormProps {
  onOrderCreated: () => Promise<void>;
}

export const SwapForm: React.FC<SwapFormProps> = ({ onOrderCreated }) => {
  const { selectedToken: contextSelectedToken } = useSwapContext();
  const {
    walletAddress,
    isWalletChecked,
    isWalletValid,
    copied,
    isLoading,
    handleWalletChange,
    checkWallet,
    copyFeeWallet
  } = useWalletManager(true);
  
  const {
    formState,
    loading,
    error,
    updateFormState,
    handleSubmit: originalHandleSubmit,
  } = useSwapForm(onOrderCreated);

  const {
    selectedToken,
    isRxdToToken,
    rxdAmount,
    tokenAmount,
    transactionId,
    importedTx
  } = formState;

  // Handle transaction import
  const handleTransactionImport = useCallback((data: any) => {
    const isRxdFrom = data.fromToken === 'RXD';
    const selectedTokenSymbol = isRxdFrom ? data.toToken : data.fromToken;
    const token = TOKENS.find(t => t.symbol === selectedTokenSymbol);
    
    if (token) {
      updateFormState({
        selectedToken: token,
        isRxdToToken: isRxdFrom,
        rxdAmount: isRxdFrom ? data.fromAmount : data.toAmount,
        tokenAmount: isRxdFrom ? data.toAmount : data.fromAmount,
        transactionId: data.transactionId,
        importedTx: `🔁 Swap: ${data.fromAmount} ${data.fromToken} ➔ ${data.toAmount} ${data.toToken} 📋${data.transactionId}🟦`
      });
    }
  }, [updateFormState]);

  const { parseTransaction } = useTransactionImport(handleTransactionImport);

  // Calculate market price and deviation
  const { marketPrice, deviation, isMarketPrice, deviationClass } = useMarketPrice(
    isRxdToToken ? 'RXD' : selectedToken.symbol,
    isRxdToToken ? selectedToken.symbol : 'RXD',
    isRxdToToken ? rxdAmount : tokenAmount,
    isRxdToToken ? tokenAmount : rxdAmount
  );

  // Update form when context token changes
  useEffect(() => {
    if (contextSelectedToken.symbol !== selectedToken.symbol) {
      updateFormState({ 
        selectedToken: contextSelectedToken,
        tokenAmount: rxdAmount ? '1000' : '',
        rxdAmount: tokenAmount ? '1' : ''
      });
    }
  }, [contextSelectedToken, selectedToken.symbol, rxdAmount, tokenAmount]);

  // Handle RXD amount change
  const handleRxdAmountChange = useCallback((value: string) => {
    updateFormState({ 
      rxdAmount: value,
      tokenAmount: value ? (parseInt(value) * 1000).toString() : ''
    });
  }, [updateFormState]);

  // Handle token amount change
  const handleTokenAmountChange = useCallback((value: string) => {
    updateFormState({ 
      tokenAmount: value,
      rxdAmount: value ? Math.ceil(parseInt(value) / 1000).toString() : ''
    });
  }, [updateFormState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletChecked || !isWalletValid) {
      await checkWallet();
      return;
    }
    await originalHandleSubmit(e, walletAddress);
  };

  const handleImportedTxChange = (text: string) => {
    updateFormState({ importedTx: text });
    const data = parseTransaction(text);
    if (data) {
      handleTransactionImport(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-12">
      <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <WalletAddressInput
          walletAddress={walletAddress}
          isWalletChecked={isWalletChecked}
          isWalletValid={isWalletValid}
          copied={copied}
          isLoading={isLoading}
          onWalletChange={handleWalletChange}
          onCopyFeeWallet={copyFeeWallet}
        />

        <div className="mb-6">
          <label className="block text-yellow-600 mb-2">Select Token</label>
          <TokenSelect
            tokens={TOKENS.filter(t => t.symbol !== 'RXD')}
            selectedToken={selectedToken}
            onChange={(token) => updateFormState({ selectedToken: token })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-yellow-600 mb-2">
              {isRxdToToken ? 'RXD Amount' : `${selectedToken.symbol} Amount`}
            </label>
            <TokenAmountInput
              amount={isRxdToToken ? rxdAmount : tokenAmount}
              token={isRxdToToken ? RXD_TOKEN : selectedToken}
              onChange={isRxdToToken ? handleRxdAmountChange : handleTokenAmountChange}
              usdValue={formatPriceUSD(
                parseFloat(isRxdToToken ? rxdAmount : tokenAmount) * 
                (isRxdToToken ? 0.000894 : 0.000894 * 0.001)
              )}
              showSlider={true}
            />
          </div>

          <div>
            <label className="block text-yellow-600 mb-2">You Will Receive</label>
            <TokenAmountInput
              amount={isRxdToToken ? tokenAmount : rxdAmount}
              token={isRxdToToken ? selectedToken : RXD_TOKEN}
              onChange={isRxdToToken ? handleTokenAmountChange : handleRxdAmountChange}
              usdValue={formatPriceUSD(
                parseFloat(isRxdToToken ? tokenAmount : rxdAmount) * 
                (isRxdToToken ? 0.000894 * 0.001 : 0.000894)
              )}
              showSlider={true}
            />
          </div>
        </div>

        {rxdAmount && tokenAmount && (
          <div className={`text-center mb-6 ${deviationClass}`}>
            {isMarketPrice ? (
              'Trading at market price'
            ) : (
              `Trading ${deviation > 0 ? 'above' : 'below'} market price by ${Math.abs(deviation).toFixed(2)}%`
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => updateFormState({ isRxdToToken: !isRxdToToken })}
          className="w-full flex items-center justify-center gap-2 bg-yellow-600/20 text-yellow-600 rounded-lg px-6 py-3 font-semibold hover:bg-yellow-600/30 transition-all mb-6"
        >
          <ArrowUpDown size={20} />
          Switch Direction
        </button>

        <div className="mb-6">
          <label className="block text-yellow-600 mb-2">
            Import Transaction text from Photonic Wallet P2PSwap:
          </label>
          <textarea
            value={importedTx}
            onChange={(e) => handleImportedTxChange(e.target.value)}
            className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600 mb-2"
            placeholder="Example: 🔁 Swap: 1000 RXD ➔ 1000 DOGE 📋01000000015c🟦"
            rows={3}
            style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label className="block text-yellow-600 mb-2">TX for Photonic Wallet:</label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => updateFormState({ transactionId: e.target.value })}
            className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
            placeholder="If using only TX put it here"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isWalletChecked || !isWalletValid}
          className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Order...
            </>
          ) : (
            'Create Swap Order'
          )}
        </button>
      </div>
    </form>
  );
};