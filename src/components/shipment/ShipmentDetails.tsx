import React from 'react';
import type { Database } from '../../types/database';

type Shipment = Database['public']['Tables']['shipments']['Row'];

interface ShipmentDetailsProps {
  shipment: Shipment;
}

export function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Driver Name</label>
            <p className="mt-1 text-base">{shipment.driver_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Driver Cell Number</label>
            <p className="mt-1 text-base">{shipment.driver_phone}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Truck Plate Number</label>
            <p className="mt-1 text-base">{shipment.vehicle}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Approval Date</label>
            <p className="mt-1 text-base">
              {shipment.approval_date 
                ? new Date(shipment.approval_date).toLocaleDateString()
                : 'Not approved yet'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Transporter</label>
            <p className="mt-1 text-base">{shipment.transporter}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Serial Number</label>
            <p className="mt-1 text-base">{shipment.serial_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
}