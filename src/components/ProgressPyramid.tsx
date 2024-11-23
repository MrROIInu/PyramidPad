import React from 'react';

interface ProgressPyramidProps {
  progress: number;
}

export const ProgressPyramid: React.FC<ProgressPyramidProps> = ({ progress }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="relative w-full max-w-md aspect-[4/3] mx-auto">
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 75" className="w-full h-full">
          <defs>
            <linearGradient id="pyramidGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
          </defs>
          
          {/* Base pyramid (outline) */}
          <path 
            d="M50 0 L100 75 L0 75 Z" 
            fill="rgba(184, 134, 11, 0.2)"
            stroke="#B8860B"
            strokeWidth="0.5"
          />

          {/* Grid lines */}
          <g stroke="rgba(184, 134, 11, 0.3)" strokeWidth="0.2">
            <line x1="50" y1="0" x2="0" y2="75" />
            <line x1="50" y1="0" x2="100" y2="75" />
            <line x1="25" y1="37.5" x2="75" y2="37.5" />
            <line x1="12.5" y1="56.25" x2="87.5" y2="56.25" />
          </g>
          
          {/* Progress fill */}
          <path 
            d="M50 0 L100 75 L0 75 Z" 
            fill="url(#pyramidGradient)"
            style={{
              clipPath: `polygon(0% ${100 - normalizedProgress}%, 100% ${100 - normalizedProgress}%, 100% 100%, 0% 100%)`,
              transition: 'clip-path 1s ease-in-out'
            }}
          />
        </svg>
      </div>
    </div>
  );
};