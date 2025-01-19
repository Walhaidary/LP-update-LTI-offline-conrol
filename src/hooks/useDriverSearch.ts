import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

interface DriverOption {
  serialNumber: string;
  driverName: string;
  driverPhone: string;
  vehicle: string;
}

export function useDriverSearch() {
  const [driverOptions, setDriverOptions] = useState<DriverOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDrivers = async (searchTerm: string) => {
    if (!searchTerm) {
      setDriverOptions([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('shipments_updates')
        .select('serial_number, driver_name, driver_phone, vehicle')
        .ilike('serial_number', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      // Get unique drivers by serial number
      const uniqueDrivers = data?.reduce((acc, curr) => {
        if (!acc[curr.serial_number]) {
          acc[curr.serial_number] = {
            serialNumber: curr.serial_number,
            driverName: curr.driver_name,
            driverPhone: curr.driver_phone,
            vehicle: curr.vehicle
          };
        }
        return acc;
      }, {} as Record<string, DriverOption>);

      setDriverOptions(Object.values(uniqueDrivers || {}));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drivers');
    } finally {
      setIsLoading(false);
    }
  };

  return { driverOptions, isLoading, error, searchDrivers };
}