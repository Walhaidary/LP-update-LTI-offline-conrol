export const SHIPMENT_STATUSES = [
  'sc_approved',
  'reported_to_wh',
  'lo_issued',
  'under_loading',
  'loading_completed',
  'arrived_to_mi_if',
  'departed_mi_if',
  'in_transit',
  'arrived_to_destination'
] as const;

export const STATUS_LABELS = {
  sc_approved: 'SC Approved',
  reported_to_wh: 'Reported to WH',
  lo_issued: 'LO Issued',
  under_loading: 'Under Loading',
  loading_completed: 'Loading Completed',
  arrived_to_mi_if: 'Arrived to MI IF',
  departed_mi_if: 'Departed MI IF',
  in_transit: 'In Transit',
  arrived_to_destination: 'Arrived to Destination'
} as const;