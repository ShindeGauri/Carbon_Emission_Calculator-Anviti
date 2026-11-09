/* ==============================================================================
   Anviti — Authentication Service
   Wraps Supabase Auth with graceful fallback when Supabase is not yet configured.
   ============================================================================== */

import { supabase, isSupabaseConfigured } from './supabase';

export async function getCurrentUser() {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.warn('Error fetching current user:', err);
    return null;
  }
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    console.warn('Error fetching current session:', err);
    return null;
  }
}

export async function signUpWithEmail(fullName, email, password) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Add credentials in .env to enable real accounts.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName.trim()
      }
    }
  });

  if (error) throw error;

  // Save the profile immediately when Supabase returns an active session.
  if (data.user && data.session) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName.trim()
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('Profile save failed:', profileError);
    }
  }

  return data;
}

export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Add credentials in .env to enable real accounts.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (!isSupabaseConfigured() || !supabase) {
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function subscribeToAuthChanges(callback) {
  if (!isSupabaseConfigured() || !supabase) {
    return { unsubscribe: () => {} };
  }
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return { unsubscribe: () => subscription.unsubscribe() };
}