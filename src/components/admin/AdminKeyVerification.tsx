import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAdminKey } from '../../hooks/useAdminKey';
import { Notification } from '../common/Notification';

export function AdminKeyVerification() {
  const [key, setKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, verifyKey } = useAdminKey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!key.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      verifyKey(key.trim());
      setKey(''); // Clear input after submission
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-center mb-6">Admin Verification Required</h2>

      {error && <Notification type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Key
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter admin key"
            required
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !key.trim()}
          className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
}