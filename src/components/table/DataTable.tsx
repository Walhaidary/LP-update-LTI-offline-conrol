import React, { useState, useMemo } from 'react';
import { TableHeader } from './TableHeader';
import { Pagination } from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { searchShipments } from '../../utils/search';
import type { TableColumn, FilterState } from '../../types';

interface DataTableProps<T> {
  columns: TableColumn[];
  data: T[];
  isLoading?: boolean;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  transporters: string[];
  departments?: { id: string; name: string; }[];
  kpis?: { id: string; name: string; }[];
  statuses?: { id: string; name: string; }[];
  showTicketFilters?: boolean;
  searchFunction?: (items: T[], searchTerm: string) => T[];
  searchPlaceholder?: string;
  title?: string;
}

export function DataTable<T extends { id?: string }>({ 
  columns, 
  data, 
  isLoading,
  filters,
  onFilterChange,
  transporters,
  departments = [],
  kpis = [],
  statuses = [],
  showTicketFilters = false,
  searchFunction = searchShipments as any,
  searchPlaceholder = "Search by PK, driver name, vehicle...",
  title = "List of Approved Clearances"
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    paginate,
    totalPages,
  } = usePagination(10);

  const filteredData = useMemo(() => {
    return searchFunction(data, searchTerm);
  }, [data, searchTerm, searchFunction]);

  const paginatedData = paginate(filteredData);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 md:p-6">
      <TableHeader 
        title={title}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        onFilterChange={onFilterChange}
        transporters={transporters}
        departments={departments}
        kpis={kpis}
        statuses={statuses}
        showTicketFilters={showTicketFilters}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />
      
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-[800px] md:w-full p-4 md:p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F3F4F6] text-[#666666]">
                {columns.map((column, index) => (
                  <th key={`header-${column.field}-${index}`} className="px-4 py-3 text-left font-medium text-sm">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[#333333]">
              {paginatedData.map((row: any, rowIndex) => (
                <tr 
                  key={row.id || `row-${rowIndex}-${JSON.stringify(row)}`}
                  className={`
                    border-t border-[#E5E7EB] hover:bg-[#F9FAFB]
                    ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td key={`cell-${rowIndex}-${column.field}-${colIndex}`} className="px-4 py-3 text-sm">
                      {column.format ? column.format(row[column.field], row) : row[column.field]}
                    </td>
                  ))}
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages(filteredData.length)}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}