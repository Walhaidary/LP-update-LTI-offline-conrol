import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  total: number;
}

export function TablePagination({ total }: TablePaginationProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 text-[#666666]">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="whitespace-nowrap">
          Items per page:
          <select className="ml-2 border rounded px-2 py-1 text-[#333333]">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </label>
        <span className="whitespace-nowrap">Showing {total} items</span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="whitespace-nowrap">Page 1</span>
        <div className="flex">
          <button className="px-2 py-1 border rounded-l hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-2 py-1 border rounded-r hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}