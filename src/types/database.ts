export interface Database {
  public: {
    Tables: {
      shipments_updates: {
        Row: {
          id: string;
          shipment_id: string | null;
          pk: number;
          line_number: string;
          serial_number: string;
          transporter: string;
          driver_name: string;
          driver_phone: string;
          vehicle: string;
          values: string;
          total: number;
          status: string;
          approval_date: string | null;
          updated_by: string;
          created_at: string;
          destination_state: string | null;
          destination_locality: string | null;
          remarks: string | null;
        };
        Insert: {
          id?: string;
          shipment_id?: string | null;
          pk: number;
          line_number: string;
          serial_number: string;
          transporter: string;
          driver_name: string;
          driver_phone: string;
          vehicle: string;
          values: string;
          total?: number;
          status: string;
          approval_date?: string | null;
          updated_by: string;
          created_at?: string;
          destination_state?: string | null;
          destination_locality?: string | null;
          remarks?: string | null;
        };
        Update: {
          id?: string;
          shipment_id?: string | null;
          pk?: number;
          line_number?: string;
          serial_number?: string;
          transporter?: string;
          driver_name?: string;
          driver_phone?: string;
          vehicle?: string;
          values?: string;
          total?: number;
          status?: string;
          approval_date?: string | null;
          updated_by?: string;
          created_at?: string;
          destination_state?: string | null;
          destination_locality?: string | null;
          remarks?: string | null;
        };
      };
      // Rest of the types remain the same...
    };
  };
}