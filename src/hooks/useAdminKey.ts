import { useState, useEffect } from 'react';

const ADMIN_KEY = '733153303';
const STORAGE_KEY = 'admin_verification';

export function useAdminKey() {
  const [isVerified, setIsVerified] = useState(() => {
    // Initialize from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });
  const [error, setError] = useState<string | null>(null);

  const verifyKey = (key: string): boolean => {
    setError(null);
    
    if (key === ADMIN_KEY) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsVerified(true);
      return true;
    }
    
    localStorage.removeItem(STORAGE_KEY);
    setIsVerified(false);
    setError('Invalid admin key');
    return false;
  };

  const clearVerification = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsVerified(false);
    setError(null);
  };

  // Sync state with localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setIsVerified(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    isVerified,
    error,
    verifyKey,
    clearVerification
  };
}