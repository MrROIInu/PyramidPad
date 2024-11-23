import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Copy, RefreshCw } from 'lucide-react';
import { TOKENS } from '../data/tokens';
import { TokenSelect } from './TokenSelect';
import { GlyphSwapLogo } from './GlyphSwapLogo';
import { saveSwap, getLiquidity } from '../lib/database';
import { INITIAL_LIQUIDITY } from '../data/liquidityPool';

const SWAP_WALLET = '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N';
const TAX_PERCENTAGE = 3;
const MIN_TOKENS = 2;

interface SwapState {
  showForm: boolean;
  showVerification: boolean;
  showSuccess: boolean;
}

export const GlyphSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [liquidity, setLiquidity] = useState<Record<string, number>>(INITIAL_LIQUIDITY);
  const [swapState, setSwapState] = useState<SwapState>({
    showForm: true,
    showVerification: false,
    showSuccess: false
  });

  useEffect(() => {
    if (toToken) {
      getLiquidity(toToken.symbol)
        .then(amount => {
          setLiquidity(prev => ({ ...prev, [toToken.symbol]: amount }));
        })
        .catch(console.error);
    }
  }, [toToken]);

  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) >= MIN_TOKENS) {
      // Calculate based on total supply ratio
      const ratio = fromToken.totalSupply / toToken.totalSupply;
      const baseAmount = parseFloat(fromAmount) / ratio;
      
      // Apply 3% tax
      const taxAmount = baseAmount * (TAX_PERCENTAGE / 100);
      const finalAmount = baseAmount - taxAmount;
      
      setToAmount(finalAmount.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SWAP_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setFromToken(TOKENS[0]);
    setToToken(TOKENS[1]);
    setFromAmount('');
    setToAmount('');
    setWalletAddress('');
    setTransactionId('');
    setSwapState({
      showForm: true,
      showVerification: false,
      showSuccess: false
    });
  };

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) < MIN_TOKENS) return;

    // Verify liquidity
    const availableLiquidity = liquidity[toToken.symbol] || 0;
    if (parseFloat(toAmount) > availableLiquidity / 2) {
      alert(`Cannot swap more than 50% of available liquidity (${availableLiquidity / 2} ${toToken.symbol})`);
      return;
    }

    setSwapState({
      showForm: false,
      showVerification: true,
      showSuccess: false
    });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId || !fromToken || !toToken || !fromAmount || !toAmount || !walletAddress) return;

    try {
      const baseAmount = parseFloat(toAmount);
      const taxAmount = (baseAmount * TAX_PERCENTAGE) / (100 - TAX_PERCENTAGE);

      await saveSwap({
        from_token: fromToken.symbol,
        to_token: toToken.symbol,
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        tax_amount: taxAmount,
        wallet_address: walletAddress,
        transaction_id: transactionId
      });

      setSwapState({
        showForm: false,
        showVerification: false,
        showSuccess: true
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        handleRefresh();
      }, 3000);

    } catch (error) {
      console.error('Error verifying swap:', error);
      if (error instanceof Error && error.message === 'Insufficient liquidity') {
        alert('Insufficient liquidity for this swap. Please try a smaller amount.');
      } else {
        alert('Failed to verify swap. Please try again later.');
      }
    }
  };

  if (swapState.showSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GlyphSwapLogo className="mb-8" />
        <div className="max-w-md mx-auto bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Swap Verified!</h2>
          <p className="text-yellow-600 mb-6">
            Expect 24-hours delivery time for your tokens.
          </p>
        </div>
      </div>
    );
  }

  if (swapState.showVerification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GlyphSwapLogo className="mb-8" />
        <div className="max-w-md mx-auto bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Swap Initiated</h2>
          <p className="text-yellow-600 mb-4">
            You are swapping {fromAmount} {fromToken.symbol} for approximately {toAmount} {toToken.symbol}
          </p>
          <p className="text-yellow-600 mb-2">Please send {fromAmount} {fromToken.symbol} to:</p>
          
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                value={SWAP_WALLET}
                size={150}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
          </div>

          <div className="relative mb-6">
            <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-3">
              <code className="flex-1 break-all">{SWAP_WALLET}</code>
              <button
                onClick={handleCopy}
                className="text-yellow-600 hover:text-yellow-500"
              >
                <Copy size={20} />
              </button>
            </div>
            {copied && (
              <p className="absolute top-full left-0 right-0 text-center text-green-500 mt-2">
                Copied to clipboard. Use it in Photonic Wallet to make the swap.
              </p>
            )}
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-yellow-600 mb-2">Your Photonic Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter your wallet address"
                required
              />
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">
                After sending, enter your transaction ID to verify the swap:
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter transaction ID"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
              >
                Verify Transaction
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="flex-1 bg-black/30 text-yellow-600 rounded-lg px-6 py-3 font-semibold hover:bg-black/40 transition-all"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <GlyphSwapLogo />
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg bg-yellow-600/10 text-yellow-600 hover:bg-yellow-600/20 transition-colors"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      <form onSubmit={handleSwap} className="max-w-md mx-auto">
        <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-yellow-600 mb-2">From</label>
              <div className="flex gap-4">
                <TokenSelect
                  tokens={TOKENS}
                  selectedToken={fromToken}
                  onChange={setFromToken}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
                  placeholder="Amount"
                  min={MIN_TOKENS}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">To (including {TAX_PERCENTAGE}% tax)</label>
              <div className="flex gap-4">
                <TokenSelect
                  tokens={TOKENS.filter(t => liquidity[t.symbol] >= MIN_TOKENS)}
                  selectedToken={toToken}
                  onChange={setToToken}
                  className="flex-1"
                />
                <input
                  type="text"
                  value={toAmount}
                  readOnly
                  className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
                />
              </div>
              {toToken && (
                <p className="text-sm text-yellow-600 mt-2">
                  Available liquidity: {liquidity[toToken.symbol]?.toLocaleString()} {toToken.symbol}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) < MIN_TOKENS}
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Swap Tokens
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};