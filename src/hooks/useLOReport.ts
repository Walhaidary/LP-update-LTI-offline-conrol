import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { LOReportData } from '../types/lo-report';

interface LOReportFilters {
  startDate: string;
  endDate: string;
  transporter: string;
  destination: string;
}

export function useLOReport() {
  const [data, setData] = useState<LOReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (filters: LOReportFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('obd_waybill')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.startDate) {
        query = query.gte('loading_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('loading_date', filters.endDate);
      }
      if (filters.transporter) {
        query = query.ilike('transporter_name', `%${filters.transporter}%`);
      }
      if (filters.destination) {
        query = query.ilike('destination', `%${filters.destination}%`);
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fetchReport };
}