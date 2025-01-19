import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface LTILine {
  lineNumber: string;
  materialDescription: string;
  storageLocation: string;
  batchNumber: string | null;
}

interface LTILinesCache {
  [ltiNumber: string]: {
    lines: LTILine[];
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache: LTILinesCache = {};

export function useLTILines() {
  const [lines, setLines] = useState<LTILine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLTILines = useCallback(async (ltiNumber: string) => {
    if (!ltiNumber) {
      setLines([]);
      return;
    }

    // Check cache first
    const cached = cache[ltiNumber];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setLines(cached.lines);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('lti_sto')
        .select('lti_line, commodity_description, origin_sl_desc, batch_number')
        .eq('lti_number', ltiNumber)
        .order('lti_line', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedLines = (data || []).map(item => ({
        lineNumber: item.lti_line,
        materialDescription: item.commodity_description || '',
        storageLocation: item.origin_sl_desc,
        batchNumber: item.batch_number
      }));

      // Update cache
      cache[ltiNumber] = {
        lines: formattedLines,
        timestamp: Date.now()
      };

      setLines(formattedLines);
    } catch (err) {
      console.error('Error fetching LTI lines:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch LTI lines');
      setLines([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { lines, isLoading, error, fetchLTILines };
}