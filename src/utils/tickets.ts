/**
 * Calculate lead time in days for a ticket
 * @param createdAt - Ticket creation date
 * @param status - Current ticket status
 * @param statusChangedAt - Date when status was last changed
 * @returns Formatted lead time string
 */
export function calculateLeadTime(
  createdAt: string, 
  status: string | null, 
  statusChangedAt: string | null
): string {
  if (!createdAt) return '-';

  const startDate = new Date(createdAt);
  
  // For invalid dates, return '-'
  if (isNaN(startDate.getTime())) return '-';

  // Calculate difference in days
  const endDate = new Date();
  if (status?.toLowerCase().includes('closed') || 
      status?.toLowerCase().includes('rejected') || 
      status?.toLowerCase().includes('approved')) {
    // For closed tickets, use status change date
    const closeDate = statusChangedAt ? new Date(statusChangedAt) : endDate;
    const diffTime = Math.abs(closeDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} (Final)`;
  }

  // For open tickets, calculate current lead time
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays.toString();
}