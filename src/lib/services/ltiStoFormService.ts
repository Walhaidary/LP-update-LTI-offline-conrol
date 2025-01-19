import { supabase } from '../supabase';
import type { WizardFormData } from '../../components/lti-sto/wizard/types';

export async function submitLTISTOForm(formData: WizardFormData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  try {
    // Get the latest ML- number
    const { data: lastLTI, error: ltiError } = await supabase
      .from('lti_sto')
      .select('lti_number')
      .ilike('lti_number', 'ML-%')
      .order('lti_number', { ascending: false })
      .limit(1);

    if (ltiError) throw ltiError;

    // Generate new LTI number
    let ltiNumber = 'ML-0000001';
    if (lastLTI && lastLTI.length > 0) {
      const lastNumber = parseInt(lastLTI[0].lti_number.substring(3));
      ltiNumber = `ML-${String(lastNumber + 1).padStart(7, '0')}`;
    }

    // Transform form data into database records
    const records = formData.lines.map(line => ({
      lti_number: ltiNumber,
      lti_line: line.lineNumber,
      transporter_name: formData.basicInfo.transporterName,
      transporter_code: formData.basicInfo.transporterCode,
      lti_date: formData.basicInfo.ltiDate,
      origin_co: formData.basicInfo.originCo,
      origin_location: formData.basicInfo.originLocation,
      origin_sl_desc: formData.basicInfo.originSlDesc,
      destination_location: formData.destination.destinationLocation,
      destination_sl: formData.destination.destinationSl,
      frn_cf: formData.destination.frnCf || null,
      consignee: formData.destination.consignee || null,
      batch_number: line.batchNumber || null,
      commodity_description: line.commodityDescription,
      lti_qty_net: parseFloat(line.netQuantity) || 0,
      lti_qty_gross: parseFloat(line.grossQuantity) || 0,
      tpo_number: formData.additional.tpoNumber || null,
      remarks: line.remarks || null,
      created_by: user.id,
      offline_ticket_approval: formData.basicInfo.offlineApprovalNumber
    }));

    // Insert all records
    const { data, error: insertError } = await supabase
      .from('lti_sto')
      .insert(records)
      .select();

    if (insertError) throw insertError;
    
    // Return the first record for reference
    return data?.[0] || null;
  } catch (err) {
    console.error('Error submitting LTI/STO:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to submit LTI/STO');
  }
}