import React from 'react';
import { OBDWaybillWizardForm } from './wizard/OBDWaybillWizardForm';

export function OBDWaybillList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">OBD/Waybill List</h1>
      </div>
      
      <div>
        <OBDWaybillWizardForm />
      </div>
    </div>
  );
}