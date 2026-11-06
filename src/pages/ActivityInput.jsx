/* ==============================================================================
   Anviti — Activity Input & Carbon Calculator
   Structured, validated entry form for weekly activity with transparent
   conversion factors, unit definitions, and error handling.
   ============================================================================== */

import { useState } from 'react';
import { Car, Zap, Utensils, ShoppingBag, Info, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { calculateFootprint } from '../lib/calculate';
import { saveFootprintRecord } from '../lib/recordsService';

export default function ActivityInput({ onCalculationComplete }) {
  // Form State
  const [transportMode, setTransportMode] = useState('car_petrol');
  const [transportKm, setTransportKm] = useState('120');

  const [electricityKwh, setElectricityKwh] = useState('45');
  const [electricityPeriod, setElectricityPeriod] = useState('weekly'); // 'weekly' | 'monthly'

  const [dietType, setDietType] = useState('mixed');

  const [shoppingActivity, setShoppingActivity] = useState('none');

  // UI state
  const [showMethodology, setShowMethodology] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Validation
  const validate = () => {
    const newErrors = {};

    const km = Number(transportKm);
    if (transportKm === '' || isNaN(km) || km < 0) {
      newErrors.transportKm = 'Please enter a valid non-negative distance (e.g. 50 km).';
    } else if (km > 5000) {
      newErrors.transportKm = 'Distance exceeds reasonable single-week threshold (5,000 km).';
    }

    const kwh = Number(electricityKwh);
    if (electricityKwh === '' || isNaN(kwh) || kwh < 0) {
      newErrors.electricityKwh = 'Please enter a valid non-negative electricity value (e.g. 45 kWh).';
    } else if (kwh > 2000) {
      newErrors.electricityKwh = 'Electricity consumption exceeds reasonable single-household value.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    const inputData = {
      transport: {
        mode: transportMode,
        km: Number(transportKm) || 0,
      },
      electricity: {
        kwh: Number(electricityKwh) || 0,
        period: electricityPeriod,
      },
      food: {
        diet: dietType,
      },
      consumption: {
        activity: shoppingActivity,
        period: 'weekly',
      },
    };

    try {
      // 1. Calculate estimated footprint
      const result = calculateFootprint(inputData);

      // 2. Save record to Supabase or Local Storage
      const { record, source } = await saveFootprintRecord(result);

      setFeedback({
        type: 'success',
        message: source === 'supabase'
          ? 'Footprint calculated and saved to your Supabase cloud profile!'
          : 'Footprint calculated and saved locally to your device browser.',
      });

      // 3. Callback to update application state
      setTimeout(() => {
        if (onCalculationComplete) {
          onCalculationComplete(result, record);
        }
      }, 500);
    } catch (err) {
      console.error('Calculation submit error:', err);
      setFeedback({
        type: 'error',
        message: 'An error occurred while calculating emissions. Please check values.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="input-page-root">
      <div className="input-layout-container">
        {/* Header */}
        <div className="input-header-editorial">
          <div className="step-tag">Step 1: Activity Measurement</div>
          <h1>Log Your Weekly Activity</h1>
          <p>
            Enter everyday activity approximations across key lifestyle areas.
            Transparent emission factors convert your habits into an actionable carbon profile.
          </p>
        </div>

        {feedback && (
          <div className={`alert-box ${feedback.type}`}>
            {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="activity-form" noValidate>
          {/* Section 1: Transportation */}
          <div className={`form-card ${errors.transportKm ? 'has-error' : ''}`}>
            <div className="form-card-header">
              <div className="card-icon-circle transport">
                <Car size={18} />
              </div>
              <div className="card-title-group">
                <h3>Transportation</h3>
                <span className="card-period-tag">Past 7 Days</span>
              </div>
            </div>

            <div className="form-card-body">
              <div className="form-row-grid">
                <div className="form-field">
                  <label htmlFor="transportMode">Primary Transport Mode</label>
                  <select
                    id="transportMode"
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                  >
                    <option value="car_petrol">Petrol / Gasoline Car (0.192 kg CO₂e/km)</option>
                    <option value="car_diesel">Diesel Car (0.171 kg CO₂e/km)</option>
                    <option value="car_electric">Electric Vehicle (0.053 kg CO₂e/km)</option>
                    <option value="bus">Public Bus (0.105 kg CO₂e/km)</option>
                    <option value="train">Train / Metro Transit (0.041 kg CO₂e/km)</option>
                    <option value="bike">Bicycle / Walking (0.000 kg CO₂e/km)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="transportKm">Estimated Distance</label>
                  <div className="input-with-addon">
                    <input
                      id="transportKm"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 120"
                      value={transportKm}
                      onChange={(e) => {
                        setTransportKm(e.target.value);
                        if (errors.transportKm) setErrors((prev) => ({ ...prev, transportKm: null }));
                      }}
                    />
                    <span className="input-addon">km</span>
                  </div>
                  {errors.transportKm && (
                    <span className="field-error-msg">{errors.transportKm}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Electricity */}
          <div className={`form-card ${errors.electricityKwh ? 'has-error' : ''}`}>
            <div className="form-card-header">
              <div className="card-icon-circle electricity">
                <Zap size={18} />
              </div>
              <div className="card-title-group">
                <h3>Electricity & Household Energy</h3>
                <span className="card-period-tag">Utility Consumption</span>
              </div>
            </div>

            <div className="form-card-body">
              <div className="form-row-grid">
                <div className="form-field">
                  <label htmlFor="electricityKwh">Electricity Usage</label>
                  <div className="input-with-addon">
                    <input
                      id="electricityKwh"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 45"
                      value={electricityKwh}
                      onChange={(e) => {
                        setElectricityKwh(e.target.value);
                        if (errors.electricityKwh) setErrors((prev) => ({ ...prev, electricityKwh: null }));
                      }}
                    />
                    <span className="input-addon">kWh</span>
                  </div>
                  {errors.electricityKwh && (
                    <span className="field-error-msg">{errors.electricityKwh}</span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="electricityPeriod">Billing Interval</label>
                  <select
                    id="electricityPeriod"
                    value={electricityPeriod}
                    onChange={(e) => setElectricityPeriod(e.target.value)}
                  >
                    <option value="weekly">Weekly Consumption (direct)</option>
                    <option value="monthly">Monthly Utility Bill (prorated by 4.33 weeks)</option>
                  </select>
                </div>
              </div>
              <span className="field-hint">
                Calculated at 0.71 kg CO₂e per kWh based on average Indian grid emission factors.
              </span>
            </div>
          </div>

          {/* Section 3: Food & Diet */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="card-icon-circle food">
                <Utensils size={18} />
              </div>
              <div className="card-title-group">
                <h3>Food & Nutrition</h3>
                <span className="card-period-tag">Typical Dietary Pattern</span>
              </div>
            </div>

            <div className="form-card-body">
              <div className="form-field">
                <label htmlFor="dietType">Diet Category</label>
                <select
                  id="dietType"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                >
                  <option value="meat_heavy">Meat-Heavy (Meat or poultry with most main meals — 2.5 kg/meal)</option>
                  <option value="mixed">Mixed Omnivore (Meat 2–4 times per week — 1.7 kg/meal)</option>
                  <option value="vegetarian">Vegetarian (Dairy, legumes, grains, vegetables — 1.0 kg/meal)</option>
                  <option value="vegan">Plant-Based / Vegan (Exclusively plant proteins — 0.7 kg/meal)</option>
                </select>
              </div>
              <span className="field-hint">
                Assumes 14 representative main meals per week (2 daily main plates) based on Poore & Nemecek lifecycle datasets.
              </span>
            </div>
          </div>

          {/* Section 4: Consumption & Shopping */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="card-icon-circle consumption">
                <ShoppingBag size={18} />
              </div>
              <div className="card-title-group">
                <h3>Goods & Shopping</h3>
                <span className="card-period-tag">Recent Purchases</span>
              </div>
            </div>

            <div className="form-card-body">
              <div className="form-field">
                <label htmlFor="shoppingActivity">Discretionary Purchases This Month</label>
                <select
                  id="shoppingActivity"
                  value={shoppingActivity}
                  onChange={(e) => setShoppingActivity(e.target.value)}
                >
                  <option value="none">No significant physical goods bought (0 kg CO₂e)</option>
                  <option value="clothing">A few garments / clothing items (~10 kg CO₂e amortized)</option>
                  <option value="small_electronics">Small electronic accessories (earbuds, charger, mouse ~50 kg CO₂e)</option>
                  <option value="large_electronics">Major electronic device or appliance (phone, laptop, TV ~300 kg CO₂e)</option>
                </select>
              </div>
              <span className="field-hint">
                Reflects embodied cradle-to-gate carbon emissions from raw material extraction, manufacturing, and assembly.
              </span>
            </div>
          </div>

          {/* Submit Row */}
          <div className="form-submit-panel">
            <button
              type="submit"
              className="btn-calculate-primary"
              disabled={submitting}
            >
              {submitting ? 'Computing Footprint...' : 'Calculate & Save Footprint'}
            </button>
          </div>
        </form>

        {/* Collapsible Methodology Accordion */}
        <div className="methodology-accordion">
          <button
            type="button"
            className="accordion-toggle-btn"
            onClick={() => setShowMethodology(!showMethodology)}
            aria-expanded={showMethodology}
          >
            <div className="toggle-left">
              <Info size={16} />
              <span>Transparent Emission Factors & Assumptions</span>
            </div>
            {showMethodology ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showMethodology && (
            <div className="accordion-content-panel">
              <p>
                All calculations in Anviti adhere to the standard GHG Protocol activity equation:
                <br />
                <code>Estimated Emissions (kg CO₂e) = Activity Data × Emission Factor</code>
              </p>

              <div className="factors-table-wrap">
                <table className="factors-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Activity Metric</th>
                      <th>Factor Value</th>
                      <th>Reference Baseline</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Petrol Car</td>
                      <td>Distance (km)</td>
                      <td>0.192 kg CO₂e / km</td>
                      <td>UK DEFRA Average Medium Passenger Vehicle</td>
                    </tr>
                    <tr>
                      <td>Diesel Car</td>
                      <td>Distance (km)</td>
                      <td>0.171 kg CO₂e / km</td>
                      <td>UK DEFRA Passenger Diesel</td>
                    </tr>
                    <tr>
                      <td>Electric Vehicle (EV)</td>
                      <td>Distance (km)</td>
                      <td>0.053 kg CO₂e / km</td>
                      <td>Indirect grid battery charging emissions</td>
                    </tr>
                    <tr>
                      <td>Bus / Metro Transit</td>
                      <td>Distance (km)</td>
                      <td>0.041 – 0.105 kg/km</td>
                      <td>Per passenger-km average transit occupancy</td>
                    </tr>
                    <tr>
                      <td>Grid Electricity</td>
                      <td>Energy (kWh)</td>
                      <td>0.710 kg CO₂e / kWh</td>
                      <td>Central Electricity Authority (CEA) India baseline</td>
                    </tr>
                    <tr>
                      <td>Diet (14 meals/wk)</td>
                      <td>Meals consumed</td>
                      <td>0.70 – 2.50 kg / meal</td>
                      <td>Poore & Nemecek (2018) Science meta-analysis</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
