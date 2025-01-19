import React from 'react';
import type { Database } from '../../types/database';

type Shipment = Database['public']['Tables']['shipments']['Row'];

interface ShipmentListProps {
  shipments: Shipment[];
  selectedId: string | null;
  onSelect: (shipment: Shipment) => void;
}

export function ShipmentList({ shipments, selectedId, onSelect }: ShipmentListProps) {
  // Calculate grand total
  const grandTotal = shipments.reduce((sum, shipment) => sum + (shipment.total || 0), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">PK</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Commodity</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Total</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => (
            <tr 
              key={shipment.id}
              onClick={() => onSelect(shipment)}
              className={`border-t hover:bg-gray-50 cursor-pointer ${
                selectedId === shipment.id ? 'bg-blue-50' : ''
              }`}
            >
              <td className="px-4 py-2 text-sm">{shipment.pk}</td>
              <td dir="rtl" className="px-4 py-2 text-sm text-right font-arabic">
                {shipment.values}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {shipment.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
          {/* Grand Total Row */}
          <tr className="border-t bg-gray-50 font-medium">
            <td className="px-4 py-2 text-sm" colSpan={2}>Grand Total</td>
            <td className="px-4 py-2 text-sm text-right">
              {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}