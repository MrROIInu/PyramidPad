import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    const fetchRadiantData = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=radiant&vs_currencies=usd&include_market_cap=true&include_24hr_change=true'
        );

        if (response.data?.radiant) {
          setData({
            price: response.data.radiant.usd,
            marketCap: response.data.radiant.usd_market_cap,
            priceChange24h: response.data.radiant.usd_24h_change
          });
        }
      } catch (error) {
        console.warn('Error fetching Radiant data:', error);
      }
    };

    fetchRadiantData();
    const interval = setInterval(fetchRadiantData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 py-2 overflow-hidden">
      <div className="flex justify-end">
        <div className="animate-scroll-smooth flex items-center gap-4 px-4">
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
          <a 
            href="https://radiantblockchain.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-600 hover:text-yellow-500 transition-colors whitespace-nowrap"
          >
            Visit Radiant Website
          </a>
          <span className="text-yellow-600/80">|</span>
          <span className="whitespace-nowrap">Buy Radiant Merch at </span>
          <a 
            href="https://rxd.land/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-600 hover:text-yellow-500 transition-colors whitespace-nowrap"
          >
            RXD.LAND
          </a>
        </div>
      </div>
    </div>
  );
};