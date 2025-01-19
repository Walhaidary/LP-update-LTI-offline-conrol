import { supabase } from './supabase';
import type { Database } from '../types/supabase';

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user data returned');

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) throw profileError;
  if (!profile) throw new Error('User profile not found');

  return profile;
}