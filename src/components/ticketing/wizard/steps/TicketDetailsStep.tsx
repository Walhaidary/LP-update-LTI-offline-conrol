import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { FormField } from '../../../common/FormField';
import type { TicketDetails } from '../types';

interface TicketDetailsStepProps {
  data: TicketDetails;
  onChange: (field: keyof TicketDetails, value: any) => void;
}

export function TicketDetailsStep({ data, onChange }: TicketDetailsStepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange('attachment', file);
  };

  return (
    <div className="space-y-6">
      <FormField
        label="Title / Subject"
        description="Brief summary of the issue"
        value={data.title}
        onChange={(value) => onChange('title', value)}
        required
      />

      <div className="space-y-2">
        <label className="block font-medium">Description / Details</label>
        <p className="text-sm text-gray-500">Provide detailed information about the issue</p>
        <textarea
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Enter description..."
          className="w-full px-3 py-2 border rounded-md resize-y focus:ring-2 focus:ring-primary h-32"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Attachment</label>
        <p className="text-sm text-gray-500">Upload relevant files</p>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}