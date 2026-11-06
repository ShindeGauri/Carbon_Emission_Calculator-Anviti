/* ==============================================================================
   Anviti — Carbon Hotspot Detection
   Identifies the dominant emission driver from category calculations.
   Deterministic analysis without opaque models.
   ============================================================================== */

const HIGH_SHARE = 45;      // >= 45% represents a dominant single driver
const MODERATE_SHARE = 30;  // >= 30% represents a leading contributor

const LABELS = {
  transport: 'Transportation',
  electricity: 'Electricity & Energy',
  food: 'Food & Nutrition',
  consumption: 'Goods & Consumption',
};

/**
 * Finds the largest carbon category and calculates concentration intensity.
 *
 * @param {Object} breakdown - { transport: n, electricity: n, food: n, consumption: n }
 * @returns {Object|null}
 */
export function findHotspot(breakdown) {
  if (!breakdown || typeof breakdown !== 'object') return null;

  const entries = Object.entries(breakdown);
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, val]) => sum + (Number(val) || 0), 0);
  if (total <= 0) return null;

  let biggestKey = entries[0][0];
  let biggestValue = Number(entries[0][1]) || 0;

  for (const [key, val] of entries) {
    const num = Number(val) || 0;
    if (num > biggestValue) {
      biggestKey = key;
      biggestValue = num;
    }
  }

  const percentage = (biggestValue / total) * 100;

  let share;
  if (percentage >= HIGH_SHARE) share = 'dominant';
  else if (percentage >= MODERATE_SHARE) share = 'leading';
  else share = 'balanced';

  const explanation = buildExplanation(biggestKey, biggestValue, percentage, share);

  return {
    key: biggestKey,
    label: LABELS[biggestKey] || biggestKey,
    value: Math.round(biggestValue * 100) / 100,
    percentage: Math.round(percentage * 10) / 10,
    share,
    explanation,
  };
}

function buildExplanation(key, value, percentage, share) {
  const label = LABELS[key] ?? key;
  const pct = percentage.toFixed(0);

  if (share === 'dominant') {
    return `${label} accounts for ${pct}% of your total footprint (${value.toFixed(1)} kg CO₂e). Concentrating your reduction efforts here will have the highest immediate impact.`;
  }
  if (share === 'leading') {
    return `${label} is your leading source at ${pct}% of your footprint (${value.toFixed(1)} kg CO₂e). It represents your primary opportunity for weekly reduction.`;
  }
  return `Your footprint is distributed evenly across categories, with ${label} slightly ahead at ${pct}% (${value.toFixed(1)} kg CO₂e). Incremental improvements across 2–3 categories will compound quickly.`;
}
