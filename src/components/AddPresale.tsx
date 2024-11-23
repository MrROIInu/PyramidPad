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
    <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Upload className="w-8 h-8 text-yellow-600" />
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
          Launch Your Presale
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-yellow-600 mb-2">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
              placeholder="e.g., Pharaoh"
              required
            />
          </div>
          <div>
            <label className="block text-yellow-600 mb-2">Token Symbol</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
              placeholder="e.g., PHAR"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-yellow-600 mb-2">Token Image URL</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
            placeholder="https://example.com/token-logo.png"
            required
          />
        </div>

        <div>
          <label className="block text-yellow-600 mb-2">Presale Length (days)</label>
          <input
            type="number"
            value={formData.presaleDays}
            onChange={(e) => setFormData({ ...formData, presaleDays: parseInt(e.target.value) })}
            className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
            min="1"
            max="365"
            required
          />
        </div>

        <div>
          <label className="block text-yellow-600 mb-2">Total Supply</label>
          <input
            type="text"
            value={formData.totalSupply}
            onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
            className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
            placeholder="e.g., 1,000,000,000"
            required
          />
        </div>

        <div>
          <label className="block text-yellow-600 mb-2">Token Distribution (%)</label>
          <p className="text-sm text-yellow-600/80 mb-4">Total must equal 100%</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.distribution).map(([key, value]) => (
              <div key={key}>
                <label className="block text-yellow-600/80 text-sm mb-1 capitalize">{key}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleDistributionChange(key, e.target.value)}
                  className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
                  min="0"
                  max="100"
                  required
                />
              </div>
            ))}
          </div>
          <p className={`text-sm mt-2 ${isValidDistribution ? 'text-green-500' : 'text-red-500'}`}>
            Total: {totalPercentage}%
          </p>
        </div>

        <div>
          <label className="block text-yellow-600 mb-2">Project Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full h-24 focus:outline-none focus:border-yellow-600 resize-none"
            placeholder="Brief description of your project"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-yellow-600 mb-2">Website URL (Optional)</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
              placeholder="https://"
            />
          </div>
          <div>
            <label className="block text-yellow-600 mb-2">X Profile (Optional)</label>
            <input
              type="url"
              value={formData.x}
              onChange={(e) => setFormData({ ...formData, x: e.target.value })}
              className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
              placeholder="https://x.com/"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-yellow-600 mb-2">Discord Server (Optional)</label>
            <input
              type="url"
              value={formData.discord}
              onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
              className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
              placeholder="https://discord.gg/"
            />
          </div>
          <div>
            <label className="block text-yellow-600 mb-2">Telegram Group (Optional)</label>
            <input
              type="url"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
              placeholder="https://t.me/"
            />
          </div>
        </div>

        <div>
          <label className="block text-yellow-600 mb-2">
            Telegram Username or Email Address {formData.distribution.mining > 0 && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={formData.contactInfo}
            onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
            className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
            placeholder="@username or email@example.com"
            required={formData.distribution.mining > 0}
          />
          <p className="text-sm text-yellow-600/80 mt-1">
            If token is mineable you must enter contact information to receive Mining contracts.
          </p>
        </div>

        <div className="border-t border-yellow-600/20 pt-6">
          <h3 className="text-xl font-semibold text-yellow-600 mb-4">Launch Your Presale</h3>
          
          <div className="flex gap-6 items-center">
            <div className="bg-white p-2 rounded-lg">
              <QRCode
                value={PRESALE_WALLET}
                size={100}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            
            <div className="flex-1">
              <p className="text-yellow-600 mb-2">
                Send 10000 RXD from <a href="https://photonic.radiant4people.com/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500">Photonic Wallet</a> to:
              </p>
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <code className="flex-1 text-sm">{PRESALE_WALLET}</code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-yellow-600 hover:text-yellow-500"
                >
                  <Copy size={16} />
                </button>
              </div>
              {copied && (
                <p className="text-green-500 text-sm mt-1">Address copied!</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-yellow-600 mb-2">Your Photonic Wallet Address</label>
          <input
            type="text"
            value={formData.photonicWallet}
            onChange={(e) => setFormData({ ...formData, photonicWallet: e.target.value })}
            className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
            placeholder="Enter your Photonic wallet address"
            required
          />
          <p className="text-sm text-yellow-600/80 mt-1">
            If Deployer tokens selected will be sent to this address
          </p>
        </div>

        <div>
          <label className="block text-yellow-600 mb-2">Transaction ID</label>
          <input
            type="text"
            value={formData.transactionId}
            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
            className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
            placeholder="Enter your transaction ID"
            required
          />
        </div>

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