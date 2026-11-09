
import { supabase, isSupabaseConfigured } from './supabase';

export async function checkIsAdmin(userId) {
  if (!userId || !isSupabaseConfigured() || !supabase) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Admin verification failed:', error);
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}
