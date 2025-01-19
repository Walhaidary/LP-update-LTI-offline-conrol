import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

interface Filters {
  transporter: string;
  startDate: string;
  endDate: string;
}

export function useShipments() {
  const [shipments, setShipments] = useState<ShipmentUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = useCallback(async (filters: Filters) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('shipments_updates')
        .select('*')
        .eq('status', 'sc_approved')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.transporter) {
        query = query.eq('transporter', filters.transporter);
      }

      if (filters.startDate) {
        query = query.gte('approval_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('approval_date', filters.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setShipments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shipments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { shipments, isLoading, error, fetchShipments };
}