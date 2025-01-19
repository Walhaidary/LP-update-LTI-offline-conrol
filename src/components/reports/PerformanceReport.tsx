import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader, Filter } from 'lucide-react';
import { UserKPIReport } from './UserKPIReport';

interface UserMetrics {
  user_id: string;
  full_name: string;
  assigned_tickets: number;
  accountable_tickets: number;
  resolved_tickets: number;
  reopened_tickets: number;
  avg_resolution_time: number | null;
  overdue_tickets: number;
}

interface Filters {
  department: string;
  serviceProvider: string;
  startDate: string;
  endDate: string;
  status: string;
}

export function PerformanceReport() {
  const [metrics, setMetrics] = useState<UserMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    department: '',
    serviceProvider: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [departments, setDepartments] = useState<{ id: string; name: string; }[]>([]);
  const [serviceProviders, setServiceProviders] = useState<{ id: string; name: string; }[]>([]);
  const [statuses, setStatuses] = useState<{ id: string; name: string; }[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; } | null>(null);

  useEffect(() => {
    loadReferenceData();
    loadMetrics();
  }, [filters]);

  const loadReferenceData = async () => {
    try {
      const [deptData, providerData, statusData] = await Promise.all([
        supabase.from('departments').select('id, name').order('name'),
        supabase.from('service_providers').select('id, name').order('name'),
        supabase.from('statuses').select('id, name').order('name')
      ]);

      if (deptData.error) throw deptData.error;
      if (providerData.error) throw providerData.error;
      if (statusData.error) throw statusData.error;

      setDepartments(deptData.data || []);
      setServiceProviders(providerData.data || []);
      setStatuses(statusData.data || []);
    } catch (err) {
      console.error('Error loading reference data:', err);
    }
  };

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all assignable users first
      const { data: users, error: usersError } = await supabase
        .rpc('get_assignable_users');

      if (usersError) throw usersError;

      // For each user, get their metrics with filters
      const userMetrics = await Promise.all((users || []).map(async (user) => {
        let query = supabase
          .from('ticket_details_view')
          .select('*');

        // Apply filters
        if (filters.department) {
          query = query.eq('department_name', filters.department);
        }
        if (filters.serviceProvider) {
          query = query.eq('vendor_code', filters.serviceProvider);
        }
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate);
        }
        if (filters.status) {
          query = query.eq('status_name', filters.status);
        }

        // Get tickets where user is assigned
        const { data: assignedTickets } = await query
          .eq('assigned_to', user.id)
          .order('created_at', { ascending: true });

        // Get tickets where user is accountable
        const { data: accountableTickets } = await query
          .eq('accountability', user.id);

        // Get unique tickets by ticket number (latest version)
        const latestTickets = (assignedTickets || []).reduce((acc, curr) => {
          if (!acc[curr.ticket_number] || new Date(curr.created_at) > new Date(acc[curr.ticket_number].created_at)) {
            acc[curr.ticket_number] = curr;
          }
          return acc;
        }, {} as Record<string, any>);

        const uniqueTickets = Object.values(latestTickets);

        // Calculate metrics
        const resolved = uniqueTickets.filter(t => t.status_name?.toLowerCase().includes('closed')).length;
        const reopened = uniqueTickets.filter(t => t.status_name?.toLowerCase().includes('reopened')).length;
        const overdue = uniqueTickets.filter(t => {
          const dueDate = new Date(t.due_date);
          return dueDate < new Date() && !t.status_name?.toLowerCase().includes('closed');
        }).length;

        // Calculate average lead time for all tickets
        const leadTimes = uniqueTickets
          .map(t => t.lead_time_days)
          .filter((days): days is number => days !== null);

        const avgResolutionTime = leadTimes.length > 0
          ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
          : null;

        return {
          user_id: user.id,
          full_name: user.full_name,
          assigned_tickets: uniqueTickets.length,
          accountable_tickets: accountableTickets?.length || 0,
          resolved_tickets: resolved,
          reopened_tickets: reopened,
          avg_resolution_time: avgResolutionTime,
          overdue_tickets: overdue
        };
      }));

      setMetrics(userMetrics);
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load performance metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      department: '',
      serviceProvider: '',
      startDate: '',
      endDate: '',
      status: ''
    });
  };

  const handleUserClick = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
  };

  if (selectedUser) {
    return (
      <UserKPIReport 
        userId={selectedUser.id} 
        userName={selectedUser.name}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Provider
              </label>
              <select
                value={filters.serviceProvider}
                onChange={(e) => handleFilterChange('serviceProvider', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">All Service Providers</option>
                {serviceProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.name}>{status.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 mr-3"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-primary">{metrics.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Total Tickets</h3>
          <p className="text-3xl font-bold text-green-600">
            {metrics.reduce((sum, user) => sum + user.assigned_tickets, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Resolved Tickets</h3>
          <p className="text-3xl font-bold text-blue-600">
            {metrics.reduce((sum, user) => sum + user.resolved_tickets, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Overdue Tickets</h3>
          <p className="text-3xl font-bold text-red-600">
            {metrics.reduce((sum, user) => sum + user.overdue_tickets, 0)}
          </p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Assigned</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Accountable</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Resolved</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Reopened</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Avg. Lead Time (Days)</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <button
                      onClick={() => handleUserClick(user.user_id, user.full_name)}
                      className="text-primary hover:underline focus:outline-none"
                    >
                      {user.full_name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {user.assigned_tickets}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {user.accountable_tickets}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                    {user.resolved_tickets}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-amber-600 font-medium">
                    {user.reopened_tickets}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {user.avg_resolution_time !== null 
                      ? user.avg_resolution_time.toFixed(1) 
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">
                    {user.overdue_tickets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}