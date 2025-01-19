export interface TableColumn {
  label: string;
  field: string;
  format?: (value: any) => string;
}

export interface WizardFormData {
  firstName: string;
  lastName: string;
  notes: string;
}

export interface FilterState {
  transporter: string;
  startDate: string;
  endDate: string;
  destination: string;
  commodity: string;
  department?: string;
  kpi?: string;
  status?: string;
}