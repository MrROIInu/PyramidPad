import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { TOKENS } from '../data/tokens';
import { TokenSelect } from './TokenSelect';
import { GlyphSwapLogo } from './GlyphSwapLogo';
import { saveSwap, getLiquidity } from '../lib/database';

const SWAP_WALLET = '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N';
const TAX_PERCENTAGE = 3;
const MIN_AMOUNT = 2;
const MIN_LIQUIDITY = 1000000; // 1 million tokens minimum liquidity

interface SwapState {
  showForm: boolean;
  showVerification: boolean;
  showSuccess: boolean;
}

export const GlyphSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS.find(t => t.symbol === "RXD") || TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS.find(t => t.symbol === "DOGE") || TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [liquidity, setLiquidity] = useState<Record<string, number>>({});
  const [swapState, setSwapState] = useState<SwapState>({
    showForm: true,
    showVerification: false,
    showSuccess: false
  });

  useEffect(() => {
    fetchLiquidity();
  }, []);

  const fetchLiquidity = async () => {
    try {
      const liquidityPromises = TOKENS.map(token => getLiquidity(token.symbol));
      const liquidityValues = await Promise.all(liquidityPromises);
      const newLiquidity: Record<string, number> = {};
      TOKENS.forEach((token, index) => {
        newLiquidity[token.symbol] = liquidityValues[index];
      });
      setLiquidity(newLiquidity);
    } catch (error) {
      console.error('Error fetching liquidity:', error);
    }
  };

  const handleRefresh = () => {
    fetchLiquidity();
  };

  const calculateToAmount = (amount: string) => {
    if (!amount || !fromToken || !toToken) return '';
    const fromAmount = parseFloat(amount);
    if (isNaN(fromAmount)) return '';

    const ratio = fromToken.totalSupply / toToken.totalSupply;
    const baseAmount = fromAmount / ratio;
    const taxAmount = baseAmount * (TAX_PERCENTAGE / 100);
    return (baseAmount - taxAmount).toFixed(6);
  };

  useEffect(() => {
    setToAmount(calculateToAmount(fromAmount));
  }, [fromAmount, fromToken, toToken]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SWAP_WALLET);
    setCopied(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromToken || !toToken || !fromAmount || !toAmount) return;

    const fromAmountNum = parseFloat(fromAmount);
    const toAmountNum = parseFloat(toAmount);
    const availableLiquidity = liquidity[toToken.symbol] || 0;

    // Validation checks
    if (fromAmountNum < MIN_AMOUNT) {
      alert(`Minimum amount is ${MIN_AMOUNT} tokens`);
      return;
    }

    if (toAmountNum < MIN_AMOUNT) {
      alert(`Swap amount too small. Would receive less than ${MIN_AMOUNT} tokens`);
      return;
    }

    if (toAmountNum > availableLiquidity * 0.5) {
      alert(`Cannot swap more than 50% of available liquidity (${availableLiquidity * 0.5} ${toToken.symbol})`);
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
      await saveSwap({
        from_token: fromToken.symbol,
        to_token: toToken.symbol,
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        tax_amount: parseFloat(toAmount) * (TAX_PERCENTAGE / 100),
        wallet_address: walletAddress,
        transaction_id: transactionId
      });

      setSwapState({
        showForm: false,
        showVerification: false,
        showSuccess: true
      });
    } catch (error) {
      console.error('Error verifying swap:', error);
      alert('Failed to verify swap. Please try again.');
    }
  };

  const handleBack = () => {
    setSwapState({
      showForm: true,
      showVerification: false,
      showSuccess: false
    });
    setTransactionId('');
  };

  const filteredToTokens = TOKENS.filter(token => {
    const tokenLiquidity = liquidity[token.symbol] || 0;
    return tokenLiquidity >= MIN_LIQUIDITY;
  });

  if (swapState.showSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GlyphSwapLogo className="mb-8" />
        <div className="max-w-md mx-auto bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Swap Verified!</h2>
          <p className="text-yellow-600 mb-6">
            Your swap has been verified. Please allow up to 24 hours for delivery of your tokens.
          </p>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
          >
            Start New Swap
          </button>
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
            {showCopyMessage && (
              <p className="absolute top-full left-0 right-0 text-center text-green-500 mt-2">
                Copied to clipboard. Use it in Photonic Wallet to make the swap.
              </p>
            )}
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
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
                onClick={handleBack}
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
      <GlyphSwapLogo className="mb-8" />
      <form onSubmit={handleSwap} className="max-w-md mx-auto">
        <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleRefresh}
              className="text-yellow-600 hover:text-yellow-500 p-1"
              title="Reload"
            >
              <RotateCw size={16} />
            </button>
          </div>

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
                  min={MIN_AMOUNT}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">To (including {TAX_PERCENTAGE}% tax)</label>
              <div className="flex gap-4">
                <TokenSelect
                  tokens={filteredToTokens}
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
              <p className="text-sm text-yellow-600/80 mt-1">
                Available liquidity: {liquidity[toToken.symbol]?.toLocaleString() || 0} {toToken.symbol}
              </p>
            </div>

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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
            >
              Swap Tokens
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};