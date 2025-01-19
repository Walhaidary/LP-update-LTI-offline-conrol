import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Filter } from 'lucide-react';

interface KPIMetrics {
  kpi_id: string;
  kpi_name: string;
  department_name: string;
  total_tickets: number;
  resolved_tickets: number;
  overdue_tickets: number;
  avg_resolution_time: number | null;
  compliance_rate: number;
}

interface Filters {
  department: string;
  serviceProvider: string;
  startDate: string;
  endDate: string;
  status: string;
}

export function KPIWatch() {
  const [metrics, setMetrics] = useState<KPIMetrics[]>([]);
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

      const { data: kpis, error: kpisError } = await supabase
        .from('kpis')
        .select(`
          id,
          name,
          departments (
            name
          )
        `);

      if (kpisError) throw kpisError;

      const kpiMetrics = await Promise.all((kpis || []).map(async (kpi) => {
        let query = supabase
          .from('ticket_details_view')
          .select('*')
          .eq('kpi_name', kpi.name);

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

        const { data: tickets } = await query;

        const latestTickets = (tickets || []).reduce((acc, curr) => {
          if (!acc[curr.ticket_number] || new Date(curr.created_at) > new Date(acc[curr.ticket_number].created_at)) {
            acc[curr.ticket_number] = curr;
          }
          return acc;
        }, {} as Record<string, any>);

        const uniqueTickets = Object.values(latestTickets);

        // Calculate basic metrics
        const totalTickets = uniqueTickets.length;
        const resolvedTickets = uniqueTickets.filter(t => 
          t.status_name?.toLowerCase().includes('closed') || 
          t.status_name?.toLowerCase().includes('resolved')
        ).length;
        const overdueTickets = uniqueTickets.filter(t => {
          const dueDate = new Date(t.due_date);
          return dueDate < new Date() && !t.status_name?.toLowerCase().includes('closed');
        }).length;

        // Calculate average resolution time
        const leadTimes = uniqueTickets
          .filter(t => t.status_name?.toLowerCase().includes('closed'))
          .map(t => t.lead_time_days)
          .filter((days): days is number => days !== null);

        const avgResolutionTime = leadTimes.length > 0
          ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
          : null;

        // Calculate improved compliance rate
        let complianceRate = 100; // Start with perfect score

        if (totalTickets > 0) {
          // Calculate base metrics
          const openTickets = totalTickets - resolvedTickets;
          const onTimeResolved = uniqueTickets.filter(t => {
            const dueDate = new Date(t.due_date);
            const resolvedDate = t.status_changed_at ? new Date(t.status_changed_at) : null;
            return resolvedDate && resolvedDate <= dueDate;
          }).length;

          // Factors that affect compliance:
          // 1. Ratio of resolved to total tickets (40% weight)
          const resolutionRatio = resolvedTickets / totalTickets;
          
          // 2. Ratio of on-time resolutions to total resolved (30% weight)
          const onTimeRatio = resolvedTickets > 0 ? onTimeResolved / resolvedTickets : 0;
          
          // 3. Ratio of non-overdue to total tickets (30% weight)
          const overdueRatio = overdueTickets / totalTickets;

          // Calculate weighted compliance rate
          complianceRate = (
            (resolutionRatio * 40) +  // 40% weight for resolution ratio
            (onTimeRatio * 30) +      // 30% weight for on-time resolutions
            ((1 - overdueRatio) * 30) // 30% weight for non-overdue ratio
          );
        }

        return {
          kpi_id: kpi.id,
          kpi_name: kpi.name,
          department_name: kpi.departments?.name || '',
          total_tickets: totalTickets,
          resolved_tickets: resolvedTickets,
          overdue_tickets: overdueTickets,
          avg_resolution_time: avgResolutionTime,
          compliance_rate: complianceRate
        };
      }));

      setMetrics(kpiMetrics);
    } catch (err) {
      console.error('Error loading KPI metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load KPI metrics');
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
          <h3 className="text-lg font-medium mb-2">Total KPIs</h3>
          <p className="text-3xl font-bold text-primary">{metrics.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Total Tickets</h3>
          <p className="text-3xl font-bold text-green-600">
            {metrics.reduce((sum, kpi) => sum + kpi.total_tickets, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Resolved Tickets</h3>
          <p className="text-3xl font-bold text-blue-600">
            {metrics.reduce((sum, kpi) => sum + kpi.resolved_tickets, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Overdue Tickets</h3>
          <p className="text-3xl font-bold text-red-600">
            {metrics.reduce((sum, kpi) => sum + kpi.overdue_tickets, 0)}
          </p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">KPI</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Department</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Total</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Resolved</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Overdue</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Avg. Lead Time (Days)</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Compliance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.map((kpi) => (
                <tr key={kpi.kpi_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {kpi.kpi_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {kpi.department_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {kpi.total_tickets}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                    {kpi.resolved_tickets}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">
                    {kpi.overdue_tickets}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {kpi.avg_resolution_time !== null 
                      ? kpi.avg_resolution_time.toFixed(1) 
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`font-medium ${
                      kpi.compliance_rate >= 90 ? 'text-green-600' :
                      kpi.compliance_rate >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {kpi.compliance_rate.toFixed(1)}%
                    </span>
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