import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FormField } from '../common/FormField';
import { createKPI, getKPIs, getDepartments } from '../../lib/services/adminService';
import { Notification } from '../common/Notification';

interface KPI {
  id: string;
  name: string;
  department_id: string;
  description: string;
  departments: {
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

export function KPIManager() {
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [kpisData, departmentsData] = await Promise.all([
        getKPIs(),
        getDepartments()
      ]);
      setKPIs(kpisData);
      setDepartments(departmentsData);
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
      await createKPI(formData.name, formData.department_id, formData.description);
      setSuccess('KPI created successfully');
      setFormData({ name: '', department_id: '', description: '' });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create KPI');
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
        <h2 className="text-lg font-medium mb-4">Add KPI</h2>

        {error && <Notification type="error" message={error} />}
        {success && <Notification type="success" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="KPI Name"
              description="Enter the KPI name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          <FormField
            label="Description"
            description="Enter KPI description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4" />
            Add KPI
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Department</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {kpis.map((kpi) => (
              <tr key={kpi.id}>
                <td className="px-6 py-4 text-sm">{kpi.name}</td>
                <td className="px-6 py-4 text-sm">{kpi.departments?.name}</td>
                <td className="px-6 py-4 text-sm">{kpi.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}