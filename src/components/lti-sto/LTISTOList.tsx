import React from 'react';
import { LTISTOUpload } from './LTISTOUpload';
import { LTISTOWizardForm } from './wizard/LTISTOWizardForm';

export function LTISTOList() {
  const handleUploadSuccess = () => {
    // You might want to show a success message or refresh some data
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">LTI/STO List</h1>
      </div>

      <LTISTOUpload onSuccess={handleUploadSuccess} />
      
      <div className="mt-8">
        <LTISTOWizardForm />
      </div>
    </div>
  );
}