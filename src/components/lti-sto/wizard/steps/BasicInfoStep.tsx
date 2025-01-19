import React, { useState, useEffect } from 'react';
import { FormField } from '../../../common/FormField';
import { supabase } from '../../../../lib/supabase';

interface BasicInfo {
  offlineApprovalNumber: string;
  dispatchType: 'offline' | 'nfi';
  transporterName: string;
  transporterCode: string;
  ltiDate: string;
  originCo: string;
  originLocation: string;
  originSlDesc: string;
}

interface BasicInfoStepProps {
  data: BasicInfo;
  onChange: (field: keyof BasicInfo, value: string) => void;
}

interface Transporter {
  id: string;
  name: string;
  vendor_code: string;
}

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [transporters, setTransporters] = useState<Transporter[]>([]);

  // Load transporters on mount
  useEffect(() => {
    loadTransporters();
  }, []);

  // Check ticket status when approval number changes
  useEffect(() => {
    if (data.dispatchType === 'offline' && data.offlineApprovalNumber) {
      checkApprovalTicket(data.offlineApprovalNumber);
    } else {
      setTicketInfo(null);
      setError(null);
    }
  }, [data.offlineApprovalNumber, data.dispatchType]);

  const loadTransporters = async () => {
    try {
      const { data: providers, error: fetchError } = await supabase
        .from('service_providers')
        .select('id, name, vendor_code')
        .eq('type', 'transporter')
        .order('name');

      if (fetchError) throw fetchError;
      setTransporters(providers || []);
    } catch (err) {
      console.error('Error loading transporters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkApprovalTicket = async (ticketNumber: string) => {
    try {
      // Get latest version of the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('ticket_details_view')
        .select('status_name, due_date')
        .eq('ticket_number', ticketNumber)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (ticketError) throw ticketError;

      if (!ticket) {
        setError('Approval ticket not found');
        setTicketInfo(null);
        return;
      }

      // Check if ticket is approved
      if (ticket.status_name?.toLowerCase() !== 'approved') {
        setError('Approval ticket is not in approved status');
        setTicketInfo(null);
        return;
      }

      // Check if ticket is expired
      const dueDate = new Date(ticket.due_date);
      if (dueDate < new Date()) {
        setError('Approval ticket has expired');
        setTicketInfo(null);
        return;
      }

      setTicketInfo(ticket);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify approval ticket');
      setTicketInfo(null);
    }
  };

  const handleTransporterChange = (transporterId: string) => {
    const transporter = transporters.find(t => t.id === transporterId);
    if (transporter) {
      onChange('transporterName', transporter.name);
      onChange('transporterCode', transporter.vendor_code);
    }
  };

  const handleDispatchTypeChange = (type: 'offline' | 'nfi') => {
    // Reset all form fields
    onChange('dispatchType', type);
    onChange('offlineApprovalNumber', '');
    onChange('transporterName', '');
    onChange('transporterCode', '');
    onChange('ltiDate', '');
    onChange('originCo', '');
    onChange('originLocation', '');
    onChange('originSlDesc', '');
    
    // Reset ticket info and error
    setTicketInfo(null);
    setError(null);
  };

  // Only apply form restrictions for offline dispatch
  const isFormDisabled = data.dispatchType === 'offline' && !ticketInfo;

  return (
    <div className="space-y-6">
      {/* Dispatch Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dispatch Type
        </label>
        <p className="text-sm text-gray-500">Select the type of dispatch</p>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="dispatchType"
              value="offline"
              checked={data.dispatchType === 'offline'}
              onChange={(e) => handleDispatchTypeChange('offline')}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span>Offline Dispatch</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="dispatchType"
              value="nfi"
              checked={data.dispatchType === 'nfi'}
              onChange={(e) => handleDispatchTypeChange('nfi')}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span>NFI Dispatch</span>
          </label>
        </div>
      </div>

      {/* Offline Approval Number - Only show for offline dispatch */}
      {data.dispatchType === 'offline' && (
        <>
          <FormField
            label="Offline Approval Number"
            description="Enter the offline approval ticket number"
            value={data.offlineApprovalNumber}
            onChange={(value) => onChange('offlineApprovalNumber', value)}
            required
          />
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          {ticketInfo && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
              Approval ticket verified and valid until {new Date(ticketInfo.due_date).toLocaleDateString()}
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Transporter
            {data.dispatchType === 'offline' && !ticketInfo && <span className="text-red-500 ml-1">*</span>}
          </label>
          <p className="text-sm text-gray-500">Select the transporter</p>
          <select
            value={transporters.find(t => t.name === data.transporterName)?.id || ''}
            onChange={(e) => handleTransporterChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isFormDisabled}
            required
          >
            <option value="">Select Transporter</option>
            {transporters.map((transporter) => (
              <option key={transporter.id} value={transporter.id}>
                {transporter.name} ({transporter.vendor_code})
              </option>
            ))}
          </select>
        </div>

        <FormField
          label="Transporter Code"
          description="Transporter code (auto-filled)"
          value={data.transporterCode}
          onChange={() => {}} // Read-only
          disabled={true}
          required
        />
      </div>

      <FormField
        label="LTI Date"
        description="Select the LTI date"
        type="date"
        value={data.ltiDate}
        onChange={(value) => onChange('ltiDate', value)}
        required
        disabled={isFormDisabled}
      />

      <div className="grid grid-cols-3 gap-6">
        <FormField
          label="Origin CO"
          description="Enter the origin CO"
          value={data.originCo}
          onChange={(value) => onChange('originCo', value)}
          required
          disabled={isFormDisabled}
        />

        <FormField
          label="Origin Location"
          description="Enter the origin location"
          value={data.originLocation}
          onChange={(value) => onChange('originLocation', value)}
          required
          disabled={isFormDisabled}
        />

        <FormField
          label="Origin SL Description"
          description="Enter the origin SL description"
          value={data.originSlDesc}
          onChange={(value) => onChange('originSlDesc', value)}
          required
          disabled={isFormDisabled}
        />
      </div>
    </div>
  );
}