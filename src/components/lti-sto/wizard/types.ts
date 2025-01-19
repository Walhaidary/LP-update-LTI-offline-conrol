export interface BasicInfo {
  offlineApprovalNumber: string;
  dispatchType: 'offline' | 'nfi';
  transporterName: string;
  transporterCode: string;
  ltiDate: string;
  originCo: string;
  originLocation: string;
  originSlDesc: string;
}

export interface Destination {
  destinationLocation: string;
  destinationSl: string;
  frnCf: string;
  consignee: string;
}

export interface Line {
  id: string;
  lineNumber: string;
  batchNumber: string;
  commodityDescription: string;
  netQuantity: string;
  grossQuantity: string;
  remarks: string;
}

export interface Additional {
  tpoNumber: string;
  remarks: string;
}

export interface WizardFormData {
  basicInfo: BasicInfo;
  destination: Destination;
  lines: Line[];
  additional: Additional;
}

// Initialize with default values
export const initialFormData: WizardFormData = {
  basicInfo: {
    offlineApprovalNumber: '',
    dispatchType: 'offline',
    transporterName: '',
    transporterCode: '',
    ltiDate: '',
    originCo: '',
    originLocation: '',
    originSlDesc: ''
  },
  destination: {
    destinationLocation: '',
    destinationSl: '',
    frnCf: '',
    consignee: ''
  },
  lines: [],
  additional: {
    tpoNumber: '',
    remarks: ''
  }
};