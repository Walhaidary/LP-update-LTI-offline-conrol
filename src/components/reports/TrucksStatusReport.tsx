import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { useTrucksReport } from '../../hooks/useTrucksReport';
import { ReportFilters } from './ReportFilters';
import { StatusGroup } from './StatusGroup';

export function TrucksStatusReport() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    transporter: '',
    destinationState: '',
    destinationLocality: ''
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { reports, allUpdates, isLoading, error, fetchReport } = useTrucksReport();

  // Initial fetch without filters
  React.useEffect(() => {
    fetchReport(appliedFilters);
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    fetchReport(filters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      startDate: '',
      endDate: '',
      transporter: '',
      destinationState: '',
      destinationLocality: ''
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    fetchReport(resetFilters);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <ReportFilters
          filters={filters}
          onFilterChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          reports={reports}
          allUpdates={allUpdates}
        />
      )}

      <div className="grid gap-6">
        {reports.map((report) => (
          <StatusGroup
            key={report.status}
            status={report.status}
            count={report.count}
            shipments={report.shipments}
            allUpdates={allUpdates}
          />
        ))}
      </div>
    </div>
  );
}