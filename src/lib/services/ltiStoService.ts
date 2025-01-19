import { supabase } from '../supabase';
import type { LTISTO } from '../../types/lti-sto';

export async function getExistingLTISTOKeys(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('lti_sto')
    .select('lti_number, lti_line');

  if (error) {
    console.error('Error fetching existing LTI/STO keys:', error);
    throw new Error('Failed to check existing records');
  }

  return new Set(
    data.map(row => `${row.lti_number}-${row.lti_line}`)
  );
}

export async function uploadLTISTOData(records: Partial<LTISTO>[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get existing composite keys
  const existingKeys = await getExistingLTISTOKeys();

  // Filter out records that already exist
  const newRecords = records.filter(record => {
    const key = `${record.lti_number}-${record.lti_line}`;
    return !existingKeys.has(key);
  });

  if (newRecords.length === 0) {
    return { uploaded: 0, skipped: records.length };
  }

  // Add created_by to each record
  const recordsWithUser = newRecords.map(record => ({
    ...record,
    created_by: user.id
  }));

  const { error } = await supabase
    .from('lti_sto')
    .insert(recordsWithUser);

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload data: ${error.message}`);
  }

  return {
    uploaded: newRecords.length,
    skipped: records.length - newRecords.length
  };
}