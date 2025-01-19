import React, { useState, useEffect } from 'react';
import { FileDown, Filter, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DataTable } from '../table/DataTable';
import { TableFilters } from '../table/filters/TableFilters';
import { searchLTISTO } from '../../utils/search';
import { generateLTISTOPDF } from '../../utils/pdf/ltiStoReport';
import { PrintableLTI } from './PrintableLTI';
import type { LTISTO } from '../../types/lti-sto';
import type { TableColumn } from '../../types';

const columns: TableColumn[] = [
  { 
    label: 'Actions',
    field: 'lti_number',
    format: (value: string, row: LTISTO) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('print-lti', { detail: row }));
        }}
        className="p-1 text-gray-500 hover:text-primary"
        title="Print LTI"
      >
        <Printer className="w-4 h-4" />
      </button>
    )
  },
  { label: 'LTI Number', field: 'lti_number' },
  { label: 'Transporter', field: 'transporter_name' },
  { label: 'Origin', field: 'origin_location' },
  { label: 'Destination', field: 'destination_location' },
  { label: 'Commodity', field: 'commodity_description' },
  { 
    label: 'Net Qty (MT)', 
    field: 'lti_qty_net',
    format: (value) => value.toFixed(2)
  },
  { 
    label: 'Gross Qty (MT)', 
    field: 'lti_qty_gross',
    format: (value) => value.toFixed(2)
  },
  { 
    label: 'Date', 
    field: 'lti_date',
    format: (value) => new Date(value).toLocaleDateString()
  }
];

export function LTISTOReport() {
  const [data, setData] = useState<LTISTO[]>([]);
  const [filteredData, setFilteredData] = useState<LTISTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    transporter: '',
    startDate: '',
    endDate: '',
    destination: '',
    commodity: ''
  });
  const [showPrintable, setShowPrintable] = useState(false);
  const [selectedLTI, setSelectedLTI] = useState<LTISTO | null>(null);

  // Get unique transporters for filter dropdown
  const transporters = React.useMemo(() => {
    const uniqueTransporters = new Set(data.map(item => item.transporter_name));
    return Array.from(uniqueTransporters).sort();
  }, [data]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('lti_sto')
        .select('*')
        .order('lti_date', { ascending: false });

      if (filters.transporter) {
        query = query.ilike('transporter_name', `%${filters.transporter}%`);
      }
      if (filters.startDate) {
        query = query.gte('lti_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('lti_date', filters.endDate);
      }
      if (filters.destination) {
        query = query.ilike('destination_location', `%${filters.destination}%`);
      }
      if (filters.commodity) {
        query = query.ilike('commodity_description', `%${filters.commodity}%`);
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData(result || []);
      setFilteredData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  useEffect(() => {
    // Listen for print events from the table
    const handlePrint = (e: CustomEvent<LTISTO>) => {
      const ltiNumber = e.detail.lti_number;
      const ltiData = data.filter(item => item.lti_number === ltiNumber);
      if (ltiData.length > 0) {
        setSelectedLTI(ltiData[0]);
        setShowPrintable(true);
      }
    };

    window.addEventListener('print-lti', handlePrint as EventListener);
    return () => window.removeEventListener('print-lti', handlePrint as EventListener);
  }, [data]);

  const handleDownloadPDF = () => {
    generateLTISTOPDF(filteredData);
  };

  if (showPrintable && selectedLTI) {
    // Get all lines for the selected LTI
    const ltiData = data.filter(item => item.lti_number === selectedLTI.lti_number);
    return (
      <PrintableLTI 
        data={ltiData} 
        onClose={() => {
          setShowPrintable(false);
          setSelectedLTI(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Total LTIs/STOs</h3>
          <p className="text-3xl font-bold text-primary">{filteredData.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Total Net Quantity</h3>
          <p className="text-3xl font-bold text-primary">
            {filteredData.reduce((sum, item) => sum + item.lti_qty_net, 0).toFixed(2)} MT
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Active Transporters</h3>
          <p className="text-3xl font-bold text-primary">
            {new Set(filteredData.map(item => item.transporter_name)).size}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-gray-50 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Download PDF
        </button>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <TableFilters
          filters={filters}
          onFilterChange={setFilters}
          transporters={transporters}
        />
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={setFilters}
        transporters={transporters}
        searchFunction={searchLTISTO}
        searchPlaceholder="Search by LTI number, transporter, location..."
        title="LTI/STO Report"
      />
    </div>
  );
}