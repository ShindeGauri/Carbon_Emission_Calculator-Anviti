/* ==============================================================================
   Anviti — Sustainability Assistant Engine (Rule-Based & Context Grounded)
   Provides 100% deterministic, evidence-backed environmental guidance
   strictly adhering to Anviti's emission factors, user authorization, and data privacy.
   ============================================================================== */

import { EMISSION_FACTORS } from './emissionFactors';

/**
 * Generates an intelligent, grounded response to a user query.
 *
 * @param {string} userQuery
 * @param {Object} context - Safe authorized summary of user environmental data
 * @returns {Object} - { text, actions, suggestedGoal, source: 'rule-based' }
 */
export function processAssistantQuery(userQuery, context = {}) {
  const query = (userQuery || '').toLowerCase().trim();
  const {
    isAuthenticated = false,
    userEmail = null,
    latestRecord = null,
    historicalCount = 0,
    activeGoals = [],
    recommendations = [],
  } = context;

  const displayName = userEmail ? userEmail.split('@')[0] : 'friend';

  // ---------------------------------------------------------------------------
  // 1. "Biggest source of emissions" / Hotspot query
  // ---------------------------------------------------------------------------
  if (
    query.includes('biggest source') ||
    query.includes('hotspot') ||
    query.includes('highest emission') ||
    query.includes('main source') ||
    query.includes('what emits the most')
  ) {
    if (!isAuthenticated || !latestRecord) {
      return {
        text: `To see your personal biggest emission source, log your weekly activity in the Calculator! For most urban households, **Electricity & Home Energy** (~40–45%) and **Transportation** (~30–35%) represent the two largest contributors.`,
        actions: [
          { label: 'Open Calculator', tab: 'calculator' },
          { label: 'Explore What-If Simulator', tab: 'simulator' },
        ],
        source: 'rule-based',
      };
    }

    const { highest_category, highest_category_pct, total_co2e, breakdown = {} } = latestRecord;
    const catLabels = {
      transport: 'Transportation (driving & travel)',
      electricity: 'Electricity & Home Energy',
      food: 'Food & Nutrition',
      consumption: 'Goods & Shopping',
    };

    const catName = catLabels[highest_category] || highest_category;
    const catVal = breakdown[highest_category] || 0;

    return {
      text: `Based on your latest recorded check-in, your **biggest source of emissions** is **${catName}**.

It generated **${catVal} kg CO₂e**, representing **${highest_category_pct}%** of your total weekly footprint (${total_co2e} kg CO₂e).

Because this is your primary driver, focusing on 1 or 2 small adjustments here will produce the fastest and most meaningful reductions.`,
      actions: [
        { label: 'Open My Dashboard', tab: 'dashboard' },
        { label: 'Open My Action Plan', tab: 'recommendations' },
        { label: 'Simulate Reductions', tab: 'simulator' },
      ],
      source: 'rule-based',
    };
  }

  // ---------------------------------------------------------------------------
  // 2. "How can I reduce my carbon footprint?" / Reduction advice
  // ---------------------------------------------------------------------------
  if (
    query.includes('how can i reduce') ||
    query.includes('reduce my carbon') ||
    query.includes('lower my footprint') ||
    query.includes('cut emissions') ||
    query.includes('ways to reduce')
  ) {
    if (isAuthenticated && latestRecord && recommendations.length > 0) {
      const topRec = recommendations[0];
      const secondRec = recommendations[1] || null;

      let responseText = `Here are the highest-impact actions tailored to your latest check-in:\n\n`;
      responseText += `1. **${topRec.title}**\n   - *Estimated savings:* ${topRec.estimatedReduction}\n   - *Why it matters:* ${topRec.description}\n\n`;
      if (secondRec) {
        responseText += `2. **${secondRec.title}**\n   - *Estimated savings:* ${secondRec.estimatedReduction}\n   - *Why it matters:* ${secondRec.description}\n\n`;
      }
      responseText += `*Note:* These estimates are based on transparent emission factors from DEFRA and regional grid data.`;

      return {
        text: responseText,
        actions: [
          { label: 'Open My Action Plan', tab: 'recommendations' },
          { label: 'Test in What-If Simulator', tab: 'simulator' },
        ],
        source: 'rule-based',
      };
    }

    return {
      text: `Here are 3 high-impact, practical steps anyone can take right away:

1. **Shift 20–30% of driving to public transit, walking, or cycling:**
   Saves ~3 to 10 kg CO₂e every week by cutting single-occupancy vehicle travel.
2. **Optimize your home cooling/heating setpoint by 1–2°C:**
   Keeping AC at 24–25°C instead of 20°C reduces compressor runtime and saves ~5.5 kg CO₂e per week.
3. **Incorporate 1–2 plant-based days weekly:**
   Plant proteins have up to 10× lower greenhouse gas intensity than meat, saving ~6.0 kg CO₂e weekly.`,
      actions: [
        { label: 'Try What-If Simulator', tab: 'simulator' },
        { label: 'Log My Activity', tab: 'calculator' },
      ],
      source: 'rule-based',
    };
  }

  // ---------------------------------------------------------------------------
  // 3. "Analyze my footprint this month" / Monthly progress
  // ---------------------------------------------------------------------------
  if (
    query.includes('analyze my footprint') ||
    query.includes('footprint this month') ||
    query.includes('how am i doing') ||
    query.includes('monthly analysis') ||
    query.includes('my progress')
  ) {
    if (!isAuthenticated || !latestRecord) {
      return {
        text: `To analyze your monthly footprint, log your check-ins in the Calculator. Anviti tracks weekly entries to show you how small habits add up across the month.`,
        actions: [
          { label: 'Open Calculator', tab: 'calculator' },
          { label: 'View Sample Trends', tab: 'history' },
        ],
        source: 'rule-based',
      };
    }

    const weekly = Number(latestRecord.total_co2e) || 0;
    const monthlyEstimate = Math.round(weekly * 4.333 * 10) / 10;
    const annualPacing = Math.round(weekly * 52);
    const benchmarkTarget = 80;

    const diffFromTarget = Math.round((weekly - benchmarkTarget) * 10) / 10;

    let targetAnalysis = '';
    if (weekly <= benchmarkTarget) {
      targetAnalysis = `You are currently **${Math.abs(diffFromTarget)} kg under** the illustrative weekly lifestyle guideline (80 kg CO₂e). Keep up the great work!`;
    } else {
      targetAnalysis = `You are currently **${diffFromTarget} kg over** the illustrative weekly guideline (80 kg CO₂e). Focusing on your primary driver will help bridge this gap.`;
    }

    return {
      text: `### Monthly Carbon Footprint Analysis

- **Estimated Weekly Total:** ${weekly} kg CO₂e
- **Projected Monthly Footprint:** ~${monthlyEstimate} kg CO₂e
- **Annualized Pace:** ~${annualPacing.toLocaleString()} kg CO₂e / year
- **Recorded Check-ins on File:** ${historicalCount}

**Benchmark Context:**
${targetAnalysis}

*(Note: The 80 kg/week target is modeled from UNEP Emissions Gap 1.5°C lifestyle milestones as an informative guideline, not an absolute rule.)*`,
      actions: [
        { label: 'Open My Dashboard', tab: 'dashboard' },
        { label: 'View Recorded Trends', tab: 'history' },
      ],
      source: 'rule-based',
    };
  }

  // ---------------------------------------------------------------------------
  // 4. "How can I save electricity?" / Energy conservation
  // ---------------------------------------------------------------------------
  if (
    query.includes('save electricity') ||
    query.includes('electricity') ||
    query.includes('power consumption') ||
    query.includes('home energy') ||
    query.includes('lower electricity bill')
  ) {
    return {
      text: `### Practical Ways to Lower Electricity Emissions

In India, grid electricity produces approximately **0.71 kg CO₂e per kWh** (CEA national baseline). Every 10 kWh saved removes 7.1 kg of CO₂ from the atmosphere!

1. **Air Conditioning Optimization (Highest Impact):**
   Setting indoor AC to **24°C–25°C** instead of 20°C reduces power draw by 15–20%, saving ~5.5 kg CO₂e per week.
2. **Eliminate Standby "Phantom Loads":**
   TVs, monitors, gaming consoles, and phone chargers left plugged in draw continuous idle current. Using a switched power strip saves ~2.5 kg CO₂e weekly.
3. **Wash Clothes on Cold Cycles:**
   Up to 75% of washing machine energy goes into heating water. Cold water wash cycles clean everyday clothes equally well.
4. **Daytime High-Load Scheduling:**
   Running laundry or dishwashing during daylight hours capitalizes on cleaner renewable solar generation on the regional grid.`,
      actions: [
        { label: 'Simulate Electricity Reductions', tab: 'simulator' },
        { label: 'Open My Action Plan', tab: 'recommendations' },
      ],
      suggestedGoal: {
        title: 'Keep AC setpoint at 24°C and switch off idle electronics',
        category: 'electricity',
        target_reduction_kg: 5.5,
      },
      source: 'rule-based',
    };
  }

  // ---------------------------------------------------------------------------
  // 5. "Suggest a weekly sustainability goal"
  // ---------------------------------------------------------------------------
  if (
    query.includes('suggest a goal') ||
    query.includes('sustainability goal') ||
    query.includes('weekly goal') ||
    query.includes('create a goal') ||
    query.includes('set a goal')
  ) {
    let goalProposal = {
      title: 'Keep AC at 24°C and unplug idle electronics this week',
      category: 'electricity',
      target_reduction_kg: 5.5,
      rationale: 'Reduces compressor runtime and cuts phantom standby loads.',
    };

    if (latestRecord?.highest_category === 'transport') {
      goalProposal = {
        title: 'Replace 2 car trips (approx. 20 km) with walking, cycling, or bus',
        category: 'transport',
        target_reduction_kg: 3.8,
        rationale: 'Avoids tailpipe petrol emissions on short high-intensity trips.',
      };
    } else if (latestRecord?.highest_category === 'food') {
      goalProposal = {
        title: 'Enjoy two meatless plant-based meal days this week',
        category: 'food',
        target_reduction_kg: 6.0,
        rationale: 'Plant proteins have up to 10× lower greenhouse gas intensity.',
      };
    }

    return {
      text: `### Suggested Weekly Sustainability Goal

🎯 **Goal:** ${goalProposal.title}
- **Category:** ${goalProposal.category.toUpperCase()}
- **Target Reduction:** ~${goalProposal.target_reduction_kg} kg CO₂e this week
- **Why this goal:** ${goalProposal.rationale}

Would you like to commit to this goal and save it to your progress tracking?`,
      suggestedGoal: goalProposal,
      actions: [
        { label: 'View Action Plan', tab: 'recommendations' },
      ],
      source: 'rule-based',
    };
  }

  // ---------------------------------------------------------------------------
  // 6. "Compare two transport options" / Transit comparisons
  // ---------------------------------------------------------------------------
  if (
    query.includes('compare transport') ||
    query.includes('two transport') ||
    query.includes('car vs') ||
    query.includes('bus vs') ||
    query.includes('train vs') ||
    query.includes('transport options')
  ) {
    const petrolCar = EMISSION_FACTORS.transport.car_petrol; // 0.192
    const ev = EMISSION_FACTORS.transport.car_electric;      // 0.053
    const bus = EMISSION_FACTORS.transport.bus;              // 0.105
    const metro = EMISSION_FACTORS.transport.train;          // 0.041
    const bike = EMISSION_FACTORS.transport.bike;            // 0.000

    const testDistance = 25; // km commute
    const carEmissions = (testDistance * petrolCar).toFixed(2);
    const metroEmissions = (testDistance * metro).toFixed(2);
    const busEmissions = (testDistance * bus).toFixed(2);
    const evEmissions = (testDistance * ev).toFixed(2);

    return {
      text: `### Transit Comparison (for a typical 25 km commute)

Here is how emissions compare across transit modes using official DEFRA factors:

- 🚗 **Petrol Car (Solo Driver):** **${carEmissions} kg CO₂e** (0.192 kg/km)
- ⚡ **Electric Vehicle (EV):** **${evEmissions} kg CO₂e** (0.053 kg/km — 72% lower)
- 🚌 **Public Bus:** **${busEmissions} kg CO₂e** (0.105 kg/km — 45% lower)
- 🚆 **Metro / Electric Train:** **${metroEmissions} kg CO₂e** (0.041 kg/km — **78% lower**)
- 🚲 **Bicycle / Walking:** **0.00 kg CO₂e** (Zero direct emissions)

**Key Takeaway:** Swapping just one 25 km car trip for the metro saves **${(carEmissions - metroEmissions).toFixed(2)} kg CO₂e**!`,
      actions: [
        { label: 'Test in What-If Simulator', tab: 'simulator' },
        { label: 'Open Calculator', tab: 'calculator' },
      ],
      source: 'rule-based',
    };
  }

  // ---------------------------------------------------------------------------
  // 7. General Sustainability / Fallback Guidance
  // ---------------------------------------------------------------------------
  return {
    text: `Hello ${displayName}! I'm Anviti's Sustainability Assistant. I can help you understand your environmental data and find practical ways to lighten your footprint.

Here are a few things you can ask me:
- **"What is my biggest source of emissions?"**
- **"How can I reduce my carbon footprint?"**
- **"Analyze my footprint this month."**
- **"How can I save electricity?"**
- **"Suggest a weekly sustainability goal."**
- **"Compare two transport options."**

What area of your environmental footprint would you like to explore?`,
    actions: [
      { label: 'Open Dashboard', tab: 'dashboard' },
      { label: 'Open Calculator', tab: 'calculator' },
      { label: 'What-If Simulator', tab: 'simulator' },
    ],
    source: 'rule-based',
  };
}
