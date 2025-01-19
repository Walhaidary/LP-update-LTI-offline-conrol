import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Download, UserCircle, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TicketDetailsProps {
  ticketNumber: string;
  onBack: () => void;
}

export function TicketDetails({ ticketNumber, onBack }: TicketDetailsProps) {
  const [ticket, setTicket] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedStatus, setEditedStatus] = useState<string>('');
  const [editedAccountability, setEditedAccountability] = useState<string>('');
  const [editedAssignedTo, setEditedAssignedTo] = useState<string>('');
  const [editedDueDate, setEditedDueDate] = useState<string>('');
  const [newDescription, setNewDescription] = useState('');
  const [statuses, setStatuses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadTicketDetails();
  }, [ticketNumber]);

  const loadTicketDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsConnectionError(false);

      // Check connection first
      const { error: pingError } = await supabase.from('tickets').select('count').limit(1);
      if (pingError) {
        setIsConnectionError(true);
        throw new Error('Unable to connect to the database. Please check your connection and try again.');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user profile to check access level
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setCurrentUser(profile);

      // Load ticket details
      const { data: latestVersion, error: latestError } = await supabase
        .from('ticket_details_view')
        .select('*')
        .eq('ticket_number', ticketNumber)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (latestError) throw latestError;
      if (!latestVersion) throw new Error('Ticket not found');

      setTicket(latestVersion);
      setEditedStatus(latestVersion.status_name || '');
      setEditedAccountability(latestVersion.accountability || '');
      setEditedAssignedTo(latestVersion.assigned_to || '');
      setEditedDueDate(new Date(latestVersion.due_date).toISOString().split('T')[0]);

      // Load all versions
      const { data: allVersions, error: versionsError } = await supabase
        .from('ticket_details_view')
        .select('*')
        .eq('ticket_number', ticketNumber)
        .order('version', { ascending: false });

      if (versionsError) throw versionsError;
      
      // Process versions to track changes
      const processedVersions = allVersions?.map((version, index, array) => {
        const prevVersion = array[index + 1];
        const hasStatusChange = prevVersion && version.status_name !== prevVersion.status_name;
        const hasAssigneeChange = prevVersion && version.assigned_to !== prevVersion.assigned_to;
        const hasAccountabilityChange = prevVersion && version.accountability !== prevVersion.accountability;
        
        // Get accountability user names
        const getAccountabilityName = (userId: string | null) => {
          if (!userId) return 'None';
          const user = users.find(u => u.id === userId);
          return user ? user.full_name : 'Unknown User';
        };
        
        return {
          ...version,
          hasStatusChange,
          previousStatus: prevVersion?.status_name,
          hasAssigneeChange,
          previousAssignee: prevVersion?.assigned_to_name,
          hasAccountabilityChange,
          previousAccountability: prevVersion?.accountability,
          previousAccountabilityName: getAccountabilityName(prevVersion?.accountability),
          currentAccountabilityName: getAccountabilityName(version.accountability)
        };
      });
      
      setVersions(processedVersions || []);

      // Load available statuses
      const { data: statusesData, error: statusesError } = await supabase
        .from('statuses')
        .select('*')
        .eq('category', latestVersion.category_name)
        .order('name');

      if (statusesError) throw statusesError;
      setStatuses(statusesData || []);

      // Load assignable users
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_assignable_users');

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error loading ticket details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAttachment = async () => {
    if (!ticket?.attachment_path) return;

    try {
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .download(ticket.attachment_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = ticket.attachment_name || 'attachment';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      setError('Failed to download attachment');
    }
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      // Get next version number
      const nextVersion = Math.max(...versions.map(v => v.version)) + 1;

      // Create new version
      const { error: insertError } = await supabase
        .from('tickets')
        .insert({
          ticket_number: ticketNumber,
          version: nextVersion,
          category_name: ticket.category_name,
          department_name: ticket.department_name,
          kpi_name: ticket.kpi_name,
          assigned_to: editedAssignedTo || null,
          title: ticket.title,
          description: newDescription || ticket.description,
          priority: ticket.priority,
          due_date: editedDueDate,
          incident_date: ticket.incident_date,
          accountability: editedAccountability || null,
          status_name: editedStatus,
          attachment_name: ticket.attachment_name,
          attachment_size: ticket.attachment_size,
          attachment_type: ticket.attachment_type,
          attachment_path: ticket.attachment_path,
          created_by: user.id,
          original_created_at: ticket.original_created_at,
          vendor_code: ticket.vendor_code
        });

      if (insertError) throw insertError;

      await loadTicketDetails();
      setNewDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if user has permission to edit accountability
  const canEditAccountability = currentUser?.access_level >= 4;

  if (isConnectionError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">Connection Error</h3>
        <p className="text-red-600 text-center mb-4">
          Unable to connect to the database. Please check your connection and try again.
        </p>
        <button
          onClick={loadTicketDetails}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">Ticket Details - {ticket.ticket_number}</h2>
      </div>

      {/* Assigned User Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Assigned To</h3>
              <select
                value={editedAssignedTo}
                onChange={(e) => setEditedAssignedTo(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Title</label>
            <p className="mt-1 text-lg">{ticket.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Category</label>
            <p className="mt-1">{ticket.category_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Department</label>
            <p className="mt-1">{ticket.department_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">KPI</label>
            <p className="mt-1">{ticket.kpi_name}</p>
          </div>

          {ticket.attachment_name && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Attachment</label>
              <button
                onClick={handleDownloadAttachment}
                className="mt-1 flex items-center gap-2 text-primary hover:text-primary-hover"
              >
                <Download className="w-4 h-4" />
                <span>{ticket.attachment_name}</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Priority</label>
            <p className="mt-1 capitalize">{ticket.priority}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Due Date</label>
            <div className="mt-1 relative">
              <input
                type="date"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Incident Date</label>
            <p className="mt-1">{new Date(ticket.incident_date).toLocaleDateString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Created By</label>
            <p className="mt-1">{ticket.created_by_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Created Date</label>
            <p className="mt-1">{new Date(ticket.original_created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Status and Accountability */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h4 className="font-medium mb-2">Status</h4>
          <select
            value={editedStatus}
            onChange={(e) => setEditedStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
          >
            <option value="">Select Status</option>
            {statuses.map(status => (
              <option key={status.id} value={status.name}>
                {status.name}
              </option>
            ))}
          </select>
          {statuses.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">
              No statuses available for this category
            </p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h4 className="font-medium mb-2">Accountability</h4>
          <select
            value={editedAccountability}
            onChange={(e) => setEditedAccountability(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary ${
              !canEditAccountability ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={!canEditAccountability}
          >
            <option value="">Select Accountable User</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>
          {!canEditAccountability && (
            <p className="mt-2 text-sm text-amber-600">
              Only WH Managers and Admins can set accountability
            </p>
          )}
        </div>
      </div>

      {/* Version History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Version History</h3>
        
        {/* New Description Input */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-primary" />
            <h4 className="font-medium">Add New Description</h4>
          </div>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Enter new description..."
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary resize-y"
            rows={3}
          />
        </div>

        {/* Update Button */}
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            disabled={isUpdating || (!newDescription && !editedStatus && !editedAccountability && !editedAssignedTo && editedDueDate === new Date(ticket.due_date).toISOString().split('T')[0])}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Ticket'}
          </button>
        </div>

        {/* Version List */}
        <div className="space-y-4">
          {versions.map((version) => (
            <div key={version.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{version.created_by_name}</span>
                <span>{new Date(version.created_at).toLocaleString()}</span>
              </div>
              {version.hasStatusChange && (
                <p className="text-gray-600 mb-2">
                  Status changed from "{version.previousStatus || 'none'}" to "{version.status_name}"
                </p>
              )}
              {version.hasAssigneeChange && (
                <p className="text-gray-600 mb-2">
                  Assignee changed from "{version.previousAssignee || 'Unassigned'}" to "{version.assigned_to_name || 'Unassigned'}"
                </p>
              )}
              {version.hasAccountabilityChange && (
                <p className="text-gray-600 mb-2">
                  Accountability changed from "{version.previousAccountabilityName}" to "{version.currentAccountabilityName}"
                </p>
              )}
              {version.description && (
                <p className="text-gray-600 whitespace-pre-wrap">{version.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}