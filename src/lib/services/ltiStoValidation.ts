import type { WizardFormData } from '../../components/lti-sto/wizard/types';

export function validateLTISTOForm(data: WizardFormData): string[] {
  const errors: string[] = [];

  // Validate basic info
  if (!data.basicInfo.ltiNumber) errors.push('LTI Number is required');
  if (!data.basicInfo.transporterName) errors.push('Transporter Name is required');
  if (!data.basicInfo.transporterCode) errors.push('Transporter Code is required');
  if (!data.basicInfo.ltiDate) errors.push('LTI Date is required');
  if (!data.basicInfo.originCo) errors.push('Origin CO is required');
  if (!data.basicInfo.originLocation) errors.push('Origin Location is required');

  // Validate destination info
  if (!data.destinationInfo.destinationLocation) errors.push('Destination Location is required');
  if (!data.destinationInfo.destinationSl) errors.push('Destination SL is required');

  // Validate lines
  if (data.lines.length === 0) {
    errors.push('At least one line item is required');
  } else {
    data.lines.forEach((line, index) => {
      if (!line.lineNumber) errors.push(`Line ${index + 1}: Line Number is required`);
      if (!line.originSlDesc) errors.push(`Line ${index + 1}: Origin SL Description is required`);
      if (!line.commodityDescription) errors.push(`Line ${index + 1}: Commodity Description is required`);
      if (!line.ltiQtyNet) errors.push(`Line ${index + 1}: Net Quantity is required`);
      if (!line.ltiQtyUnits) errors.push(`Line ${index + 1}: Units are required`);
      
      // Validate numeric fields
      if (isNaN(parseFloat(line.ltiQtyNet))) {
        errors.push(`Line ${index + 1}: Net Quantity must be a valid number`);
      }
      if (isNaN(parseFloat(line.ltiQtyUnits))) {
        errors.push(`Line ${index + 1}: Units must be a valid number`);
      }
    });
  }

  return errors;
}