import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

interface LTIOption {
  ltiNumber: string;
  lineNumber: string;
  transporter: string;
  destination: string;
}

export function useLTINumbers() {
  const [ltiOptions, setLTIOptions] = useState<LTIOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLTINumbers = async (searchTerm: string) => {
    if (!searchTerm) {
      setLTIOptions([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('lti_sto')
        .select('lti_number, lti_line, transporter_name, destination_location')
        .ilike('lti_number', `%${searchTerm}%`)
        .order('lti_number', { ascending: true })
        .limit(10);

      if (fetchError) throw fetchError;

      const options = (data || []).map((item) => ({
        ltiNumber: item.lti_number,
        lineNumber: item.lti_line,
        transporter: item.transporter_name,
        destination: item.destination_location
      }));

      setLTIOptions(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch LTI numbers');
    } finally {
      setIsLoading(false);
    }
  };

  return { ltiOptions, isLoading, error, searchLTINumbers };
}