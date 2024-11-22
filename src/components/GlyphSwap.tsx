import React, { useState, useEffect } from 'react';
import { Copy, RotateCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '../lib/supabase';
import { TOKENS } from '../data/tokens';
import { TokenSelect } from './TokenSelect';
import { GlyphSwapLogo } from './GlyphSwapLogo';
import { getLiquidity } from '../lib/database';

const SWAP_WALLET = '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N';
const TAX_PERCENTAGE = 3;

export const GlyphSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS.find(t => t.symbol === 'DOGE') || TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [tradeRatio, setTradeRatio] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableTokens, setAvailableTokens] = useState(TOKENS);

  useEffect(() => {
    loadAvailableTokens();
  }, []);

  const loadAvailableTokens = async () => {
    const tokensWithLiquidity = await Promise.all(
      TOKENS.map(async (token) => {
        const liquidity = await getLiquidity(token.symbol);
        return { ...token, liquidity };
      })
    );
    
    // Filter tokens with liquidity >= 1,000,000
    setAvailableTokens(tokensWithLiquidity.filter(t => t.liquidity >= 1000000));
  };

  const handleRefresh = () => {
    loadAvailableTokens();
  };

  const calculateTradeRatio = (fromAmount: number, toAmount: number) => {
    const ratio = fromAmount / toAmount;
    return ratio > 1 ? `1:${ratio.toFixed(2)}` : `${(1/ratio).toFixed(2)}:1`;
  };

  const handleAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && fromToken && toToken) {
      // Calculate the ratio based on total supplies
      const ratio = toToken.totalSupply / fromToken.totalSupply;
      // Calculate base amount before tax
      const baseAmount = parseFloat(value) * ratio;
      // Apply 3% tax
      const afterTax = baseAmount * (1 - TAX_PERCENTAGE / 100);
      setToAmount(afterTax.toFixed(6));
      // Set trade ratio
      setTradeRatio(calculateTradeRatio(parseFloat(value), afterTax));
    } else {
      setToAmount('');
      setTradeRatio('');
    }
  };

  const getRatioColor = (ratio: string) => {
    const numericRatio = parseFloat(ratio.split(':')[0]);
    if (numericRatio >= 0.1 && numericRatio <= 5) return 'text-green-500';
    if (numericRatio > 5 && numericRatio <= 9) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SWAP_WALLET);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
  };

  const handleVerify = async () => {
    if (!transactionId) return;

    try {
      const { error } = await supabase
        .from('swaps')
        .insert([{
          from_token: fromToken.symbol,
          to_token: toToken.symbol,
          from_amount: parseFloat(fromAmount),
          to_amount: parseFloat(toAmount),
          tax_amount: parseFloat(toAmount) * (TAX_PERCENTAGE / 100),
          wallet_address: walletAddress,
          transaction_id: transactionId,
          status: 'pending'
        }]);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFromAmount('');
        setToAmount('');
        setWalletAddress('');
        setTransactionId('');
        setTradeRatio('');
      }, 3000);
    } catch (error) {
      console.error('Error verifying swap:', error);
      alert('Failed to verify swap. Please try again.');
    }
  };

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <GlyphSwapLogo />
        </div>
        <div className="max-w-md mx-auto bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Swap Verified!</h2>
          <p className="text-yellow-600 mb-4">
            Your swap has been verified. Please allow up to 24 hours for delivery of your tokens.
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
          >
            Start New Swap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <GlyphSwapLogo />
      </div>

      <form className="max-w-md mx-auto">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Create Swap</h2>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-yellow-600 hover:text-yellow-500 p-2"
              title="Refresh"
            >
              <RotateCw size={20} />
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
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-yellow-600"
                  placeholder="Amount"
                  min="2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">To (including {TAX_PERCENTAGE}% tax)</label>
              <div className="flex gap-4">
                <TokenSelect
                  tokens={availableTokens}
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
            </div>

            {tradeRatio && (
              <div className={`text-center ${getRatioColor(tradeRatio)}`}>
                Trade Ratio: {tradeRatio}
              </div>
            )}

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

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="bg-white p-2 rounded-lg w-[150px] mx-auto sm:mx-0">
                <QRCode
                  value={SWAP_WALLET}
                  size={150}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>
              
              <div className="flex-1">
                <p className="text-yellow-600 text-lg mb-2">
                  {fromAmount ? `Send ${fromAmount} ${fromToken.symbol} from ` : 'Send tokens from '}
                  <a href="https://photonic.radiant4people.com/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500">
                    Photonic Wallet
                  </a> to:
                </p>
                <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-3">
                  <code className="flex-1 text-base sm:text-lg break-all">{SWAP_WALLET}</code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-yellow-600 hover:text-yellow-500 ml-2"
                  >
                    <Copy size={20} />
                  </button>
                </div>
                {showCopyMessage && (
                  <p className="text-green-500 text-base mt-1">Address copied!</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-yellow-600 mb-2">Transaction ID</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
                placeholder="Enter transaction ID"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={!fromAmount || !toAmount || !walletAddress || !transactionId}
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50"
            >
              Verify Transaction
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};