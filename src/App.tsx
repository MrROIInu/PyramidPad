import React, { useState } from 'react';
import { PresaleCard } from './components/PresaleCard';
import { AddPresale } from './components/AddPresale';
import { Plus } from 'lucide-react';
import { PyramidPadLogo } from './components/PyramidPadLogo';

interface Presale {
  id: number;
  title: string;
  symbol: string;
  imageUrl: string;
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
}

const INITIAL_PRESALES: Presale[] = [
  {
    id: 1,
    title: 'Pyramid',
    symbol: 'PYRAMID',
    imageUrl: 'https://static.wixstatic.com/media/c0fd9f_7392d831491244f2ba29b710ba24d909~mv2.png',
    progress: 5,
    endDate: new Date('2024-12-15T23:59:59'),
    walletAddress: '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N',
    description: 'Decentralized governance token inspired by ancient Egyptian leadership principles. Made for testing and to demostrate PyramidPad',
    totalSupply: '1,000,000,000',
    distribution: {
      development: 5,
      marketing: 0,
      airdrop: 0,
      mining: 0,
      melt: 0,
      presale: 95,
    },
    social: {
      x: 'https://x.com/GlyphSwap',
      website: 'https://glyphswap.com',
      discord: 'https://discord.gg/pwBMDDzWWG',
      telegram: 'https://t.me/glyphswap'
    }
  },
];

const COMPLETED_PRESALES: Presale[] = [
  {
    id: 2,
    title: 'Lot Of Layer-1',
    symbol: 'XD',
    imageUrl: 'https://static.wixstatic.com/media/c0fd9f_e237d0f063a74e72bdb47e00688b2560~mv2.png',
    progress: 100,
    endDate: new Date('2024-02-15T23:59:59'),
    walletAddress: '1CiKtAE6Zf3tniKmPBhv1e7pBRezZM433N',
    description: 'The first successful presale on PyramidPad. A Glyph meme token on Radiant RXD20. Made for Glyph token trading and fun! Deployed to you by $RADCAT.',
    totalSupply: '21,000,000,000',
    distribution: {
      development: 0,
      marketing: 0,
      airdrop: 0,
      mining: 0,
      melt: 0,
      presale: 100,
    },
    social: {
      x: 'https://x.com/LotOfLayer1',
      website: '',
      discord: '',
      telegram: ''
    }
  },
];

function App() {
  const [showAddPresale, setShowAddPresale] = useState(false);
  const [presales, setPresales] = useState<Presale[]>(INITIAL_PRESALES);
  const [completedPresales, setCompletedPresales] = useState<Presale[]>(COMPLETED_PRESALES);

  const handlePresaleSubmit = (newPresale: Omit<Presale, 'id' | 'progress' | 'endDate'> & { presaleDays: number }) => {
    const presale: Presale = {
      ...newPresale,
      id: Date.now(),
      progress: 0,
      endDate: new Date(Date.now() + newPresale.presaleDays * 24 * 60 * 60 * 1000),
    };
    setPresales([...presales, presale]);
    setShowAddPresale(false);
  };

  const handlePresaleComplete = (presaleId: number, finalProgress: number, remainingTokens: number) => {
    const presale = presales.find(p => p.id === presaleId);
    if (presale) {
      const meltPercentage = (remainingTokens / parseInt(presale.totalSupply.replace(/,/g, ''))) * 100;
      
      const completedPresale: Presale = {
        ...presale,
        progress: finalProgress,
        distribution: {
          ...presale.distribution,
          melt: meltPercentage,
          presale: presale.distribution.presale - meltPercentage
        }
      };

      setPresales(presales.filter(p => p.id !== presaleId));
      setCompletedPresales([completedPresale, ...completedPresales]);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] bg-[url('https://static.wixstatic.com/media/c0fd9f_7a29e6d3a40f4821a14dbe8f93b9d069~mv2.jpg')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen backdrop-blur-sm bg-black/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <PyramidPadLogo />
            <button
              onClick={() => setShowAddPresale(!showAddPresale)}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-4 py-2 hover:from-yellow-500 hover:to-amber-700 transition-all"
            >
              <Plus size={20} />
              {showAddPresale ? 'Hide Form' : 'Add Presale'}
            </button>
          </div>

          {showAddPresale && (
            <div className="mb-12">
              <AddPresale onSubmit={handlePresaleSubmit} />
            </div>
          )}
          
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8">
            Active Presales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
            {presales.map((presale) => (
              <PresaleCard
                key={presale.id}
                {...presale}
                onComplete={handlePresaleComplete}
              />
            ))}
          </div>

          {completedPresales.length > 0 && (
            <>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8">
                Completed Presales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {completedPresales.map((presale) => (
                  <PresaleCard
                    key={presale.id}
                    {...presale}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;