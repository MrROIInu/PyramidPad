import React from 'react';

interface OrderBookLogoProps {
  className?: string;
}

export const OrderBookLogo: React.FC<OrderBookLogoProps> = ({ className = '' }) => {
  return (
    <div className="flex items-center h-16">
      <img 
        src="https://static.wixstatic.com/media/c0fd9f_126dd402ddaf44c3b5412a0b8b9ef55c~mv2.png"
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
  );
};