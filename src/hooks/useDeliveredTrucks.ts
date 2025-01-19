import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

interface DeliveredTrucksFilters {
  startDate: string;
  endDate: string;
  transporter: string;
  destinationState: string;
  destinationLocality: string;
}

export function useDeliveredTrucks() {
  const [trucks, setTrucks] = useState<ShipmentUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveredTrucks = async (filters: DeliveredTrucksFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('shipments_updates')
        .select('*')
        .eq('status', 'arrived_to_destination')
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

      // Get latest update for each serial number
      const latestBySerialNumber = data?.reduce((acc, curr) => {
        if (!acc[curr.serial_number] || new Date(curr.created_at) > new Date(acc[curr.serial_number].created_at)) {
          acc[curr.serial_number] = curr;
        }
        return acc;
      }, {} as Record<string, ShipmentUpdate>);

      setTrucks(Object.values(latestBySerialNumber || {}));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch delivered trucks');
    } finally {
      setIsLoading(false);
    }
  };

  return { trucks, isLoading, error, fetchDeliveredTrucks };
}