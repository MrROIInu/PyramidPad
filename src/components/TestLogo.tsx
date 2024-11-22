import React from 'react';

interface TestLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const TestLogo: React.FC<TestLogoProps> = ({ className = '', size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-xs px-1.5 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5'
  };

  return (
    <span className={`bg-red-600/20 text-red-500 ${sizeClasses[size]} rounded-full font-semibold border border-red-500/30 ${className}`}>
      TEST
    </span>
  );
};