import React from 'react';

interface PyramidPadLogoProps {
  className?: string;
}

export const PyramidPadLogo: React.FC<PyramidPadLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="https://static.wixstatic.com/media/c0fd9f_7392d831491244f2ba29b710ba24d909~mv2.png"
        alt="PyramidPad Logo"
        className="w-12 h-12 object-contain"
      />
      <div className="flex items-baseline font-red-hat text-white">
        <span className="text-2xl font-bold">
          Pyramid
        </span>
        <span className="text-2xl font-normal italic">
          Pad
        </span>
      </div>
    </div>
  );
};