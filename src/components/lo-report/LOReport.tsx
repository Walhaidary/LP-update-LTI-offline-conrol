import React, { useState } from 'react';
import { LOReportTable } from './LOReportTable';
import { LOReportFilters } from './LOReportFilters';
import { useLOReport } from '../../hooks/useLOReport';

export function LOReport() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    transporter: '',
    destination: ''
  });

  const { data, isLoading, error, fetchReport } = useLOReport();

  React.useEffect(() => {
    fetchReport(filters);
  }, [filters]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Loading Order Report</h1>
      
      <LOReportFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <LOReportTable
        data={data}
        isLoading={isLoading}
      />
    </div>
  );
}