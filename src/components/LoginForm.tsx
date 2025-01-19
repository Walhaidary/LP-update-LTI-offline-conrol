import React, { useState } from 'react';
import { InputField } from './common/InputField';
import { Notification } from './common/Notification';
import type { UserProfile } from '../lib/auth';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegisterClick: () => void;
}

export function LoginForm({ onLogin, onRegisterClick }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center p-8 md:p-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onRegisterClick}
              className="text-[#0088CC] hover:text-[#0077B3] font-medium"
            >
              Create one
            </button>
          </p>
        </div>

        {error && <Notification type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField 
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
          />
          <InputField 
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={setPassword}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0088CC] text-white py-2 px-4 rounded text-base hover:bg-[#0077B3] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}