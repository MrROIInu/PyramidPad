import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="flex gap-4">
      <Link
        to="/"
        className={`px-4 py-2 rounded-lg transition-colors ${
          location.pathname === '/'
            ? 'bg-yellow-600 text-white'
            : 'text-yellow-600 hover:bg-yellow-600/10'
        }`}
      >
        Swap
      </Link>
      <Link
        to="/tokens"
        className={`px-4 py-2 rounded-lg transition-colors ${
          location.pathname === '/tokens'
            ? 'bg-yellow-600 text-white'
            : 'text-yellow-600 hover:bg-yellow-600/10'
        }`}
      >
        Token List
      </Link>
    </div>
  );
};