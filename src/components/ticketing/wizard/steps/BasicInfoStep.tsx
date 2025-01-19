import React, { useState, useEffect } from 'react';
import { FormField } from '../../../common/FormField';
import { getCategories, getDepartments, getKPIsByDepartment } from '../../../../lib/services/adminService';
import { supabase } from '../../../../lib/supabase';
import type { BasicInfo } from '../types';

interface BasicInfoStepProps {
  data: BasicInfo;
  onChange: (field: keyof BasicInfo, value: string) => void;
}

interface Category {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface KPI {
  id: string;
  name: string;
}

interface User {
  id: string;
  full_name: string;
  access_level: number;
}

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (data.department_name) {
      loadKPIs(data.department_name);
    } else {
      setKPIs([]);
    }
  }, [data.department_name]);

  // Set default dates when component mounts
  useEffect(() => {
    if (!data.incident_date || !data.due_date) {
      const now = new Date();
      const twoDaysFromNow = new Date(now);
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

      // Format dates as YYYY-MM-DDTHH:mm
      const currentDateTime = now.toISOString().slice(0, 16);
      const dueDatetime = twoDaysFromNow.toISOString().slice(0, 16);

      if (!data.incident_date) {
        onChange('incident_date', currentDateTime);
      }
      if (!data.due_date) {
        onChange('due_date', dueDatetime);
      }
    }
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load categories and departments
      const [categoriesData, departmentsData] = await Promise.all([
        getCategories(),
        getDepartments()
      ]);

      // Load assignable users using the secure function
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_assignable_users');

      if (usersError) throw usersError;
      
      setCategories(categoriesData);
      setDepartments(departmentsData);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadKPIs = async (departmentName: string) => {
    try {
      const kpisData = await getKPIsByDepartment(departmentName);
      setKPIs(kpisData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load KPIs');
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
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Category / Issue Type</label>
          <select
            value={data.category_name}
            onChange={(e) => onChange('category_name', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            value={data.department_name}
            onChange={(e) => onChange('department_name', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.name}>{department.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">KPI</label>
          <select
            value={data.kpi_name}
            onChange={(e) => onChange('kpi_name', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            required
            disabled={!data.department_name}
          >
            <option value="">
              {!data.department_name 
                ? 'Select department first' 
                : kpis.length === 0 
                ? 'No KPIs available for this department'
                : 'Select KPI'
              }
            </option>
            {kpis.map((kpi) => (
              <option key={kpi.id} value={kpi.name}>{kpi.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Assigned To</label>
          <select
            value={data.assigned_to}
            onChange={(e) => onChange('assigned_to', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Assignee</option>
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
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Due Date"
          description="When should this be resolved by"
          type="datetime-local"
          value={data.due_date}
          onChange={(value) => onChange('due_date', value)}
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            value={data.priority}
            onChange={(e) => onChange('priority', e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <FormField
        label="Date/Time of Incident"
        description="When did this issue occur"
        type="datetime-local"
        value={data.incident_date}
        onChange={(value) => onChange('incident_date', value)}
        required
      />
    </div>
  );
}