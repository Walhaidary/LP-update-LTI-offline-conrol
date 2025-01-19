import React from 'react';
import type { WizardFormData } from '../../types';

export function WizardForm() {
  const [formData, setFormData] = React.useState<WizardFormData>({
    firstName: '',
    lastName: '',
    notes: ''
  });

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Step 0/4: Name and last name</h2>

      <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold mb-2">Regular Blockquote</h3>
        <p className="text-gray-600">
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
          eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
          voluptua.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          label="First Name"
          description="Enter your full first name"
          value={formData.firstName}
          onChange={(value) => setFormData({ ...formData, firstName: value })}
        />

        <FormField
          label="Last Name"
          description="Some more requirements"
          value={formData.lastName}
          onChange={(value) => setFormData({ ...formData, lastName: value })}
        />

        <div className="space-y-2">
          <label className="block font-medium">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full h-24 px-3 py-2 border rounded-md resize-y"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}

function FormField({ label, description, value, onChange }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">{label}</label>
      <p className="text-sm text-gray-500">{description}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>
  );
}