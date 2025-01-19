import React from 'react';
import { Filter } from 'lucide-react';

interface LOReportFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    transporter: string;
    destination: string;
  };
  onFilterChange: (filters: any) => void;
}

export function LOReportFilters({ filters, onFilterChange }: LOReportFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const handleReset = () => {
    onFilterChange({
      startDate: '',
      endDate: '',
      transporter: '',
      destination: ''
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-gray-50"
      >
        <Filter className="w-4 h-4" />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
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
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
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
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                value={filters.destination}
                onChange={(e) => onFilterChange({ ...filters, destination: e.target.value })}
                placeholder="Enter destination"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}