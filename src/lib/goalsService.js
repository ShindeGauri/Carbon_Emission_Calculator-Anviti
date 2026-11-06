/* ==============================================================================
   Anviti — Goals Service
   Manages user sustainability commitments and tracking with Supabase
   cloud persistence and local storage fallback.
   ============================================================================== */

import { supabase, isSupabaseConfigured } from './supabase';
import { getCurrentUser } from './authService';

const LOCAL_STORAGE_GOALS_KEY = 'anviti_user_goals_v1';

const DEFAULT_SAMPLE_GOALS = [
  {
    id: 'sample-goal-1',
    title: 'Adjust AC setpoint to 24°C to curb cooling power',
    category: 'electricity',
    target_reduction_kg: 5.5,
    status: 'active',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    is_sample: true,
  },
  {
    id: 'sample-goal-2',
    title: 'Replace short grocery runs (< 3 km) with walking or cycling',
    category: 'transport',
    target_reduction_kg: 3.8,
    status: 'completed',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    is_sample: true,
  },
];

/**
 * Fetch all goals for the current user.
 */
export async function fetchGoals() {
  const user = await getCurrentUser();

  // 1. Supabase when configured and user logged in
  if (isSupabaseConfigured() && supabase && user) {
    try {
      const { data, error } = await supabase
        .from('sustainability_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase goals fetch error:', error);
      } else if (data) {
        return { goals: data, source: 'supabase' };
      }
    } catch (err) {
      console.warn('Failed fetching goals from Supabase:', err);
    }
  }

  // 2. Local storage fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GOALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return { goals: parsed, source: 'local' };
      }
    }
  } catch (err) {
    console.warn('Failed reading local goals:', err);
  }

  // 3. Default sample goals if none exist yet
  return { goals: DEFAULT_SAMPLE_GOALS, source: 'sample' };
}

/**
 * Save a new sustainability goal (e.g. from chat or action plan).
 */
export async function createGoal({ title, category = 'general', target_reduction_kg = 5.0 }) {
  if (!title || !title.trim()) {
    throw new Error('Goal title cannot be empty.');
  }

  const user = await getCurrentUser();
  const newGoalPayload = {
    title: title.trim(),
    category: category.toLowerCase(),
    target_reduction_kg: Number(target_reduction_kg) || 5.0,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  // 1. If Supabase configured & user logged in
  if (isSupabaseConfigured() && supabase && user) {
    try {
      const { data, error } = await supabase
        .from('sustainability_goals')
        .insert([{ ...newGoalPayload, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.warn('Supabase goal insert error, falling back to local:', error);
      } else if (data) {
        return { goal: data, source: 'supabase' };
      }
    } catch (err) {
      console.warn('Failed inserting goal to Supabase:', err);
    }
  }

  // 2. Save locally
  const localGoal = {
    ...newGoalPayload,
    id: 'local-goal-' + Date.now(),
    is_sample: false,
  };

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GOALS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [localGoal, ...existing.filter((g) => !g.is_sample)];
    localStorage.setItem(LOCAL_STORAGE_GOALS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed saving goal locally:', err);
  }

  return { goal: localGoal, source: 'local' };
}

/**
 * Toggle goal status ('active' | 'completed').
 */
export async function updateGoalStatus(goalId, newStatus) {
  const user = await getCurrentUser();

  if (isSupabaseConfigured() && supabase && user && !goalId.startsWith('local-')) {
    try {
      await supabase
        .from('sustainability_goals')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', goalId)
        .eq('user_id', user.id);
    } catch (err) {
      console.warn('Failed updating goal in Supabase:', err);
    }
  }

  // Update in local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GOALS_KEY);
    if (raw) {
      const existing = JSON.parse(raw);
      const updated = existing.map((g) => (g.id === goalId ? { ...g, status: newStatus } : g));
      localStorage.setItem(LOCAL_STORAGE_GOALS_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed updating goal locally:', err);
  }

  return { success: true };
}
