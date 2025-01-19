import React from 'react';
import { supabase } from '../lib/supabase';
import { loginUser } from '../lib/auth';
import { AUTH_CONSTANTS } from '../lib/auth/constants';
import type { UserProfile } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loginAttempts, setLoginAttempts] = React.useState(0);
  const [lockoutUntil, setLockoutUntil] = React.useState<number | null>(null);

  const handleLogin = async (email: string, password: string) => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000);
      throw new Error(`Too many login attempts. Please try again in ${remainingTime} seconds`);
    }

    try {
      const profile = await loginUser(email, password);
      setUser(profile);
      setLoginAttempts(0);
      setLockoutUntil(null);
      window.history.pushState({}, '', '/monitors');
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS) {
        const lockoutTime = Date.now() + (AUTH_CONSTANTS.LOCKOUT_DURATION * 1000);
        setLockoutUntil(lockoutTime);
        throw new Error(`Too many failed attempts. Please try again in ${AUTH_CONSTANTS.LOCKOUT_DURATION} seconds`);
      }

      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      // Clear local state first
      setUser(null);
      localStorage.clear(); // Clear all local storage
      sessionStorage.clear(); // Clear all session storage

      try {
        // Attempt to sign out without waiting for response
        await Promise.race([
          supabase.auth.signOut(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
      } catch (error) {
        // Ignore signOut errors - we've already cleared local state
      }
    } finally {
      // Always redirect to login page
      window.history.pushState({}, '', '/');
      window.location.reload(); // Force reload to clear any remaining state
    }
  };

  // Check initial auth state
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        // Always require fresh login
        if (session) {
          try {
            await supabase.auth.signOut();
          } catch {
            // Ignore signOut errors
          }
        }
        setUser(null);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, isLoading, login: handleLogin, logout: handleLogout };
}