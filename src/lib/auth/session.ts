import { supabase } from '../supabase';
import { AUTH_CONSTANTS } from './constants';

export async function refreshSession(): Promise<boolean> {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return false;
  }

  // Check if session is expired
  const expiresAt = new Date(session.expires_at!).getTime();
  const now = new Date().getTime();
  
  if (now >= expiresAt) {
    const { error: refreshError } = await supabase.auth.refreshSession();
    return !refreshError;
  }

  return true;
}