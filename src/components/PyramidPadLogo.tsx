import React from 'react';

interface PyramidPadLogoProps {
  className?: string;
}

export const PyramidPadLogo: React.FC<PyramidPadLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="https://static.wixstatic.com/media/c0fd9f_cf507bbf62e14773804d8c2538090fdd~mv2.png"
        alt="PyramidPad Logo"
        className="w-32 h-32 object-contain"
      />
      <div className="flex items-center font-red-hat text-white ml-1">
        <span className="text-4xl font-bold">
          Pyramid
        </span>
        <span className="text-4xl font-normal italic">
          Pad
        </span>
      </div>
    </div>
  );
};