import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserKPIMetrics {
  kpi_name: string;
  department_name: string;
  total_tickets: number;
  resolved_tickets: number;
  overdue_tickets: number;
  avg_resolution_time: number | null;
  compliance_rate: number;
}

interface UserKPIReportProps {
  userId: string;
  userName: string;
  onBack: () => void;
}

export function UserKPIReport({ userId, userName, onBack }: UserKPIReportProps) {
  const [metrics, setMetrics] = useState<UserKPIMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserKPIMetrics();
  }, [userId]);

  const loadUserKPIMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all KPIs first
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

      // Get metrics for each KPI
      const kpiMetrics = await Promise.all((kpis || []).map(async (kpi) => {
        // Get tickets assigned to user for this KPI
        const { data: tickets } = await supabase
          .from('ticket_details_view')
          .select('*')
          .eq('assigned_to', userId)
          .eq('kpi_name', kpi.name);

        const uniqueTickets = (tickets || []).reduce((acc, curr) => {
          if (!acc[curr.ticket_number] || new Date(curr.created_at) > new Date(acc[curr.ticket_number].created_at)) {
            acc[curr.ticket_number] = curr;
          }
          return acc;
        }, {} as Record<string, any>);

        const ticketList = Object.values(uniqueTickets);

        // Calculate metrics
        const totalTickets = ticketList.length;
        const resolvedTickets = ticketList.filter(t => 
          t.status_name?.toLowerCase().includes('closed') || 
          t.status_name?.toLowerCase().includes('resolved')
        ).length;
        const overdueTickets = ticketList.filter(t => {
          const dueDate = new Date(t.due_date);
          return dueDate < new Date() && !t.status_name?.toLowerCase().includes('closed');
        }).length;

        // Calculate average resolution time
        const leadTimes = ticketList
          .filter(t => t.status_name?.toLowerCase().includes('closed'))
          .map(t => t.lead_time_days)
          .filter((days): days is number => days !== null);

        const avgResolutionTime = leadTimes.length > 0
          ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
          : null;

        // Calculate compliance rate
        let complianceRate = 100;

        if (totalTickets > 0) {
          const onTimeResolved = ticketList.filter(t => {
            const dueDate = new Date(t.due_date);
            const resolvedDate = t.status_changed_at ? new Date(t.status_changed_at) : null;
            return resolvedDate && resolvedDate <= dueDate;
          }).length;

          const resolutionRatio = resolvedTickets / totalTickets;
          const onTimeRatio = resolvedTickets > 0 ? onTimeResolved / resolvedTickets : 0;
          const overdueRatio = overdueTickets / totalTickets;

          complianceRate = (
            (resolutionRatio * 40) +
            (onTimeRatio * 30) +
            ((1 - overdueRatio) * 30)
          );
        }

        return {
          kpi_name: kpi.name,
          department_name: kpi.departments?.name || '',
          total_tickets: totalTickets,
          resolved_tickets: resolvedTickets,
          overdue_tickets: overdueTickets,
          avg_resolution_time: avgResolutionTime,
          compliance_rate: complianceRate
        };
      }));

      setMetrics(kpiMetrics.filter(m => m.total_tickets > 0)); // Only show KPIs with tickets
    } catch (err) {
      console.error('Error loading user KPI metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user KPI metrics');
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">KPI Performance Report - {userName}</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Active KPIs</h3>
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

      {/* KPI Performance Table */}
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
                <tr key={kpi.kpi_name} className="hover:bg-gray-50">
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