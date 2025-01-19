export interface BasicInfo {
  outboundDeliveryNumber: string;
  ltiNumber: string;
  departure: string;
  destination: string;
  transporter: string;
  unloadingPoint: string;
  consignee: string;
  frn: string;
}

export interface DriverInfo {
  serialNumber: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  loadingDate: string;
}

export interface DeliveryLine {
  id: string;
  outboundDeliveryItemNumber: string;
  ltiLine?: string;
  materialDescription: string;
  batchNumber?: string;
  units?: string;
  mtNet: string;
  gateNumber: string;
  storageLocationName: string;
}

export interface AdditionalNotes {
  remarks: string;
}

export interface WizardFormData {
  basicInfo: BasicInfo;
  driverInfo: DriverInfo;
  lines: DeliveryLine[];
  additionalNotes: AdditionalNotes;
}