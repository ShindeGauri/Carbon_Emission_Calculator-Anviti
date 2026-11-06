/* ==============================================================================
   Anviti — Rule-Based Recommendation Engine
   Generates transparent, quantified, practical climate actions based on
   the user's detected emission hotspot and activity data.
   (No fake AI — 100% deterministic, evidence-backed rules.)
   ============================================================================== */

export function getRecommendations(hotspot, _breakdown, rawInput = {}) {
  if (!hotspot || !hotspot.key) {
    return [];
  }

  const { key: category, value } = hotspot;
  const list = [];

  switch (category) {
    case 'transport': {
      const mode = rawInput.transport?.mode || 'car_petrol';
      const km = Number(rawInput.transport?.km) || 0;
      const isCar = mode === 'car_petrol' || mode === 'car_diesel';

      if (isCar && km > 40) {
        const potentialSaved = Math.round(km * 0.3 * (0.192 - 0.041) * 10) / 10;
        list.push({
          id: 'tr-01',
          category: 'transport',
          title: 'Shift 30% of weekly commute to metro or bus',
          description: `Switching roughly ${(km * 0.3).toFixed(0)} km of driving to public transit reduces high single-occupancy vehicle emissions while avoiding traffic congestion.`,
          estimatedReduction: `~${potentialSaved} kg CO₂e / week`,
          effort: 'Moderate',
          categoryLabel: 'Transport',
          badge: 'High Impact',
        });
      }

      list.push({
        id: 'tr-02',
        category: 'transport',
        title: 'Replace short trips (< 3 km) with walking or cycling',
        description: 'Cold vehicle engines produce peak emissions during the first few kilometers. Active travel produces zero tailpipe emissions and improves cardiovascular health.',
        estimatedReduction: '~3 to 6 kg CO₂e / week',
        effort: 'Low',
        categoryLabel: 'Transport',
        badge: 'Easy Start',
      });

      list.push({
        id: 'tr-03',
        category: 'transport',
        title: 'Carpool or consolidate errands',
        description: 'Combining multiple weekly trips into a single planned circuit and carpooling with colleagues halves per-passenger travel intensity.',
        estimatedReduction: '~5 to 12 kg CO₂e / week',
        effort: 'Moderate',
        categoryLabel: 'Transport',
        badge: 'Collaborative',
      });
      break;
    }

    case 'electricity': {
      const estimatedTempSave = Math.round(value * 0.12 * 10) / 10;

      list.push({
        id: 'el-01',
        category: 'electricity',
        title: 'Optimize thermostat / AC setpoint by 1–2°C',
        description: 'Heating and cooling comprise up to 50% of residential energy use. Keeping indoor AC at 24–25°C instead of 20°C reduces compressor runtime significantly.',
        estimatedReduction: `~${estimatedTempSave > 0 ? estimatedTempSave : '5.5'} kg CO₂e / week`,
        effort: 'Low',
        categoryLabel: 'Electricity',
        badge: 'High Impact',
      });

      list.push({
        id: 'el-02',
        category: 'electricity',
        title: 'Eliminate standby "phantom power" loads',
        description: 'Entertainment systems, monitors, and chargers left plugged in draw continuous idle power. Using switched power strips eliminates unnecessary draw.',
        estimatedReduction: '~2.5 to 5 kg CO₂e / week',
        effort: 'Low',
        categoryLabel: 'Electricity',
        badge: 'Easy Start',
      });

      list.push({
        id: 'el-03',
        category: 'electricity',
        title: 'Schedule high-load appliances during solar hours',
        description: 'Running washing machines and dishwashers during peak daytime sun capitalizes on cleaner grid mix when renewable generation is highest.',
        estimatedReduction: '~2 to 4 kg CO₂e / week',
        effort: 'Low',
        categoryLabel: 'Electricity',
        badge: 'Habit Change',
      });
      break;
    }

    case 'food': {
      const diet = rawInput.food?.diet || 'mixed';

      if (diet === 'meat_heavy' || diet === 'mixed') {
        list.push({
          id: 'fd-01',
          category: 'food',
          title: 'Introduce two plant-based days weekly ("Meatless Days")',
          description: 'Ruminant meat has an emission intensity up to 10× higher than pulses and plant proteins. Replacing 4 meat meals per week creates immediate carbon reduction.',
          estimatedReduction: '~6.0 to 9.5 kg CO₂e / week',
          effort: 'Moderate',
          categoryLabel: 'Food',
          badge: 'High Impact',
        });
      }

      list.push({
        id: 'fd-02',
        category: 'food',
        title: 'Plan meals to minimize household food spoilage',
        description: 'Roughly a third of all food produced is wasted globally. Meal planning and proper cold storage prevent methane generation in municipal landfills.',
        estimatedReduction: '~3.0 to 5.0 kg CO₂e / week',
        effort: 'Low',
        categoryLabel: 'Food',
        badge: 'Easy Start',
      });

      list.push({
        id: 'fd-03',
        category: 'food',
        title: 'Choose seasonal and regionally produced groceries',
        description: 'Locally grown seasonal produce eliminates long-distance air and refrigerated freight while supporting regional agro-ecosystems.',
        estimatedReduction: '~2.0 to 4.0 kg CO₂e / week',
        effort: 'Moderate',
        categoryLabel: 'Food',
        badge: 'Sustainable Living',
      });
      break;
    }

    case 'consumption': {
      list.push({
        id: 'cs-01',
        category: 'consumption',
        title: 'Extend device lifespan before upgrading',
        description: 'Over 80% of a smartphone or laptop’s lifetime carbon emissions occur during manufacturing and mineral extraction. Extending usage by 1 year saves significant embodied CO₂.',
        estimatedReduction: '~15 to 40 kg CO₂e / month',
        effort: 'Moderate',
        categoryLabel: 'Consumption',
        badge: 'High Impact',
      });

      list.push({
        id: 'cs-02',
        category: 'consumption',
        title: 'Adopt the "Repair & Refurbish" first habit',
        description: 'Choose certified refurbished electronics or repair damaged clothing and appliances before buying new replacements.',
        estimatedReduction: '~10 to 30 kg CO₂e / item',
        effort: 'Low',
        categoryLabel: 'Consumption',
        badge: 'Circular Economy',
      });

      list.push({
        id: 'cs-03',
        category: 'consumption',
        title: '30-Day reflection rule for non-essential purchases',
        description: 'Pausing impulse purchases on fast-fashion or gadgets prevents premature disposal and unnecessary material manufacturing cycles.',
        estimatedReduction: '~5 to 20 kg CO₂e / month',
        effort: 'Low',
        categoryLabel: 'Consumption',
        badge: 'Mindful Living',
      });
      break;
    }

    default:
      break;
  }

  return list;
}
