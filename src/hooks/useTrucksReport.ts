import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { SHIPMENT_STATUSES } from '../utils/constants';
import type { Database } from '../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

interface TrucksReport {
  status: string;
  count: number;
  shipments: ShipmentUpdate[];
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  transporter: string;
  destinationState: string;
  destinationLocality: string;
}

export function useTrucksReport() {
  const [reports, setReports] = useState<TrucksReport[]>([]);
  const [allUpdates, setAllUpdates] = useState<ShipmentUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (filters: ReportFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('shipments_updates')
        .select('*')
        .neq('status', 'arrived_to_destination') // Exclude arrived_to_destination status
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.transporter) {
        query = query.ilike('transporter', `%${filters.transporter}%`);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.destinationState) {
        query = query.ilike('destination_state', `%${filters.destinationState}%`);
      }
      if (filters.destinationLocality) {
        query = query.ilike('destination_locality', `%${filters.destinationLocality}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Store all updates for stage delay calculation
      setAllUpdates(data || []);

      // Group by status and get latest updates
      const latestBySerialNumber = data?.reduce((acc, curr) => {
        if (!acc[curr.serial_number] || new Date(curr.created_at) > new Date(acc[curr.serial_number].created_at)) {
          acc[curr.serial_number] = curr;
        }
        return acc;
      }, {} as Record<string, ShipmentUpdate>);

      // Group by status
      const groupedByStatus = Object.values(latestBySerialNumber || {}).reduce((acc, curr) => {
        if (!acc[curr.status]) {
          acc[curr.status] = [];
        }
        acc[curr.status].push(curr);
        return acc;
      }, {} as Record<string, ShipmentUpdate[]>);

      // Create report in the correct order, excluding arrived_to_destination
      const formattedReport = SHIPMENT_STATUSES
        .filter(status => status !== 'arrived_to_destination')
        .map(status => ({
          status,
          count: groupedByStatus[status]?.length || 0,
          shipments: groupedByStatus[status] || []
        }))
        .filter(report => report.count > 0);

      setReports(formattedReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setIsLoading(false);
    }
  };

  return { reports, allUpdates, isLoading, error, fetchReport };
}