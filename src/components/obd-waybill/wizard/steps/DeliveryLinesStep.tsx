import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import type { DeliveryLine } from '../types';

interface LTILine {
  lti_number: string;
  lti_line: string;
  commodity_description: string;
  batch_number: string;
  lti_qty_net: number;
}

interface DeliveryLinesStepProps {
  ltiNumber: string;
  lines: DeliveryLine[];
  onLinesLoad: (lines: DeliveryLine[]) => void;
  onAddLine: () => void;
  onRemoveLine: (id: string) => void;
  onLineChange: (id: string, field: keyof DeliveryLine, value: string) => void;
}

export function DeliveryLinesStep({ 
  ltiNumber,
  lines, 
  onLinesLoad,
  onAddLine,
  onRemoveLine,
  onLineChange
}: DeliveryLinesStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ltiLines, setLTILines] = useState<LTILine[]>([]);

  // Fetch LTI lines when ltiNumber changes
  useEffect(() => {
    const fetchLTILines = async () => {
      if (!ltiNumber) return;

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('lti_sto')
          .select('lti_number, lti_line, commodity_description, batch_number, lti_qty_net')
          .eq('lti_number', ltiNumber)
          .order('lti_line', { ascending: true });

        if (fetchError) throw fetchError;
        setLTILines(data || []);
      } catch (err) {
        console.error('Error fetching LTI lines:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch LTI lines');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLTILines();
  }, [ltiNumber]);

  // Handle gate number change to update storage location
  const handleGateNumberChange = (lineId: string, gateNumber: string) => {
    onLineChange(lineId, 'gateNumber', gateNumber);
    onLineChange(lineId, 'storageLocationName', gateNumber); // Automatically sync storage location
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {lines.map((line) => (
        <div key={line.id} className="bg-gray-50 p-6 rounded-lg relative">
          <button
            onClick={() => onRemoveLine(line.id)}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500"
            title="Remove line"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">OBD Line Number</label>
              <input
                type="text"
                value={line.outboundDeliveryItemNumber}
                disabled
                className="mt-1 w-full px-3 py-2 bg-gray-100 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LTI/STO Line</label>
              <select
                value={line.ltiLine || ''}
                onChange={(e) => {
                  const selectedLine = ltiLines.find(l => l.lti_line === e.target.value);
                  if (selectedLine) {
                    onLineChange(line.id, 'ltiLine', e.target.value);
                    onLineChange(line.id, 'materialDescription', selectedLine.commodity_description);
                    onLineChange(line.id, 'batchNumber', selectedLine.batch_number || '');
                  }
                }}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select LTI Line</option>
                {ltiLines.map((ltiLine) => (
                  <option key={ltiLine.lti_line} value={ltiLine.lti_line}>
                    Line {ltiLine.lti_line} - {ltiLine.commodity_description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Commodity</label>
              <input
                type="text"
                value={line.materialDescription}
                disabled
                className="mt-1 w-full px-3 py-2 bg-gray-100 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch Number</label>
              <input
                type="text"
                value={line.batchNumber || ''}
                disabled
                className="mt-1 w-full px-3 py-2 bg-gray-100 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Units</label>
              <input
                type="number"
                step="1"
                value={line.units || ''}
                onChange={(e) => onLineChange(line.id, 'units', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">MT Net</label>
              <input
                type="number"
                step="0.001"
                value={line.mtNet}
                onChange={(e) => onLineChange(line.id, 'mtNet', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gate Number</label>
              <input
                type="text"
                value={line.gateNumber}
                onChange={(e) => handleGateNumberChange(line.id, e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Storage Location</label>
              <input
                type="text"
                value={line.storageLocationName || line.gateNumber}
                disabled
                className="mt-1 w-full px-3 py-2 bg-gray-100 border rounded-md"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddLine}
        className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Line
      </button>
    </div>
  );
}