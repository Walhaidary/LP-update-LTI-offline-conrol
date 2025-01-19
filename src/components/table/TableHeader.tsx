import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { TableFilters } from './filters/TableFilters';
import type { FilterState } from '../../types';

interface TableHeaderProps {
  title: string;
  searchPlaceholder: string;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  transporters: string[];
  departments?: { id: string; name: string; }[];
  kpis?: { id: string; name: string; }[];
  statuses?: { id: string; name: string; }[];
  showTicketFilters?: boolean;
  searchTerm: string;
  onSearch: (term: string) => void;
}

export function TableHeader({ 
  title,
  searchPlaceholder,
  filters, 
  onFilterChange, 
  transporters,
  departments = [],
  kpis = [],
  statuses = [],
  showTicketFilters = false,
  searchTerm,
  onSearch
}: TableHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-xl text-[#333333]">{title}</h3>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] w-4 h-4" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full md:w-[300px] pl-9 pr-3 py-2 border border-[#CCCCCC] rounded text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-primary"
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-[#CCCCCC] rounded text-[#333333] hover:bg-gray-50"
        >
          <Filter className="w-4 h-4 text-[#0088CC]" />
          <span className="text-[#0088CC]">Advanced filters</span>
        </button>
      </div>

      {showFilters && (
        <TableFilters
          filters={filters}
          onFilterChange={onFilterChange}
          transporters={transporters}
          departments={departments}
          kpis={kpis}
          statuses={statuses}
          showTicketFilters={showTicketFilters}
        />
      )}
    </div>
  );
}