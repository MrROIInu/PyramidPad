import React from 'react';
import { Copy, Check } from 'lucide-react';
import { FEE_WALLET } from '../../lib/walletManager';

interface WalletAddressInputProps {
  walletAddress: string;
  isWalletChecked: boolean;
  isWalletValid: boolean;
  copied: boolean;
  onWalletChange: (address: string) => void;
  onCopyFeeWallet: () => void;
}

export const WalletAddressInput: React.FC<WalletAddressInputProps> = ({
  walletAddress,
  isWalletChecked,
  isWalletValid,
  copied,
  onWalletChange,
  onCopyFeeWallet
}) => {
  return (
    <div className="mb-6">
      <label className="block text-yellow-600 mb-2">Your Photonic Wallet Address</label>
      <input
        type="text"
        value={walletAddress}
        onChange={(e) => onWalletChange(e.target.value)}
        className="w-full bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
        placeholder="Enter your Photonic wallet address"
        required
      />
      
      {isWalletChecked && !isWalletValid && (
        <div className="mt-4 p-4 bg-yellow-600/20 rounded-lg">
          <p className="text-yellow-600 mb-2">
            Send 1000 RXD to the following address to be allowed to make swaps:
          </p>
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded">
            <code className="flex-1">{FEE_WALLET}</code>
            <button
              type="button"
              onClick={onCopyFeeWallet}
              className="p-2 hover:bg-yellow-600/20 rounded"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
          <p className="text-sm text-yellow-600/80 mt-2">
            Please allow 24 hours for your wallet to be registered.
          </p>
        </div>
      )}

      {isWalletChecked && isWalletValid && (
        <div className="mt-2 text-green-500">
          You are allowed to make swaps on GlyphSwap Test Phase.
        </div>
      )}
    </div>
  );
};