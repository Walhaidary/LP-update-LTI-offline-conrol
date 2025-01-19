import React, { useState, useEffect } from 'react';
import { Filter, FileDown } from 'lucide-react';
import { useDeliveredTrucks } from '../../hooks/useDeliveredTrucks';
import { Pagination } from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { generateDeliveredTrucksPDF } from '../../utils/pdf/deliveredTrucks';

export function DeliveredTrucks() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    transporter: '',
    destinationState: '',
    destinationLocality: ''
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { trucks, isLoading, error, fetchDeliveredTrucks } = useDeliveredTrucks();
  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    paginate,
    totalPages,
  } = usePagination(10);

  useEffect(() => {
    fetchDeliveredTrucks(appliedFilters);
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    fetchDeliveredTrucks(filters);
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
    fetchDeliveredTrucks(resetFilters);
  };

  const handleDownloadPDF = () => {
    generateDeliveredTrucksPDF(trucks);
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

  const paginatedTrucks = paginate(trucks);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Download PDF
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
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
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
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
                onChange={(e) => setFilters({ ...filters, transporter: e.target.value })}
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
                onChange={(e) => setFilters({ ...filters, destinationState: e.target.value })}
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
                onChange={(e) => setFilters({ ...filters, destinationLocality: e.target.value })}
                placeholder="Enter destination locality"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <div className="flex gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Serial Number</th>
                <th className="px-6 py-3 font-medium">Driver Name</th>
                <th className="px-6 py-3 font-medium">Driver Phone</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Transporter</th>
                <th className="px-6 py-3 font-medium">Destination State</th>
                <th className="px-6 py-3 font-medium">Destination Locality</th>
                <th className="px-6 py-3 font-medium text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTrucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{truck.serial_number}</td>
                  <td className="px-6 py-4 text-sm">{truck.driver_name}</td>
                  <td className="px-6 py-4 text-sm">{truck.driver_phone}</td>
                  <td className="px-6 py-4 text-sm">{truck.vehicle}</td>
                  <td className="px-6 py-4 text-sm">{truck.transporter}</td>
                  <td className="px-6 py-4 text-sm">{truck.destination_state || '-'}</td>
                  <td className="px-6 py-4 text-sm">{truck.destination_locality || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    {truck.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                </tr>
              ))}
              {paginatedTrucks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No delivered trucks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages(trucks.length)}
          itemsPerPage={itemsPerPage}
          totalItems={trucks.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}