/* ============================================
   Anviti — Emission Factors (PROTOTYPE VALUES)
   ============================================

   ⚠️  IMPORTANT: These are simplified, rounded sample
   factors chosen for a hackathon prototype. They are
   in the right ballpark, but they are NOT audited or
   region-specific.

   Units: kilograms of CO₂-equivalent per unit of activity
   (kg CO₂e / km, / kWh, / meal, etc.)

   For a production app, you'd replace these with:
   - UK DEFRA conversion factors (updated yearly)
   - India CEA grid emission factor
   - Poore & Nemecek (2018) for food
   ============================================ */

export const EMISSION_FACTORS = {
  // ---------- Transport (kg CO₂e per km) ----------
  // Different modes emit very different amounts per km.
  transport: {
    car_petrol:   0.192,
    car_diesel:   0.171,
    car_electric: 0.053,
    bus:          0.105,
    train:        0.041,
    bike:         0.0,   // walking/cycling ~ zero direct emissions
  },

  // ---------- Electricity (kg CO₂e per kWh) ----------
  // This one factor is by itself an object so we can
  // swap in a region later. For now, one global-ish number.
  electricity: {
    grid_kwh: 0.71,
  },

  // ---------- Food (kg CO₂e per meal) ----------
  // Rough per-meal averages across a typical day.
  // We're not asking the user for meal counts, so we
  // treat the diet choice as "one representative day".
  food: {
    meat_heavy:  2.5,
    mixed:       1.7,
    vegetarian:  1.0,
    vegan:       0.7,
  },

  // ---------- Consumption (kg CO₂e per item) ----------
  // Very rough, "typical item" values for a hackathon.
  consumption: {
    none:              0,
    clothing:          10,
    small_electronics: 50,
    large_electronics: 300,
  },
};