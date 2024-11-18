import React from 'react';

interface PyramidPadLogoProps {
  className?: string;
}

export const PyramidPadLogo: React.FC<PyramidPadLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src="https://static.wixstatic.com/media/c0fd9f_6435470665d74bd6ac00d9b3ce1473e9~mv2.png"
        alt="PyramidPad Logo"
        className="w-48 h-48 object-contain"
      />
      <div className="flex items-center font-red-hat text-white mt-2">
        <span className="text-5xl font-bold">
          Pyramid
        </span>
        <span className="text-5xl font-normal italic">
          Pad
        </span>
      </div>
    </div>
  );
};