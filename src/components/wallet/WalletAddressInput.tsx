import React from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FEE_WALLET } from '../../lib/walletManager';

interface WalletAddressInputProps {
  walletAddress: string;
  isWalletChecked: boolean;
  isWalletValid: boolean;
  copied: boolean;
  isLoading?: boolean;
  onWalletChange: (address: string) => void;
  onCopyFeeWallet: () => void;
  onCheck?: () => void;
  showCheckButton?: boolean;
}

export const WalletAddressInput: React.FC<WalletAddressInputProps> = ({
  walletAddress,
  isWalletChecked,
  isWalletValid,
  copied,
  isLoading,
  onWalletChange,
  onCopyFeeWallet,
  onCheck,
  showCheckButton = false
}) => {
  return (
    <div className="mb-6">
      <label className="block text-yellow-600 mb-2">Your Photonic Wallet Address</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => onWalletChange(e.target.value)}
          className="flex-1 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-600"
          placeholder="Enter your Photonic wallet address"
          required
        />
        {showCheckButton && onCheck && (
          <button
            type="button"
            onClick={onCheck}
            disabled={!walletAddress || isLoading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Wallet'
            )}
          </button>
        )}
      </div>
      
      {isWalletChecked && !isWalletValid && (
        <div className="mt-4 p-4 bg-yellow-600/20 rounded-lg">
          <p className="text-yellow-600 mb-4">
            Send 1000 RXD to the following address to be allowed to make swaps:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={FEE_WALLET}
                size={150}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 bg-black/30 p-2 rounded mb-2">
                <code className="flex-1 break-all">{FEE_WALLET}</code>
                <button
                  type="button"
                  onClick={onCopyFeeWallet}
                  className="p-2 hover:bg-yellow-600/20 rounded"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="text-sm text-yellow-600/80">
                Please allow 24 hours for your wallet to be registered.
              </p>
            </div>
          </div>
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