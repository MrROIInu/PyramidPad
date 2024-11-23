import React from 'react';

interface OrderBookLogoProps {
  className?: string;
}

export const OrderBookLogo: React.FC<OrderBookLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="flex items-center h-16">
        <img 
          src="https://i.postimg.cc/g0szj3z0/p2p-5806865.png"
          alt="OrderBookDemo Logo"
          className="h-16 w-16 object-contain"
        />
        <div className="flex items-center font-red-hat text-white ml-4">
          <span className="text-3xl font-bold">
            OrderBook
          </span>
          <span className="text-3xl font-normal italic">
            Demo
          </span>
        </div>
      </div>
    </div>
  );
};