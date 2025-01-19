import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { LTISTO } from '../types/lti-sto';

export function useLTIDetails() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLTIDetails = async (ltiNumber: string, ltiLine: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('lti_sto')
        .select('*')
        .eq('lti_number', ltiNumber)
        .eq('lti_line', ltiLine)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('LTI details not found');

      return {
        storageLocationName: data.origin_sl_desc,
        materialDescription: data.commodity_description,
        departure: data.origin_location,
        destination: data.destination_location,
        transporterName: data.transporter_name,
        unloadingPoint: data.destination_sl,
        consignee: data.consignee
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch LTI details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchLTIDetails, isLoading, error };
}