import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FormField } from '../common/FormField';
import { createCategory, getCategories } from '../../lib/services/adminService';
import { Notification } from '../common/Notification';

interface Category {
  id: string;
  name: string;
  description: string;
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createCategory(formData.name, formData.description);
      setSuccess('Category created successfully');
      setFormData({ name: '', description: '' });
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
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
        <h2 className="text-lg font-medium mb-4">Add Category</h2>

        {error && <Notification type="error" message={error} />}
        {success && <Notification type="success" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Category Name"
            description="Enter the category name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
          />
          <FormField
            label="Description"
            description="Enter category description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 text-sm">{category.name}</td>
                <td className="px-6 py-4 text-sm">{category.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}