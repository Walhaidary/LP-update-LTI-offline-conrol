import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FormField } from '../common/FormField';
import { createStatus, getStatuses, getCategories } from '../../lib/services/adminService';
import { Notification } from '../common/Notification';

interface Status {
  id: string;
  name: string;
  category: string;
  description: string;
  is_default: boolean;
}

interface Category {
  id: string;
  name: string;
}

export function StatusManager() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    is_default: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statusesData, categoriesData] = await Promise.all([
        getStatuses(),
        getCategories()
      ]);
      setStatuses(statusesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createStatus(formData.name, formData.category, formData.description, formData.is_default);
      setSuccess('Status created successfully');
      setFormData({ name: '', category: '', description: '', is_default: false });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-medium mb-4">Add Status</h2>

        {error && <Notification type="error" message={error} />}
        {success && <Notification type="success" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Status Name"
              description="Enter the status name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category / Issue Type</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          <FormField
            label="Description"
            description="Enter status description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default status
            </label>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4" />
            Add Status
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Default</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {statuses.map((status) => (
              <tr key={status.id}>
                <td className="px-6 py-4 text-sm">{status.name}</td>
                <td className="px-6 py-4 text-sm">{status.category}</td>
                <td className="px-6 py-4 text-sm">{status.description}</td>
                <td className="px-6 py-4 text-sm">
                  {status.is_default ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}