import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { FormField } from '../common/FormField';
import { Pagination } from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { createDepartment, getDepartments } from '../../lib/services/adminService';
import { Notification } from '../common/Notification';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  created_at: string;
}

export function DepartmentManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    paginate,
    totalPages,
  } = usePagination(10);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createDepartment(formData.name, formData.description);
      setSuccess('Department created successfully');
      setFormData({ name: '', description: '' });
      loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create department');
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
        <h2 className="text-lg font-medium mb-4">Add Department</h2>
        
        {error && <Notification type="error" message={error} />}
        {success && <Notification type="success" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Department Name"
            description="Enter the department name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
          />
          <FormField
            label="Description"
            description="Enter department description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{dept.name}</td>
                <td className="px-6 py-4 text-sm">{dept.code}</td>
                <td className="px-6 py-4 text-sm">{dept.description}</td>
                <td className="px-6 py-4 text-sm">
                  {new Date(dept.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages(departments.length)}
          itemsPerPage={itemsPerPage}
          totalItems={departments.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}