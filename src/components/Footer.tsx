import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t border-yellow-600/20">
      <div className="container mx-auto px-4 text-center">
        <p className="text-yellow-600">
          ©GlyphSwap 2024. Support:{' '}
          <a 
            href="https://discord.gg/pwBMDDzWWG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            Join our Discord
          </a>
        </p>
      </div>
    </footer>
  );
};