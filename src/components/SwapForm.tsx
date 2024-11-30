import React from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { TokenSelect } from './TokenSelect';
import { TOKENS } from '../data/tokens';
import { RXD_TOKEN } from '../constants/tokens';
import { useSwapForm } from '../hooks/useSwapForm';
import { useSwapContext } from '../contexts/SwapContext';
import { TOKEN_PRICES, formatPriceUSD } from '../lib/tokenPrices';
import { useWalletManager } from '../hooks/useWalletManager';
import { WalletAddressInput } from './wallet/WalletAddressInput';

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
    handleWalletChange,
    checkWallet,
    copyFeeWallet
  } = useWalletManager();
  
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

  // Update form when context token changes
  React.useEffect(() => {
    if (contextSelectedToken.symbol !== selectedToken.symbol) {
      updateFormState({ selectedToken: contextSelectedToken });
    }
  }, [contextSelectedToken, selectedToken.symbol, updateFormState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletChecked || !isWalletValid) {
      await checkWallet();
      return;
    }
    await originalHandleSubmit(e, walletAddress);
  };

  const calculateUSDValue = (amount: string, symbol: string): string => {
    const price = TOKEN_PRICES[symbol] || 0;
    const value = parseFloat(amount) * price;
    return formatPriceUSD(value);
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
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <img
                  src={isRxdToToken ? RXD_TOKEN.imageUrl : selectedToken.imageUrl}
                  alt=""
                  className="w-6 h-6"
                />
                <input
                  type="number"
                  value={isRxdToToken ? rxdAmount : tokenAmount}
                  onChange={(e) => updateFormState(
                    isRxdToToken 
                      ? { rxdAmount: e.target.value }
                      : { tokenAmount: e.target.value }
                  )}
                  className="flex-1 bg-transparent focus:outline-none"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="text-sm text-yellow-600/80 px-2">
                ≈ {calculateUSDValue(
                  isRxdToToken ? rxdAmount : tokenAmount,
                  isRxdToToken ? 'RXD' : selectedToken.symbol
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-yellow-600 mb-2">You Will Receive</label>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <img
                  src={isRxdToToken ? selectedToken.imageUrl : RXD_TOKEN.imageUrl}
                  alt=""
                  className="w-6 h-6"
                />
                <input
                  type="number"
                  value={isRxdToToken ? tokenAmount : rxdAmount}
                  onChange={(e) => updateFormState(
                    isRxdToToken 
                      ? { tokenAmount: e.target.value }
                      : { rxdAmount: e.target.value }
                  )}
                  className="flex-1 bg-transparent focus:outline-none"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="text-sm text-yellow-600/80 px-2">
                ≈ {calculateUSDValue(
                  isRxdToToken ? tokenAmount : rxdAmount,
                  isRxdToToken ? selectedToken.symbol : 'RXD'
                )}
              </div>
            </div>
          </div>
        </div>

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
            onChange={(e) => updateFormState({ importedTx: e.target.value })}
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