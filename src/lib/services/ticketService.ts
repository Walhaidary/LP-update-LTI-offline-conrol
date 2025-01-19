import { supabase } from '../supabase';
import type { WizardFormData } from '../../components/ticketing/wizard/types';

export async function createTicket(formData: WizardFormData): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  try {
    // Get user's vendor code
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('vendor_code')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Failed to fetch user profile: ' + profileError.message);
    }

    // Handle file upload first if there's an attachment
    let attachmentDetails = null;
    if (formData.details.attachment) {
      const file = formData.details.attachment;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('ticket-attachments')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading attachment:', uploadError);
          throw new Error('Failed to upload attachment: ' + uploadError.message);
        }

        attachmentDetails = {
          attachment_name: file.name,
          attachment_size: file.size,
          attachment_type: file.type,
          attachment_path: filePath
        };
      } catch (uploadError) {
        console.error('Error uploading attachment:', uploadError);
        throw new Error('Failed to upload attachment: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error'));
      }
    }

    // Create the ticket with all details
    const { error: ticketError } = await supabase
      .from('tickets')
      .insert({
        category_name: formData.basicInfo.category_name,
        department_name: formData.basicInfo.department_name,
        kpi_name: formData.basicInfo.kpi_name,
        assigned_to: formData.basicInfo.assigned_to,
        title: formData.details.title,
        description: formData.details.description,
        priority: formData.basicInfo.priority,
        due_date: formData.basicInfo.due_date,
        incident_date: formData.basicInfo.incident_date,
        accountability: formData.attachments.accountability,
        status_name: formData.attachments.status,
        created_by: user.id,
        vendor_code: userProfile?.vendor_code,
        ...(attachmentDetails || {})
      });

    if (ticketError) {
      console.error('Error inserting ticket:', ticketError);
      throw new Error('Failed to create ticket: ' + ticketError.message);
    }

  } catch (error) {
    console.error('Error creating ticket:', error);
    // Ensure we always throw an Error object with a clear message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred while creating the ticket');
    }
  }
}

export async function getMyTickets() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ticket_details_view')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    throw new Error('Failed to fetch tickets: ' + error.message);
  }
  return data;
}

export async function getTicketDetails(ticketNumber: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ticket_details_view')
    .select('*')
    .eq('ticket_number', ticketNumber)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching ticket details:', error);
    throw new Error('Failed to fetch ticket details: ' + error.message);
  }
  return data;
}