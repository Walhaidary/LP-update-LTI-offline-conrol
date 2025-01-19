import { Database } from './database';

export type LTISTO = Database['public']['Tables']['lti_sto']['Row'];

export interface LTISTOExcelRow {
  'Transporter name': string;
  'Transporter code': string;
  'LTI number': string;
  'LTI line': string;
  'LTI date': string | Date;
  'Origin CO': string;
  'Origin loc.': string;
  'Origin SL Desc.': string;
  'Dest. Loc.': string;
  'Dest. SL': string;
  'FRN/CF': string;
  'Consignee': string;
  'Batch number': string;
  'Commod. Desc.': string;
  'LTI qty (MT) Net': number;
  'LTI qty (MT) Gross': number;
  'TPO Number': string;
}

export const LTI_STO_COLUMN_MAPPINGS = {
  'Transporter name': 'transporter_name',
  'Transporter code': 'transporter_code',
  'LTI number': 'lti_number',
  'LTI line': 'lti_line',
  'LTI date': 'lti_date',
  'Origin CO': 'origin_co',
  'Origin loc.': 'origin_location',
  'Origin SL Desc.': 'origin_sl_desc',
  'Dest. Loc.': 'destination_location',
  'Dest. SL': 'destination_sl',
  'FRN/CF': 'frn_cf',
  'Consignee': 'consignee',
  'Batch number': 'batch_number',
  'Commod. Desc.': 'commodity_description',
  'LTI qty (MT) Net': 'lti_qty_net',
  'LTI qty (MT) Gross': 'lti_qty_gross',
  'TPO Number': 'tpo_number'
} as const;