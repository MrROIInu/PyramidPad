import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const location = useLocation();
  
  const links = [
    { to: '/', label: 'Swap' },
    { to: '/tokens', label: 'Token List' },
    { to: '/latest', label: 'Latest Orders' },
    { to: '/my-orders', label: 'My Orders' }
  ];
  
  return (
    <div className="flex gap-4">
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          className={`px-4 py-2 rounded-lg transition-colors ${
            location.pathname === link.to
              ? 'bg-yellow-600 text-white'
              : 'text-yellow-600 hover:bg-yellow-600/10'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};