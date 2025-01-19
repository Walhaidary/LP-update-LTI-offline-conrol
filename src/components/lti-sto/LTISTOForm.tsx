import React from 'react';
import { Plus, X } from 'lucide-react';
import { FormField } from '../common/FormField';
import { supabase } from '../../lib/supabase';
import type { LTISTO } from '../../types/lti-sto';

interface LTISTOFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function LTISTOForm({ onSuccess, onClose }: LTISTOFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      lti_number: formData.get('lti_number') as string,
      lti_line: formData.get('lti_line') as string,
      transporter_name: formData.get('transporter_name') as string,
      transporter_code: formData.get('transporter_code') as string,
      lti_date: formData.get('lti_date') as string,
      origin_co: formData.get('origin_co') as string,
      origin_location: formData.get('origin_location') as string,
      origin_sl_desc: formData.get('origin_sl_desc') as string,
      destination_location: formData.get('destination_location') as string,
      destination_sl: formData.get('destination_sl') as string,
      frn_cf: formData.get('frn_cf') as string,
      consignee: formData.get('consignee') as string,
      batch_number: formData.get('batch_number') as string,
      commodity_description: formData.get('commodity_description') as string,
      lti_qty_net: Number(formData.get('lti_qty_net')),
      lti_qty_gross: Number(formData.get('lti_qty_gross')),
      tpo_number: formData.get('tpo_number') as string,
    };

    try {
      const { error: insertError } = await supabase
        .from('lti_sto')
        .insert([data]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create LTI/STO');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New LTI/STO</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="LTI Number"
              name="lti_number"
              required
              description="Enter the LTI number"
            />
            <FormField
              label="LTI Line"
              name="lti_line"
              required
              description="Enter the LTI line number"
            />
            <FormField
              label="LTI Date"
              name="lti_date"
              type="date"
              required
              description="Select the LTI date"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Transporter Name"
              name="transporter_name"
              required
              description="Enter the transporter's name"
            />
            <FormField
              label="Transporter Code"
              name="transporter_code"
              required
              description="Enter the transporter's code"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Origin CO"
              name="origin_co"
              required
              description="Enter the origin CO"
            />
            <FormField
              label="Origin Location"
              name="origin_location"
              required
              description="Enter the origin location"
            />
            <FormField
              label="Origin SL Description"
              name="origin_sl_desc"
              required
              description="Enter the origin SL description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Destination Location"
              name="destination_location"
              required
              description="Enter the destination location"
            />
            <FormField
              label="Destination SL"
              name="destination_sl"
              required
              description="Enter the destination SL"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Net Quantity (MT)"
              name="lti_qty_net"
              type="number"
              step="0.01"
              required
              description="Enter the net quantity in metric tons"
            />
            <FormField
              label="Gross Quantity (MT)"
              name="lti_qty_gross"
              type="number"
              step="0.01"
              required
              description="Enter the gross quantity in metric tons"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="FRN/CF"
              name="frn_cf"
              description="Enter the FRN/CF number"
            />
            <FormField
              label="Consignee"
              name="consignee"
              description="Enter the consignee"
            />
            <FormField
              label="TPO Number"
              name="tpo_number"
              description="Enter the TPO number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Batch Number"
              name="batch_number"
              description="Enter the batch number"
            />
            <FormField
              label="Commodity Description"
              name="commodity_description"
              description="Enter the commodity description"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create LTI/STO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}