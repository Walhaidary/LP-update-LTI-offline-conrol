import React from 'react';
import { Pagination } from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { calculateStageDelay } from '../../utils/stageDelay';
import { calculateTotalBySerialNumber } from '../../utils/calculations';
import { STATUS_LABELS } from '../../utils/constants';
import type { Database } from '../../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

interface StatusGroupProps {
  status: string;
  count: number;
  shipments: ShipmentUpdate[];
  allUpdates: ShipmentUpdate[];
}

export function StatusGroup({ status, count, shipments, allUpdates }: StatusGroupProps) {
  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    paginate,
    totalPages,
  } = usePagination(10);

  const paginatedShipments = paginate(shipments);

  // Calculate grand total for this status group
  const grandTotal = shipments.reduce((total, shipment) => {
    return total + calculateTotalBySerialNumber(allUpdates, shipment.serial_number);
  }, 0);

  const handleSerialNumberClick = (serialNumber: string) => {
    // Navigate to monitors page with the serial number
    window.history.pushState({ serialNumber }, '', '/monitors');
    window.dispatchEvent(new CustomEvent('navigate-to-update', { 
      detail: { serialNumber } 
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
          </h3>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
              {count} trucks
            </span>
            <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
              Total: {grandTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        </div>
      </div>

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
              <th className="px-6 py-3 font-medium">Stage Delay (Days)</th>
              <th className="px-6 py-3 font-medium">Remarks</th>
              <th className="px-6 py-3 font-medium text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedShipments.map((shipment) => (
              <tr key={shipment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleSerialNumberClick(shipment.serial_number)}
                    className="text-primary hover:underline focus:outline-none"
                  >
                    {shipment.serial_number}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm">{shipment.driver_name}</td>
                <td className="px-6 py-4 text-sm">{shipment.driver_phone}</td>
                <td className="px-6 py-4 text-sm">{shipment.vehicle}</td>
                <td className="px-6 py-4 text-sm">{shipment.transporter}</td>
                <td className="px-6 py-4 text-sm">{shipment.destination_state || '-'}</td>
                <td className="px-6 py-4 text-sm">{shipment.destination_locality || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  {calculateStageDelay(shipment, allUpdates)}
                </td>
                <td className="px-6 py-4 text-sm">
                  {shipment.remarks || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  {calculateTotalBySerialNumber(allUpdates, shipment.serial_number).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
              </tr>
            ))}
            {paginatedShipments.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                  No shipments found in this status
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages(shipments.length)}
        itemsPerPage={itemsPerPage}
        totalItems={shipments.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}