import type { WizardFormData } from './types';

export const initialFormData: WizardFormData = {
  basicInfo: {
    outboundDeliveryNumber: '',
    ltiNumber: '',
    departure: '',
    destination: '',
    transporter: '',
    unloadingPoint: '',
    consignee: '',
    frn: ''
  },
  driverInfo: {
    serialNumber: '',
    driverName: '',
    driverPhone: '',
    vehiclePlate: '',
    loadingDate: ''
  },
  lines: [],
  additionalNotes: {
    remarks: ''
  }
};