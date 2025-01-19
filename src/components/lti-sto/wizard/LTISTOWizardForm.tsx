import React, { useState } from 'react';
import { Loader, Printer } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { WizardNavigation } from './WizardNavigation';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { DestinationStep } from './steps/DestinationStep';
import { LinesStep } from './steps/LinesStep';
import { AdditionalInfoStep } from './steps/AdditionalInfoStep';
import { PrintableLTI } from '../PrintableLTI';
import { submitLTISTOForm } from '../../../lib/services/ltiStoFormService';
import type { WizardFormData } from './types';
import { initialFormData } from './types';

export function LTISTOWizardForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [showPrintable, setShowPrintable] = useState(false);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // For NFI dispatch, don't require offline approval number
        const requiredFields: (keyof typeof formData.basicInfo)[] = [
          'transporterName',
          'transporterCode',
          'ltiDate',
          'originCo',
          'originLocation',
          'originSlDesc'
        ];

        // Add offlineApprovalNumber to required fields only for offline dispatch
        if (formData.basicInfo.dispatchType === 'offline') {
          requiredFields.push('offlineApprovalNumber');
        }

        return requiredFields.every(field => !!formData.basicInfo[field]);

      case 2:
        return !!(
          formData.destination.destinationLocation &&
          formData.destination.destinationSl
        );
      case 3:
        return formData.lines.length > 0 && formData.lines.every(line => 
          line.commodityDescription && 
          line.netQuantity && 
          line.grossQuantity
        );
      case 4:
        return true; // Additional info is optional
      default:
        return false;
    }
  };

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

      const result = await submitLTISTOForm(formData);
      
      setSuccess('LTI/STO created successfully');
      setSubmittedData(result);
      
      // Reset form
      setFormData(initialFormData);
      setCurrentStep(1);
      setCompletedSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create LTI/STO');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    setShowPrintable(true);
  };

  const handleNext = () => {
    if (currentStep === 4) {
      handleSubmit();
      return;
    }

    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
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
          <DestinationStep
            data={formData.destination}
            onChange={(field, value) => setFormData(prev => ({
              ...prev,
              destination: { ...prev.destination, [field]: value }
            }))}
          />
        );
      case 3:
        return (
          <LinesStep
            lines={formData.lines}
            onAddLine={() => {
              const nextLineNumber = formData.lines.length > 0 
                ? (parseInt(formData.lines[formData.lines.length - 1].lineNumber) + 10).toString().padStart(3, '0')
                : '010';
              
              setFormData(prev => ({
                ...prev,
                lines: [...prev.lines, {
                  id: uuidv4(),
                  lineNumber: nextLineNumber,
                  batchNumber: '',
                  commodityDescription: '',
                  netQuantity: '',
                  grossQuantity: '',
                  remarks: ''
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
          <AdditionalInfoStep
            data={formData.additional}
            onChange={(field, value) => setFormData(prev => ({
              ...prev,
              additional: { ...prev.additional, [field]: value }
            }))}
          />
        );
      default:
        return null;
    }
  };

  if (showPrintable && submittedData) {
    return (
      <PrintableLTI 
        data={[submittedData]} 
        onClose={() => setShowPrintable(false)} 
      />
    );
  }

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
              currentStep === 2 ? 'Destination Details' :
              currentStep === 3 ? 'Line Items' :
              'Additional Information'
            }
          </h2>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {success && submittedData && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center justify-between">
              <span>{success}</span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1 text-green-700 hover:bg-green-100 rounded transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print LTI
              </button>
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
              disabled={!validateStep(currentStep) || isSubmitting}
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