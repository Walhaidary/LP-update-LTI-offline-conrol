import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { AttachmentInfo } from '../types';

interface AttachmentsStepProps {
  data: AttachmentInfo;
  onChange: (field: keyof AttachmentInfo, value: string) => void;
  categoryName: string;
}

export function AttachmentsStep({ data, onChange, categoryName }: AttachmentsStepProps) {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (categoryName) {
      loadStatuses(categoryName);
    } else {
      setStatuses([]);
    }
  }, [categoryName]);

  const loadData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user profile to check access level
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setCurrentUser(profile);

      // Load assignable users using the secure function
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_assignable_users');

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    }
  };

  const loadStatuses = async (category: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: statusesData, error: statusError } = await supabase
        .from('statuses')
        .select('*')
        .eq('category', category)
        .order('name');

      if (statusError) throw statusError;
      setStatuses(statusesData || []);
      
      // Set default status if available and no status is selected
      if (!data.status && statusesData.length > 0) {
        const defaultStatus = statusesData.find(s => s.is_default);
        if (defaultStatus) {
          onChange('status', defaultStatus.name);
        }
      }
    } catch (err) {
      console.error('Error loading statuses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statuses');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has permission to edit accountability
  const canEditAccountability = currentUser?.access_level >= 4;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block font-medium">Accountability</label>
        <p className="text-sm text-gray-500">
          Select who is accountable for this issue (optional)
          {!canEditAccountability && (
            <span className="block text-amber-600">
              Only WH Managers and Admins can set accountability
            </span>
          )}
        </p>
        <select
          value={data.accountability}
          onChange={(e) => onChange('accountability', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary ${
            !canEditAccountability ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          disabled={!canEditAccountability}
        >
          <option value="">Select Accountable User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </select>
        {users.length === 0 && (
          <p className="text-sm text-amber-600 mt-1">
            No eligible users found
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Status</label>
        <p className="text-sm text-gray-500">Current status of the ticket</p>
        <select
          value={data.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
          required
          disabled={isLoading || !categoryName}
        >
          <option value="">
            {!categoryName 
              ? 'Select category first'
              : isLoading 
              ? 'Loading statuses...'
              : 'Select status'
            }
          </option>
          {statuses.map((status) => (
            <option key={status.id} value={status.name}>
              {status.name}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        {statuses.length === 0 && categoryName && !isLoading && (
          <p className="text-sm text-amber-600 mt-1">
            No statuses found for this category. Please contact an administrator.
          </p>
        )}
      </div>
    </div>
  );
}