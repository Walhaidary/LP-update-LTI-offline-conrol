import React, { useState, useEffect } from 'react';
import { DataTable } from '../table/DataTable';
import { supabase } from '../../lib/supabase';

const columns = [
  { 
    label: 'Ticket #', 
    field: 'ticket_number',
    format: (value: string) => (
      <a 
        href={`/ticketing/ticket/${value}`}
        className="text-primary hover:underline"
        onClick={(e) => {
          e.preventDefault();
          window.history.pushState({}, '', `/ticketing/ticket/${value}`);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      >
        {value}
      </a>
    )
  },
  { label: 'Title', field: 'title' },
  { label: 'Category', field: 'category_name' },
  { label: 'Department', field: 'department_name' },
  { label: 'KPI', field: 'kpi_name' },
  { label: 'Priority', field: 'priority' },
  { label: 'Status', field: 'status_name' },
  { 
    label: 'Due Date', 
    field: 'due_date',
    format: (value: string) => new Date(value).toLocaleDateString()
  },
  {
    label: 'Created By',
    field: 'created_by_name'
  },
  {
    label: 'Lead Time (Days)',
    field: 'lead_time_days',
    format: (value: number) => value?.toString() || '-'
  }
];

export function TeamTickets() {
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [kpis, setKPIs] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    kpi: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Load reference data
      const [deptData, kpiData, statusData] = await Promise.all([
        supabase.from('departments').select('id, name').order('name'),
        supabase.from('kpis').select('id, name').order('name'),
        supabase.from('statuses').select('id, name').order('name')
      ]);

      setDepartments(deptData.data || []);
      setKPIs(kpiData.data || []);
      setStatuses(statusData.data || []);

      // Get user's vendor code
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('vendor_code')
        .eq('id', user.id)
        .single();

      if (!userProfile?.vendor_code) {
        setTickets([]);
        return;
      }

      // Build query for tickets
      let query = supabase
        .from('ticket_details_view')
        .select('*')
        .eq('vendor_code', userProfile.vendor_code)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.department) {
        query = query.eq('department_name', filters.department);
      }
      if (filters.kpi) {
        query = query.eq('kpi_name', filters.kpi);
      }
      if (filters.status) {
        query = query.eq('status_name', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('due_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('due_date', filters.endDate);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      // Group by ticket number and get latest by created_at
      const latestVersions = data?.reduce((acc: any, curr: any) => {
        if (!acc[curr.ticket_number] || new Date(curr.created_at) > new Date(acc[curr.ticket_number].created_at)) {
          acc[curr.ticket_number] = curr;
        }
        return acc;
      }, {});

      setTickets(Object.values(latestVersions || {}));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">List of my Team Tickets</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={setFilters}
        transporters={[]} // Not needed for tickets
        searchPlaceholder="Search by title, category..."
        departments={departments}
        kpis={kpis}
        statuses={statuses}
        showTicketFilters={true}
      />
    </div>
  );
}