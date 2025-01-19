import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import type { Database } from '../../types/database';

type Shipment = Database['public']['Tables']['shipments']['Row'];

interface LineItem {
  id: string;
  line_number: string;
  values: string;
  batch_number: string;
  units: string;
  warehouse_number: string;
  remarks: string;
  pk: number;
}

interface ShipmentFormProps {
  shipment: Shipment & { lines?: Shipment[] };
  onSubmit: (values: Partial<Shipment>) => Promise<void>;
}

export function ShipmentForm({ shipment, onSubmit }: ShipmentFormProps) {
  const [formData, setFormData] = useState({
    driver_name: shipment.driver_name,
    driver_phone: shipment.driver_phone,
    vehicle: shipment.vehicle,
    transporter: shipment.transporter,
    status: shipment.status,
    destination_state: shipment.destination_state || '',
    destination_locality: shipment.destination_locality || '',
    remarks: shipment.remarks || '',
    approval_date: shipment.approval_date ? new Date(shipment.approval_date).toISOString().split('T')[0] : ''
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(
    shipment.lines?.map(line => ({
      id: line.id,
      line_number: line.line_number,
      values: line.values || '',
      batch_number: line.batch_number || '',
      units: line.total?.toString() || '',
      warehouse_number: line.warehouse_number || '',
      remarks: line.remarks || '',
      pk: line.pk
    })) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const addNewLine = () => {
    const lastLine = lineItems[lineItems.length - 1];
    const nextLineNumber = lastLine 
      ? (parseInt(lastLine.line_number) + 10).toString().padStart(3, '0')
      : '010';

    setLineItems(prev => [...prev, {
      id: Math.random().toString(),
      line_number: nextLineNumber,
      values: '',
      batch_number: '',
      units: '0',
      warehouse_number: '',
      remarks: '',
      pk: shipment.pk
    }]);
  };

  const removeLine = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        lines: lineItems.map(item => ({
          ...item,
          total: parseFloat(item.units) || 0
        }))
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Driver Name</label>
            <input
              type="text"
              value={formData.driver_name}
              onChange={handleChange('driver_name')}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Driver Cell Number</label>
            <input
              type="text"
              value={formData.driver_phone}
              onChange={handleChange('driver_phone')}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Truck Plate Number</label>
            <input
              type="text"
              value={formData.vehicle}
              onChange={handleChange('vehicle')}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Approval Date</label>
            <input
              type="date"
              value={formData.approval_date}
              onChange={handleChange('approval_date')}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Transporter</label>
            <input
              type="text"
              value={formData.transporter}
              onChange={handleChange('transporter')}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600">Status</label>
          <select
            value={formData.status}
            onChange={handleChange('status')}
            className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
          >
            <option value="sc_approved">SC Approved</option>
            <option value="reported_to_wh">Reported to WH</option>
            <option value="lo_issued">LO Issued</option>
            <option value="under_loading">Under Loading</option>
            <option value="loading_completed">Loading Completed</option>
            <option value="arrived_to_mi_if">Arrived to MI IF</option>
            <option value="departed_mi_if">Departed MI IF</option>
            <option value="in_transit">In Transit</option>
            <option value="arrived_to_destination">Arrived to Destination</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Destination State</label>
          <input
            type="text"
            value={formData.destination_state}
            onChange={handleChange('destination_state')}
            placeholder="Enter destination state"
            className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Destination Locality</label>
          <input
            type="text"
            value={formData.destination_locality}
            onChange={handleChange('destination_locality')}
            placeholder="Enter destination locality"
            className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Line Items</h3>
          <button
            type="button"
            onClick={addNewLine}
            className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Line
          </button>
        </div>

        {lineItems.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg bg-gray-50 space-y-4">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Line Number</label>
                  <input
                    type="text"
                    value={item.line_number}
                    disabled
                    className="mt-1 w-full px-3 py-2 bg-gray-100 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="text"
                    value={item.values}
                    onChange={(e) => updateLineItem(item.id, 'values', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Units</label>
                  <input
                    type="number"
                    value={item.units}
                    onChange={(e) => updateLineItem(item.id, 'units', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              {lineItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(item.id)}
                  className="ml-4 p-1 text-gray-400 hover:text-red-500"
                  title="Remove line"
                >
                  <Trash className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                <input
                  type="text"
                  value={item.batch_number}
                  onChange={(e) => updateLineItem(item.id, 'batch_number', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Warehouse Number</label>
                <input
                  type="text"
                  value={item.warehouse_number}
                  onChange={(e) => updateLineItem(item.id, 'warehouse_number', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <input
                  type="text"
                  value={item.remarks}
                  onChange={(e) => updateLineItem(item.id, 'remarks', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Update Information'}
        </button>
      </div>
    </form>
  );
}