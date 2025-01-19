export interface ShipmentDetails {
  shipmentId: string;
  transporterId: string;
  vehicleId: string;
}

export interface DriverDetails {
  name: string;
  phone: string;
  licenseNumber: string;
}

export interface CargoDetails {
  type: string;
  weight: string;
  quantity: string;
}

export interface MonitorFormData {
  shipmentDetails: ShipmentDetails;
  driverDetails: DriverDetails;
  cargoDetails: CargoDetails;
  notes: string;
}