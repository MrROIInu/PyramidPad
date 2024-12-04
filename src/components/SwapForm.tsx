import React, { useCallback } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { TokenSelect } from './TokenSelect';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { useSwapForm } from '../hooks/useSwapForm';
import { formatPriceUSD } from '../lib/tokenPrices';
import { useWalletManager } from '../hooks/useWalletManager';
import { WalletAddressInput } from './wallet/WalletAddressInput';
import { TokenAmountInput } from './TokenAmountInput';
import { useClipboard } from '../hooks/useClipboard';
import { useMarketPrice } from '../hooks/useMarketPrice';
import { useRealtimePrices } from '../hooks/useRealtimePrices';

interface SwapFormProps {
  onOrderCreated: () => Promise<void>;
}

export const SwapForm: React.FC<SwapFormProps> = ({ onOrderCreated }) => {
  const prices = useRealtimePrices();
  
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
    handleClipboardData,
    switchTokens
  } = useSwapForm(onOrderCreated);

  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    transactionId,
    importedTx
  } = formState;

  // Calculate USD values
  const calculateUSDValue = useCallback((amount: string, symbol: string) => {
    const numAmount = parseFloat(amount) || 0;
    const price = prices[symbol] || 0;
    return formatPriceUSD(numAmount * price);
  }, [prices]);

  // Use clipboard hook
  useClipboard(handleClipboardData);

  // Calculate market price and deviation
  const { deviation, isMarketPrice, deviationClass } = useMarketPrice(
    fromToken.symbol,
    toToken.symbol,
    fromAmount,
    toAmount
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletChecked || !isWalletValid) {
      await checkWallet();
      return;
    }
    await originalHandleSubmit(e, walletAddress);
  };

  // Get all available tokens including RXD
  const allTokens = [RXD_TOKEN, ...TOKENS];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-yellow-600 mb-2">From</label>
            <TokenSelect
              tokens={allTokens}
              selectedToken={fromToken}
              onChange={(token) => updateFormState({ fromToken: token })}
              defaultToken={RXD_TOKEN}
            />
          </div>

          <div>
            <label className="block text-yellow-600 mb-2">To</label>
            <TokenSelect
              tokens={allTokens}
              selectedToken={toToken}
              onChange={(token) => updateFormState({ toToken: token })}
              defaultToken={TOKENS[0]} // RADCAT
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-yellow-600 mb-2">Amount</label>
            <TokenAmountInput
              amount={fromAmount}
              token={fromToken}
              onChange={(value) => updateFormState({ fromAmount: value })}
              usdValue={calculateUSDValue(fromAmount, fromToken.symbol)}
              showSlider={true}
            />
          </div>

          <div>
            <label className="block text-yellow-600 mb-2">You Will Receive</label>
            <TokenAmountInput
              amount={toAmount}
              token={toToken}
              onChange={(value) => updateFormState({ toAmount: value })}
              usdValue={calculateUSDValue(toAmount, toToken.symbol)}
              showSlider={true}
            />
          </div>
        </div>

        {fromAmount && toAmount && (
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
          onClick={switchTokens}
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
            onChange={(e) => {
              updateFormState({ importedTx: e.target.value });
              const match = e.target.value.match(/🔁 Swap: (\d+) ([A-Z]+) ➔ (\d+) ([A-Z]+) 📋([^\s🟦]+)/);
              if (match) {
                const [, fromAmount, fromToken, toAmount, toToken, tx] = match;
                handleClipboardData({
                  fromAmount,
                  fromToken,
                  toAmount,
                  toToken,
                  transactionId: tx
                });
              }
            }}
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