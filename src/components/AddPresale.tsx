import React, { useState } from 'react';
import { Copy, Upload } from 'lucide-react';
import QRCode from 'react-qr-code';

const PRESALE_WALLET = '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N';

interface AddPresaleProps {
  onSubmit: (presale: any) => void;
}

export const AddPresale: React.FC<AddPresaleProps> = ({ onSubmit }) => {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    imageUrl: '',
    description: '',
    website: '',
    x: '',
    discord: '',
    telegram: '',
    contactInfo: '',
    totalSupply: '',
    presaleDays: 30,
    distribution: {
      development: 10,
      marketing: 20,
      airdrop: 10,
      mining: 0,
      melt: 0,
      presale: 60,
    },
    photonicWallet: '',
    transactionId: '',
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PRESALE_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDistributionChange = (key: string, value: string) => {
    const numValue = Number(value) || 0;
    setFormData(prev => ({
      ...prev,
      distribution: {
        ...prev.distribution,
        [key]: numValue
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.name,
      symbol: formData.symbol,
      imageUrl: formData.imageUrl,
      description: formData.description,
      totalSupply: formData.totalSupply,
      presaleDays: formData.presaleDays,
      walletAddress: PRESALE_WALLET,
      distribution: formData.distribution,
      social: {
        website: formData.website || null,
        x: formData.x || null,
        discord: formData.discord || null,
        telegram: formData.telegram || null,
      },
    });
  };

  const totalPercentage = Object.values(formData.distribution).reduce((a, b) => a + b, 0);
  const isValidDistribution = totalPercentage === 100;

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Upload className="w-8 h-8 text-yellow-600" />
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
          Launch Your Presale
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form content remains the same */}
        <button
          type="submit"
          disabled={!isValidDistribution || (formData.distribution.mining > 0 && !formData.contactInfo)}
          className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Presale
        </button>
      </form>
    </div>
  );
};