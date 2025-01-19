import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../lib/supabase';
import { WizardNavigation } from './WizardNavigation';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { DriverInformationStep } from './steps/DriverInformationStep';
import { DeliveryLinesStep } from './steps/DeliveryLinesStep';
import { AdditionalNotesStep } from './steps/AdditionalNotesStep';
import { SuccessMessage } from './SuccessMessage';
import { submitOBDWaybill } from '../../../lib/services/obdWaybillService';
import { generatePrintableLO } from '../../../utils/pdf/printableLO';
import { initialFormData } from './constants';
import type { WizardFormData, DeliveryLine } from './types';

export function OBDWaybillWizardForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleStepClick = (step: number) => {
    if (step <= Math.max(...Array.from(completedSteps), currentStep)) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSubmittedData(null);

      // Validate required fields
      if (!formData.basicInfo.ltiNumber) {
        throw new Error('LTI/STO number is required');
      }
      if (!formData.driverInfo.serialNumber) {
        throw new Error('Serial number is required');
      }
      if (!formData.driverInfo.driverName) {
        throw new Error('Driver information is required');
      }
      if (formData.lines.length === 0) {
        throw new Error('No delivery lines found');
      }

      const result = await submitOBDWaybill({
        ...formData,
        basicInfo: {
          ...formData.basicInfo,
          frn_cf_number: formData.basicInfo.frn
        }
      });
      
      setSubmittedData(result);
      setSuccess('OBD/Waybill created successfully');
      
      // Reset form
      setFormData(initialFormData);
      setCurrentStep(1);
      setCompletedSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create OBD/Waybill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = async () => {
    if (!submittedData?.outbound_delivery_number) return;

    try {
      // Fetch all lines for this OBD number
      const { data: lines, error: fetchError } = await supabase
        .from('obd_waybill')
        .select('*')
        .eq('outbound_delivery_number', submittedData.outbound_delivery_number)
        .order('outbound_delivery_item_number', { ascending: true });

      if (fetchError) throw fetchError;
      if (!lines || lines.length === 0) throw new Error('No data found for printing');

      // Generate printable PDF
      await generatePrintableLO(lines);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print Loading Order');
    }
  };

  const handleNext = () => {
    if (currentStep === 4) {
      handleSubmit();
      return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleLinesLoad = (lines: DeliveryLine[]) => {
    setFormData(prev => ({
      ...prev,
      lines
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={formData.basicInfo}
            onChange={(field, value) => setFormData(prev => ({
              ...prev,
              basicInfo: { ...prev.basicInfo, [field]: value }
            }))}
          />
        );
      case 2:
        return (
          <DriverInformationStep
            data={formData.driverInfo}
            onChange={(field, value) => setFormData(prev => ({
              ...prev,
              driverInfo: { ...prev.driverInfo, [field]: value }
            }))}
          />
        );
      case 3:
        return (
          <DeliveryLinesStep
            ltiNumber={formData.basicInfo.ltiNumber}
            lines={formData.lines}
            onLinesLoad={handleLinesLoad}
            onAddLine={() => {
              const nextLineNumber = formData.lines.length > 0 
                ? (parseInt(formData.lines[formData.lines.length - 1].outboundDeliveryItemNumber) + 10).toString().padStart(3, '0')
                : '010';
              
              setFormData(prev => ({
                ...prev,
                lines: [...prev.lines, {
                  id: uuidv4(),
                  outboundDeliveryItemNumber: nextLineNumber,
                  materialDescription: '',
                  mtNet: '',
                  gateNumber: '',
                  storageLocationName: ''
                }]
              }));
            }}
            onRemoveLine={(id) => {
              setFormData(prev => ({
                ...prev,
                lines: prev.lines.filter(line => line.id !== id)
              }));
            }}
            onLineChange={(id, field, value) => {
              setFormData(prev => ({
                ...prev,
                lines: prev.lines.map(line => 
                  line.id === id ? { ...line, [field]: value } : line
                )
              }));
            }}
          />
        );
      case 4:
        return (
          <AdditionalNotesStep
            data={formData.additionalNotes}
            onChange={(field, value) => setFormData(prev => ({
              ...prev,
              additionalNotes: { ...prev.additionalNotes, [field]: value }
            }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-6">
      <div className="flex gap-8">
        <WizardNavigation
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />

        <div className="flex-1 space-y-6">
          <h2 className="text-lg font-medium mb-4">
            Step {currentStep} of 4: {
              currentStep === 1 ? 'Basic Information' :
              currentStep === 2 ? 'Driver Information' :
              currentStep === 3 ? 'Delivery Lines' :
              'Additional Notes'
            }
          </h2>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {success && submittedData && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
              <SuccessMessage
                loNumber={submittedData.outbound_delivery_number}
                onPrint={handlePrint}
              />
            </div>
          )}

          {renderStep()}

          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                currentStep === 4 ? 'Submit' : 'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}