import React from 'react';
import { DataTable } from '../components/table/DataTable';
import { ExcelUpload } from '../components/upload/ExcelUpload';
import { useShipments } from '../hooks/useShipments';
import type { TableColumn } from '../types';
import type { UserProfile } from '../lib/auth';

interface Section2Props {
  user: UserProfile;
  onLogout: () => void;
}

const columns: TableColumn[] = [
  { label: 'PK', field: 'pk' },
  { label: 'Line Number', field: 'line_number' },
  { label: 'Serial Number', field: 'serial_number' },
  { label: 'Transporter', field: 'transporter' },
  { label: "Driver's Name", field: 'driver_name' },
  { label: 'Driver Phone', field: 'driver_phone' },
  { label: 'Vehicle', field: 'vehicle' },
  { label: 'Values', field: 'values' },
  { label: 'Total', field: 'total' },
  { 
    label: 'Approval Date', 
    field: 'approval_date',
    format: (value: string | null) => value ? new Date(value).toLocaleDateString() : '-'
  },
  { 
    label: 'Destination State', 
    field: 'destination_state',
    format: (value: string | null) => value || '-'
  },
  { 
    label: 'Destination Locality', 
    field: 'destination_locality',
    format: (value: string | null) => value || '-'
  }
];

export function Section2({ user, onLogout }: Section2Props) {
  const [filters, setFilters] = React.useState({
    transporter: '',
    startDate: '',
    endDate: ''
  });

  const { shipments, isLoading, error, fetchShipments } = useShipments();
  const transporters = React.useMemo(() => {
    const uniqueTransporters = new Set(shipments.map(s => s.transporter));
    return Array.from(uniqueTransporters).sort();
  }, [shipments]);

  React.useEffect(() => {
    fetchShipments(filters);
  }, [fetchShipments, filters]);

  return (
    <div className="flex-1 p-8 bg-[#F8F9FA]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light text-[#333333]">Upload approved Clearances</h1>
      </div>
      
      <ExcelUpload onSuccess={() => fetchShipments(filters)} />
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <DataTable 
        columns={columns} 
        data={shipments}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={setFilters}
        transporters={transporters}
      />
    </div>
  );
}