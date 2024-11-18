import React, { useState, useEffect } from 'react';
import { Copy, Globe, MessageCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { ProgressPyramid } from './ProgressPyramid';
import { CountdownTimer } from './CountdownTimer';
import { TokenLogo } from './TokenLogo';
import { TokenDistribution } from './TokenDistribution';

interface PresaleCardProps {
  id: number;
  title: string;
  symbol: string;
  imageUrl?: string;
  progress: number;
  endDate: Date;
  walletAddress: string;
  description: string;
  totalSupply: string;
  distribution: {
    development: number;
    marketing: number;
    airdrop: number;
    mining: number;
    melt: number;
    presale: number;
  };
  social: {
    x: string | null;
    website: string | null;
    discord: string | null;
    telegram: string | null;
  };
  onComplete?: (id: number, progress: number, remainingTokens: number) => void;
}

const XIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246zm0 0" />
  </svg>
);

const SocialIcon = ({ href, icon: Icon, svgPath }: { href: string | null, icon?: any, svgPath?: boolean }) => {
  const baseClasses = "p-2 rounded-lg transition-colors";
  
  if (!href) {
    return (
      <div className={`${baseClasses} bg-black/10 cursor-not-allowed`}>
        {svgPath ? (
          <XIcon className="w-5 h-5 text-yellow-600/30" />
        ) : (
          <Icon className="w-5 h-5 text-yellow-600/30" />
        )}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} bg-black/30 hover:bg-black/40`}
    >
      {svgPath ? (
        <XIcon className="w-5 h-5 text-yellow-600" />
      ) : (
        <Icon className="w-5 h-5 text-yellow-600" />
      )}
    </a>
  );
};

export const PresaleCard: React.FC<PresaleCardProps> = ({
  id,
  title,
  symbol,
  imageUrl,
  progress: initialProgress,
  endDate,
  walletAddress,
  description,
  totalSupply,
  distribution,
  social,
  onComplete
}) => {
  const [rxdAmount, setRxdAmount] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(progress >= 100);

  const totalTokens = parseInt(totalSupply.replace(/,/g, ''));
  const presaleTokens = (totalTokens * distribution.presale) / 100;
  const [remainingTokens, setRemainingTokens] = useState(presaleTokens * (1 - progress / 100));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    const amount = parseFloat(rxdAmount);
    if (amount > 0) {
      const newRemainingTokens = remainingTokens - amount;
      setRemainingTokens(newRemainingTokens);

      const newProgress = ((presaleTokens - newRemainingTokens) / presaleTokens) * 100;
      setProgress(Math.min(100, newProgress));

      if (newProgress >= 100 && onComplete) {
        onComplete(id, 100, newRemainingTokens);
        setIsCompleted(true);
      }
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setRxdAmount('');
    }, 3000);
  };

  useEffect(() => {
    const now = new Date();
    if (now > endDate && onComplete && !isCompleted) {
      onComplete(id, progress, remainingTokens);
      setIsCompleted(true);
    }
  }, [endDate, onComplete, id, progress, remainingTokens, isCompleted]);

  if (showSuccess) {
    return (
      <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-green-500 mb-2">Presale submitted!</h3>
          <p className="text-yellow-600">Thank you for using PyramidPad.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <TokenLogo symbol={symbol} imageUrl={imageUrl} />
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
            {title}
          </h2>
          <p className="text-sm text-yellow-600/80 mt-2">{description}</p>
          <div className="flex gap-2 mt-4 justify-center sm:justify-start">
            <SocialIcon href={social.x} svgPath={true} />
            <SocialIcon href={social.website} icon={Globe} />
            <SocialIcon href={social.discord} icon={MessageCircle} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <ProgressPyramid progress={progress} />
        <p className="text-center text-yellow-600 mt-2">
          {progress.toFixed(2)}% Complete
          {progress < 100 && ". Unsold tokens going to be Melted."}
        </p>
        <p className="text-center text-yellow-600/80 text-sm mt-1">
          {remainingTokens.toLocaleString()} of {presaleTokens.toLocaleString()} {symbol} remaining for presale
        </p>
      </div>

      <div className="mb-6">
        {progress < 100 && new Date() < endDate ? (
          <CountdownTimer 
            endDate={endDate} 
            onComplete={() => {
              if (onComplete) {
                onComplete(id, progress, remainingTokens);
                setIsCompleted(true);
              }
            }} 
          />
        ) : (
          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-6 backdrop-blur-sm text-center">
            <h3 className="text-xl font-semibold text-yellow-600">Presale Ended</h3>
          </div>
        )}
      </div>

      <div className="mb-6">
        <TokenDistribution totalSupply={totalSupply} distribution={distribution} />
      </div>

      {!isCompleted && new Date() < endDate && (
        <div className="space-y-6">
          <div>
            <label className="block text-yellow-600 mb-2">Enter RXD Amount:</label>
            <div className="flex gap-4">
              <input
                type="number"
                value={rxdAmount}
                onChange={(e) => setRxdAmount(e.target.value)}
                className="bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-yellow-600"
                placeholder="Amount of RXD"
                max={remainingTokens}
              />
              <div className="bg-yellow-900/20 rounded-lg px-4 py-2">
                = {rxdAmount || '0'} {symbol}
              </div>
            </div>
          </div>

          <div className="flex gap-6 items-center">
            <div className="bg-white p-2 rounded-lg">
              <QRCode
                value={walletAddress}
                size={100}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            
            <div className="flex-1">
              <p className="text-yellow-600 mb-2">
                {rxdAmount ? `Send ${rxdAmount} RXD from ` : 'Send RXD from '}
                <a href="https://photonic.radiant4people.com/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500">Photonic Wallet</a> to:
              </p>
              <div className="flex items-center gap-2 bg-black/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <code className="flex-1 text-sm">{walletAddress}</code>
                <button
                  onClick={handleCopy}
                  className="text-yellow-600 hover:text-yellow-500"
                >
                  <Copy size={16} />
                </button>
              </div>
              {copied && (
                <p className="text-green-500 text-sm mt-1">Address copied!</p>
              )}
              <p className="text-amber-200/80 text-sm mt-2">
                You will receive your {symbol} when presale has ended.
              </p>
            </div>
          </div>

          {rxdAmount && parseFloat(rxdAmount) <= remainingTokens && (
            <button
              onClick={handleVerify}
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 font-semibold hover:from-yellow-500 hover:to-amber-700 transition-all"
            >
              Verify you have sent {rxdAmount} RXD
            </button>
          )}
        </div>
      )}
    </div>
  );
};