import { supabase } from '../supabase';
import type { WizardFormData } from '../../components/obd-waybill/wizard/types';

export async function submitOBDWaybill(formData: WizardFormData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  try {
    // First, get a new OBD number by inserting a single record and retrieving its number
    const { data: firstLine, error: firstLineError } = await supabase
      .from('obd_waybill')
      .insert({
        outbound_delivery_item_number: '010',
        batch_number: formData.lines[0].batchNumber || null,
        storage_location_name: formData.lines[0].storageLocationName,
        material_description: formData.lines[0].materialDescription,
        unit: formData.lines[0].units || 'MT',
        mt_net: parseFloat(formData.lines[0].mtNet) || 0,
        lti: formData.basicInfo.ltiNumber,
        driver_name: formData.driverInfo.driverName,
        driver_license_id: formData.driverInfo.serialNumber,
        vehicle_plate: formData.driverInfo.vehiclePlate,
        loading_date: formData.driverInfo.loadingDate,
        departure: formData.basicInfo.departure,
        destination: formData.basicInfo.destination,
        transporter_name: formData.basicInfo.transporter,
        unloading_point: formData.basicInfo.unloadingPoint || null,
        consignee: formData.basicInfo.consignee || null,
        frn_cf_number: formData.basicInfo.frn || null, // Add this line
        gate_number: formData.lines[0].gateNumber || null,
        remarks: formData.additionalNotes.remarks || null,
        created_by: user.id
      })
      .select('outbound_delivery_number')
      .single();

    if (firstLineError) throw firstLineError;
    if (!firstLine) throw new Error('Failed to create first line');

    // If there are more lines, insert them with the same OBD number
    if (formData.lines.length > 1) {
      const remainingLines = formData.lines.slice(1).map((line, index) => ({
        outbound_delivery_number: firstLine.outbound_delivery_number,
        outbound_delivery_item_number: ((index + 2) * 10).toString().padStart(3, '0'),
        batch_number: line.batchNumber || null,
        storage_location_name: line.storageLocationName,
        material_description: line.materialDescription,
        unit: line.units || 'MT',
        mt_net: parseFloat(line.mtNet) || 0,
        lti: formData.basicInfo.ltiNumber,
        driver_name: formData.driverInfo.driverName,
        driver_license_id: formData.driverInfo.serialNumber,
        vehicle_plate: formData.driverInfo.vehiclePlate,
        loading_date: formData.driverInfo.loadingDate,
        departure: formData.basicInfo.departure,
        destination: formData.basicInfo.destination,
        transporter_name: formData.basicInfo.transporter,
        unloading_point: formData.basicInfo.unloadingPoint || null,
        consignee: formData.basicInfo.consignee || null,
        frn_cf_number: formData.basicInfo.frn || null, // Add this line
        gate_number: line.gateNumber || null,
        remarks: formData.additionalNotes.remarks || null,
        created_by: user.id
      }));

      const { error: remainingLinesError } = await supabase
        .from('obd_waybill')
        .insert(remainingLines);

      if (remainingLinesError) throw remainingLinesError;
    }

    return firstLine;
  } catch (error) {
    console.error('Error submitting OBD/Waybill:', error);
    throw error;
  }
}