import React, { useState } from 'react';
import { DateRangeFilter } from './DateRangeFilter';
import { TransporterFilter } from './TransporterFilter';
import type { FilterState } from '../../../types';

interface TableFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  transporters: string[];
  departments?: { id: string; name: string; }[];
  kpis?: { id: string; name: string; }[];
  statuses?: { id: string; name: string; }[];
  showTicketFilters?: boolean;
}

export function TableFilters({ 
  filters, 
  onFilterChange, 
  transporters,
  departments = [],
  kpis = [],
  statuses = [],
  showTicketFilters = false
}: TableFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      transporter: '',
      startDate: '',
      endDate: '',
      destination: '',
      commodity: '',
      department: '',
      kpi: '',
      status: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="p-6 border border-[#CCCCCC] rounded bg-white">
      <div className="grid gap-6">
        {/* Filter Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Options</h3>
          
          <div className="grid gap-4">
            {!showTicketFilters && (
              <>
                <TransporterFilter
                  value={localFilters.transporter}
                  onChange={(transporter) => setLocalFilters({ ...localFilters, transporter })}
                  transporters={transporters}
                />
                
                <DateRangeFilter
                  startDate={localFilters.startDate}
                  endDate={localFilters.endDate}
                  onStartDateChange={(startDate) => setLocalFilters({ ...localFilters, startDate })}
                  onEndDateChange={(endDate) => setLocalFilters({ ...localFilters, endDate })}
                />
              </>
            )}

            {showTicketFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    value={localFilters.department}
                    onChange={(e) => setLocalFilters({ ...localFilters, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    KPI
                  </label>
                  <select
                    value={localFilters.kpi}
                    onChange={(e) => setLocalFilters({ ...localFilters, kpi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All KPIs</option>
                    {kpis.map((kpi) => (
                      <option key={kpi.id} value={kpi.name}>{kpi.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={localFilters.status}
                    onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Statuses</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.name}>{status.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Due Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={localFilters.startDate}
                      onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <input
                      type="date"
                      value={localFilters.endDate}
                      onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-hover rounded transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}