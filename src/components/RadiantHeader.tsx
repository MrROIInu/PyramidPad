import React, { useState, useEffect } from 'react';
import { fetchCMCData } from '../lib/api/coinmarketcap';
import { fetchCGData } from '../lib/api/coingecko';
import { priceCache } from '../lib/api/priceCache';
import { WalletButton } from './WalletButton';

interface RadiantData {
  price: number;
  marketCap: number;
  priceChange24h: number;
}

export const RadiantHeader: React.FC = () => {
  const [data, setData] = useState<RadiantData>({
    price: 0,
    marketCap: 0,
    priceChange24h: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cmcData = await fetchCMCData();
        setData(cmcData);
        priceCache.addPrice(cmcData);
      } catch (cmcError) {
        console.warn('CoinMarketCap fetch failed, trying CoinGecko...');
        
        try {
          const cgData = await fetchCGData();
          setData(cgData);
          priceCache.addPrice(cgData);
        } catch (cgError) {
          console.warn('CoinGecko fetch failed, using cached data...');
          
          const cachedData = priceCache.getLatestValidPrice();
          if (cachedData) {
            setData(cachedData);
          }
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="https://static.wixstatic.com/media/c0fd9f_33dd965b95d54dfe9af12ed99fe5c43a~mv2.png"
              alt="Radiant"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-semibold whitespace-nowrap">Radiant (RXD)</span>
            <span className="font-mono whitespace-nowrap">${data.price.toFixed(6)}</span>
            <span className="font-mono whitespace-nowrap">${(data.marketCap / 1000000).toFixed(2)}M</span>
            <span className={`font-mono whitespace-nowrap ${
              data.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {data.priceChange24h > 0 ? '+' : ''}{data.priceChange24h.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://radiantblockchain.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              Visit Radiant Website
            </a>
            <span className="text-yellow-600/80">|</span>
            <a 
              href="https://rxd.land/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              RXD.LAND
            </a>
            <span className="text-yellow-600/80">|</span>
            <a 
              href="https://faucetgames.rxddapps.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              RXD DAPPS
            </a>
          </div>
        </div>
      </div>

      <div className="h-[5px]"></div>

      <div className="container mx-auto px-4 flex justify-end">
        <WalletButton />
      </div>
    </div>
  );
};