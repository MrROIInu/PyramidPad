import React from 'react';

interface PyramidPadLogoProps {
  className?: string;
}

export const PyramidPadLogo: React.FC<PyramidPadLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="https://static.wixstatic.com/media/c0fd9f_6435470665d74bd6ac00d9b3ce1473e9~mv2.png"
        alt="PyramidPad Logo"
        className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
      />
      <div className="flex items-center font-red-hat text-white ml-4">
        <span className="text-3xl sm:text-4xl font-bold">
          Pyramid
        </span>
        <span className="text-3xl sm:text-4xl font-normal italic">
          Pad
        </span>
      </div>
    </div>
  );
};