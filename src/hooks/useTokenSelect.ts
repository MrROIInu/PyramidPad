import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Token } from '../types';

export const useTokenSelect = (onTokenSelect: (token: Token) => void) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      // Handle token selection from URL parameter
      // This will be called by the parent component
      onTokenSelect(tokenParam);
    }
  }, [searchParams, onTokenSelect]);

  const handleTokenSelect = (token: Token) => {
    navigate(`/?token=${token.symbol}`, { replace: true });
    onTokenSelect(token);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { handleTokenSelect };
};