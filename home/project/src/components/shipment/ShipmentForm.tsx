import React from 'react';
import type { Database } from '../../types/database';

type Shipment = Database['public']['Tables']['shipments']['Row'];

const STATUS_OPTIONS = [
  { value: 'sc_approved', label: 'SC Approved' },
  { value: 'reported_to_wh', label: 'Reported to WH' },
  { value: 'lo_issued', label: 'LO Issued' },
  { value: 'under_loading', label: 'Under Loading' },
  { value: 'loading_completed', label: 'Loading Completed' },
  { value: 'arrived_to_mi_if', label: 'Arrived to MI IF' },
  { value: 'departed_mi_if', label: 'Departed MI IF' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'arrived_to_destination', label: 'Arrived to Destination' }
] as const;

interface ShipmentFormProps {
  shipment: Shipment;
  onSubmit: (values: Partial<Shipment>) => Promise<void>;
}

export function ShipmentForm({ shipment, onSubmit }: ShipmentFormProps) {
  const [status, setStatus] = React.useState(shipment.status || 'sc_approved');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({ status });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Driver Name</label>
          <input
            type="text"
            value={shipment.driver_name}
            disabled
            className="mt-1 w-full px-3 py-2 bg-gray-50 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Driver Cell Number</label>
          <input
            type="text"
            value={shipment.driver_phone}
            disabled
            className="mt-1 w-full px-3 py-2 bg-gray-50 border rounded-md"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Truck Plate Number</label>
          <input
            type="text"
            value={shipment.vehicle}
            disabled
            className="mt-1 w-full px-3 py-2 bg-gray-50 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Approval Date</label>
          <input
            type="text"
            value={shipment.approval_date 
              ? new Date(shipment.approval_date).toLocaleDateString()
              : 'Not approved yet'
            }
            disabled
            className="mt-1 w-full px-3 py-2 bg-gray-50 border rounded-md"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Transporter</label>
          <input
            type="text"
            value={shipment.transporter}
            disabled
            className="mt-1 w-full px-3 py-2 bg-gray-50 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Serial Number</label>
          <input
            type="text"
            value={shipment.serial_number}
            disabled
            className="mt-1 w-full px-3 py-2 bg-gray-50 border rounded-md"
          />
        </div>
      </div>

      <div className="md:col-span-3 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </form>
  );
}