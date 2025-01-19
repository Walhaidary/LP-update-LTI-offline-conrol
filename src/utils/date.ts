/**
 * Format a date into YYYY-MM-DD format for input[type="date"]
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}