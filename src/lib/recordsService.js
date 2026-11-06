/* ==============================================================================
   Anviti — Records Service
   Manages saving and retrieving footprint calculation records from Supabase
   with seamless local storage fallback and clearly identified demo data.
   ============================================================================== */

import { supabase, isSupabaseConfigured } from './supabase';
import { getCurrentUser } from './authService';

const LOCAL_STORAGE_KEY = 'anviti_user_records_v1';

// Realistic, transparent sample records for demo purposes
export const DEMO_RECORDS = [
  {
    id: 'demo-rec-01',
    period_label: '2 weeks ago (Oct 10-16)',
    recorded_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    is_demo: true,
    transport_mode: 'car_petrol',
    transport_km: 150,
    transport_co2e: 28.8,
    electricity_kwh: 65,
    electricity_co2e: 46.15,
    diet_type: 'meat_heavy',
    food_co2e: 35.0,
    shopping_activity: 'clothing',
    consumption_co2e: 10.0,
    total_co2e: 119.95,
    highest_category: 'electricity',
    highest_category_pct: 38.5,
    factors_used: {
      transport: 0.192,
      electricity: 0.71,
      food: 2.5,
      consumption: 10,
    },
    raw_input: {
      transport: { mode: 'car_petrol', km: 150 },
      electricity: { kwh: 65 },
      food: { diet: 'meat_heavy' },
      consumption: { activity: 'clothing' },
    },
  },
  {
    id: 'demo-rec-02',
    period_label: 'Last week (Oct 17-23)',
    recorded_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    is_demo: true,
    transport_mode: 'car_petrol',
    transport_km: 100,
    transport_co2e: 19.2,
    electricity_kwh: 50,
    electricity_co2e: 35.5,
    diet_type: 'mixed',
    food_co2e: 23.8,
    shopping_activity: 'none',
    consumption_co2e: 0,
    total_co2e: 78.5,
    highest_category: 'electricity',
    highest_category_pct: 45.2,
    factors_used: {
      transport: 0.192,
      electricity: 0.71,
      food: 1.7,
      consumption: 0,
    },
    raw_input: {
      transport: { mode: 'car_petrol', km: 100 },
      electricity: { kwh: 50 },
      food: { diet: 'mixed' },
      consumption: { activity: 'none' },
    },
  },
];

/**
 * Fetch records for the user.
 * Returns { records, source: 'supabase' | 'local' | 'demo', isDemo: boolean }
 */
export async function fetchFootprintRecords() {
  const user = await getCurrentUser();

  // 1. Try Supabase if configured and user is signed in
  if (isSupabaseConfigured() && supabase && user) {
    try {
      const { data, error } = await supabase
        .from('footprint_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, falling back to local:', error);
      } else if (data && data.length > 0) {
        return {
          records: data.map((r) => ({ ...r, is_demo: false })),
          source: 'supabase',
          isDemo: false,
        };
      }
    } catch (err) {
      console.warn('Failed to query Supabase records:', err);
    }
  }

  // 2. Check localStorage for real locally saved user records
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          records: parsed.map((r) => ({ ...r, is_demo: false })),
          source: 'local',
          isDemo: false,
        };
      }
    }
  } catch (err) {
    console.warn('Failed reading localStorage:', err);
  }

  // 3. Fallback: Return clearly labeled demo records
  return {
    records: DEMO_RECORDS,
    source: 'demo',
    isDemo: true,
  };
}

/**
 * Save a new footprint calculation record.
 */
export async function saveFootprintRecord(calculationResult) {
  const { breakdown, total, meta } = calculationResult;
  const input = meta.input || {};
  const factorsUsed = meta.factorsUsed || {};

  // Determine highest category
  let highestKey = 'transport';
  let highestVal = 0;
  Object.entries(breakdown).forEach(([k, v]) => {
    if (v > highestVal) {
      highestVal = v;
      highestKey = k;
    }
  });
  const highestPct = total > 0 ? Math.round((highestVal / total) * 1000) / 10 : 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const recordPayload = {
    period_label: `Check-in (${dateStr})`,
    transport_mode: input.transport?.mode || 'car_petrol',
    transport_km: Number(input.transport?.km) || 0,
    transport_co2e: breakdown.transport || 0,
    electricity_kwh: Number(input.electricity?.kwh) || 0,
    electricity_co2e: breakdown.electricity || 0,
    diet_type: input.food?.diet || 'mixed',
    food_co2e: breakdown.food || 0,
    shopping_activity: input.consumption?.activity || 'none',
    consumption_co2e: breakdown.consumption || 0,
    total_co2e: total,
    highest_category: highestKey,
    highest_category_pct: highestPct,
    factors_used: factorsUsed,
    raw_input: input,
    recorded_at: now.toISOString(),
    is_demo: false,
  };

  const user = await getCurrentUser();

  // If Supabase is operational & user signed in
  if (isSupabaseConfigured() && supabase && user) {
    try {
      const { data, error } = await supabase
        .from('footprint_records')
        .insert([{ ...recordPayload, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.warn('Failed to insert record into Supabase, saving locally:', error);
      } else {
        return { record: data, source: 'supabase' };
      }
    } catch (err) {
      console.warn('Supabase insert failed:', err);
    }
  }

  // Save to local storage
  const localRecord = {
    ...recordPayload,
    id: 'local-' + Date.now(),
  };

  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing = rawLocal ? JSON.parse(rawLocal) : [];
    const updated = [localRecord, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed saving to localStorage:', err);
  }

  return { record: localRecord, source: 'local' };
}

/**
 * Clear local storage records (useful for testing or switching back to demo data).
 */
export function clearLocalUserRecords() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}
