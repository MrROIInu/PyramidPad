import React, { useState } from 'react';
import { PresaleCard } from './components/PresaleCard';
import { AddPresale } from './components/AddPresale';
import { P2PSwap } from './components/P2PSwap';
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
    description: 'Decentralized governance token inspired by ancient Egyptian leadership principles. Made for testing and to demonstrate PyramidPad',
    totalSupply: '1,000,000,000',
    distribution: {
      development: 5,
      marketing: 3,
      airdrop: 1,
      mining: 10,
      melt: 5,
      presale: 76,
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
  const [currentPage, setCurrentPage] = useState<'presale' | 'p2p'>('presale');

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
      <div className="min-h-screen backdrop-blur-sm bg-black/50">
        {/* Header */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center">
            {/* Navigation */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setCurrentPage('presale')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  currentPage === 'presale'
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-800 text-white'
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                PyramidPad
              </button>
              <button
                onClick={() => setCurrentPage('p2p')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  currentPage === 'p2p'
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-800 text-white'
                    : 'text-yellow-600 hover:bg-yellow-600/10'
                }`}
              >
                P2PSwap
              </button>
            </div>

            {/* Logo */}
            {currentPage === 'presale' ? (
              <PyramidPadLogo className="mb-6" />
            ) : null}

            {currentPage === 'presale' && (
              <button
                onClick={() => setShowAddPresale(!showAddPresale)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-800 text-white rounded-lg px-6 py-3 text-lg hover:from-yellow-500 hover:to-amber-700 transition-all"
              >
                <Plus size={24} />
                {showAddPresale ? 'Hide Form' : 'Add Presale'}
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center">
            {currentPage === 'presale' ? (
              <>
                {showAddPresale && (
                  <div className="w-full max-w-4xl mb-12">
                    <AddPresale onSubmit={handlePresaleSubmit} />
                  </div>
                )}
                
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8 text-center">
                  Active Presales
                </h2>
                
                <div className="w-full flex flex-wrap justify-center gap-6 mb-16">
                  {presales.map((presale) => (
                    <div key={presale.id} className="w-full md:w-[600px] flex-shrink-0">
                      <PresaleCard
                        {...presale}
                        onComplete={handlePresaleComplete}
                      />
                    </div>
                  ))}
                </div>

                {completedPresales.length > 0 && (
                  <>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800 mb-8 text-center">
                      Completed Presales
                    </h2>
                    <div className="w-full flex flex-wrap justify-center gap-6">
                      {completedPresales.map((presale) => (
                        <div key={presale.id} className="w-full md:w-[600px] flex-shrink-0">
                          <PresaleCard
                            {...presale}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <P2PSwap />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;