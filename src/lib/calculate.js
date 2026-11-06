/* ==============================================================================
   Anviti — Carbon Calculation Engine
   Formula: activity amount × emission factor = kg CO₂e
   Provides transparent category breakdowns, metadata, and mathematical trace.
   ============================================================================== */

import { EMISSION_FACTORS } from './emissionFactors';

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

/**
 * Calculates estimated CO₂e footprint across all 4 key lifestyle categories.
 *
 * @param {Object} input - Activity data from the user form
 * @returns {Object} - { breakdown, total, meta }
 */
export function calculateFootprint(input = {}) {
  // 1. TRANSPORTATION
  // Distance (km) × Factor (kg CO₂e/km)
  const transportMode = input.transport?.mode || 'car_petrol';
  const transportKm = Math.max(0, Number(input.transport?.km) || 0);
  const transportFactor = EMISSION_FACTORS.transport[transportMode] ?? 0.192;
  const transport = transportKm * transportFactor;

  // 2. ELECTRICITY & HOUSEHOLD ENERGY
  // kwh × Factor (0.71 kg CO₂e/kWh based on national grid average)
  const rawElectricityKwh = Math.max(0, Number(input.electricity?.kwh) || 0);
  const electricityPeriod = input.electricity?.period || 'weekly';
  // If user inputs monthly bill, prorate to weekly (~4.33 weeks per month)
  const effectiveElectricityKwh = electricityPeriod === 'monthly'
    ? rawElectricityKwh / 4.333
    : rawElectricityKwh;

  const electricityFactor = EMISSION_FACTORS.electricity.grid_kwh;
  const electricity = effectiveElectricityKwh * electricityFactor;

  // 3. FOOD
  // 14 main meals per week (2 per day) × diet emission factor
  const MEALS_PER_WEEK = 14;
  const dietType = input.food?.diet || 'mixed';
  const foodFactor = EMISSION_FACTORS.food[dietType] ?? 1.7;
  const food = MEALS_PER_WEEK * foodFactor;

  // 4. CONSUMPTION & SHOPPING
  // Embodied emission estimate based on recent shopping activity
  const consumptionKey = input.consumption?.activity || 'none';
  const consumptionFactor = EMISSION_FACTORS.consumption[consumptionKey] ?? 0;
  // If item is monthly, amortize to weekly for consistency
  const consumptionPeriod = input.consumption?.period || 'weekly';
  const consumption = consumptionPeriod === 'monthly'
    ? consumptionFactor / 4.333
    : consumptionFactor;

  // 5. TOTAL
  const total = transport + electricity + food + consumption;

  const breakdown = {
    transport: round2(transport),
    electricity: round2(electricity),
    food: round2(food),
    consumption: round2(consumption),
  };

  return {
    breakdown,
    total: round2(total),
    meta: {
      input,
      effectiveValues: {
        transportKm: round2(transportKm),
        electricityKwh: round2(effectiveElectricityKwh),
        dietType,
        consumptionKey,
      },
      factorsUsed: {
        transport: transportFactor,
        electricity: electricityFactor,
        food: foodFactor,
        consumption: consumptionFactor,
      },
      assumptions: {
        transportUnit: 'kg CO₂e per km',
        electricityUnit: 'kg CO₂e per kWh (Indian grid mix: ~0.71)',
        foodAssumption: '14 primary meals per week across diet profile',
        consumptionAssumption: 'Embodied cradle-to-gate lifecycle factor',
      },
    },
  };
}
