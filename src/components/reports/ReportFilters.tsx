import React from 'react';
import { FileDown } from 'lucide-react';
import { generateTrucksStatusPDF } from '../../utils/pdf';
import type { Database } from '../../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

interface ReportFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    transporter: string;
    destinationState: string;
    destinationLocality: string;
  };
  onFilterChange: (filters: any) => void;
  onApply: () => void;
  onReset: () => void;
  reports: { status: string; shipments: ShipmentUpdate[] }[];
  allUpdates: ShipmentUpdate[];
}

export function ReportFilters({ 
  filters, 
  onFilterChange, 
  onApply, 
  onReset,
  reports,
  allUpdates
}: ReportFiltersProps) {
  const handleDownloadPDF = () => {
    generateTrucksStatusPDF(reports, allUpdates);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transporter
          </label>
          <input
            type="text"
            value={filters.transporter}
            onChange={(e) => onFilterChange({ ...filters, transporter: e.target.value })}
            placeholder="Enter transporter name"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination State
          </label>
          <input
            type="text"
            value={filters.destinationState}
            onChange={(e) => onFilterChange({ ...filters, destinationState: e.target.value })}
            placeholder="Enter destination state"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Locality
          </label>
          <input
            type="text"
            value={filters.destinationLocality}
            onChange={(e) => onFilterChange({ ...filters, destinationLocality: e.target.value })}
            placeholder="Enter destination locality"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Download PDF
        </button>

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}