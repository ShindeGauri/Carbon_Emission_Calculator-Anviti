/* ==============================================================================
   Anviti — What-If Carbon Scenario Simulator
   Allows users to test hypothetical lifestyle adjustments and quantify estimated
   carbon reductions using consistent, transparent emission factors.
   ============================================================================== */

import { useState, useMemo } from 'react';
import { Sliders, ArrowRight, RotateCcw, Car, Zap, Utensils, ShoppingBag } from 'lucide-react';
import { calculateFootprint } from '../lib/calculate';

export default function WhatIfSimulator({ baselineResult, onApplyScenario: _onApplyScenario }) {
  // Extract initial baseline values
  const defaultInput = useMemo(() => {
    return baselineResult?.meta?.input || {
      transport: { mode: 'car_petrol', km: 120 },
      electricity: { kwh: 50, period: 'weekly' },
      food: { diet: 'mixed' },
      consumption: { activity: 'clothing', period: 'weekly' },
    };
  }, [baselineResult]);

  // State for simulated scenario
  const [simTransportMode, setSimTransportMode] = useState(defaultInput.transport?.mode || 'car_petrol');
  const [simTransportKm, setSimTransportKm] = useState(Number(defaultInput.transport?.km) || 100);
  const [simElectricityKwh, setSimElectricityKwh] = useState(Number(defaultInput.electricity?.kwh) || 45);
  const [simDiet, setSimDiet] = useState(defaultInput.food?.diet || 'mixed');
  const [simConsumption, setSimConsumption] = useState(defaultInput.consumption?.activity || 'none');

  // Baseline calculation
  const baseline = useMemo(() => {
    if (baselineResult?.total) return baselineResult;
    return calculateFootprint(defaultInput);
  }, [baselineResult, defaultInput]);

  // Simulated calculation
  const simulated = useMemo(() => {
    return calculateFootprint({
      transport: { mode: simTransportMode, km: simTransportKm },
      electricity: { kwh: simElectricityKwh, period: 'weekly' },
      food: { diet: simDiet },
      consumption: { activity: simConsumption, period: 'weekly' },
    });
  }, [simTransportMode, simTransportKm, simElectricityKwh, simDiet, simConsumption]);

  // Comparative metrics
  const deltaKg = Math.round((simulated.total - baseline.total) * 100) / 100;
  const pctChange = baseline.total > 0
    ? Math.round(((simulated.total - baseline.total) / baseline.total) * 1000) / 10
    : 0;
  const annualSavedKg = Math.abs(Math.round(deltaKg * 52));

  const handleReset = () => {
    setSimTransportMode(defaultInput.transport?.mode || 'car_petrol');
    setSimTransportKm(Number(defaultInput.transport?.km) || 100);
    setSimElectricityKwh(Number(defaultInput.electricity?.kwh) || 45);
    setSimDiet(defaultInput.food?.diet || 'mixed');
    setSimConsumption(defaultInput.consumption?.activity || 'none');
  };

  return (
    <div className="simulator-root">
      {/* Header */}
      <div className="simulator-header">
        <div className="sim-badge">
          <Sliders size={14} />
          <span>Interactive Scenario Modeling</span>
        </div>
        <h2>What-If Carbon Simulator</h2>
        <p>
          Model behavioral and efficiency changes to see their quantified impact on your footprint before taking action.
          Calculated using the exact same transparent conversion factors.
        </p>
      </div>

      {/* Comparison Scoreboard */}
      <div className="sim-scoreboard">
        <div className="score-card baseline">
          <span className="score-label">Current Baseline</span>
          <div className="score-value-row">
            <span className="score-number">{baseline.total}</span>
            <span className="score-unit">kg CO₂e/wk</span>
          </div>
          <span className="score-subtext">{(baseline.total * 52).toFixed(0)} kg CO₂e / year</span>
        </div>

        <div className="score-arrow-box">
          <ArrowRight size={20} />
        </div>

        <div className="score-card simulated">
          <span className="score-label">Simulated Scenario</span>
          <div className="score-value-row">
            <span className="score-number">{simulated.total}</span>
            <span className="score-unit">kg CO₂e/wk</span>
          </div>
          <span className="score-subtext">{(simulated.total * 52).toFixed(0)} kg CO₂e / year</span>
        </div>

        <div className={`score-card delta ${deltaKg <= 0 ? 'reduction' : 'increase'}`}>
          <span className="score-label">Estimated Impact</span>
          <div className="score-value-row">
            <span className="score-number">
              {deltaKg <= 0 ? `${Math.abs(deltaKg)}` : `+${deltaKg}`}
            </span>
            <span className="score-unit">kg CO₂e/wk</span>
          </div>
          <span className="score-subtext">
            {deltaKg <= 0 ? (
              <>▼ <strong>{Math.abs(pctChange)}%</strong> lower footprint (~{annualSavedKg} kg/yr)</>
            ) : (
              <>▲ <strong>+{pctChange}%</strong> higher footprint</>
            )}
          </span>
        </div>
      </div>

      {/* Interactive Controls & Category Breakdown */}
      <div className="sim-layout-grid">
        {/* Left: Controls */}
        <div className="sim-controls-panel">
          <div className="panel-title-bar">
            <h3>Adjust Variables</h3>
            <button type="button" className="btn-reset-sim" onClick={handleReset} title="Reset to initial values">
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Transport Control */}
          <div className="sim-control-group">
            <div className="group-label">
              <Car size={16} />
              <span>Transportation</span>
            </div>
            <div className="control-fields">
              <div className="field-item">
                <label>Transport Mode</label>
                <select
                  value={simTransportMode}
                  onChange={(e) => setSimTransportMode(e.target.value)}
                >
                  <option value="car_petrol">Car (Petrol)</option>
                  <option value="car_diesel">Car (Diesel)</option>
                  <option value="car_electric">Electric Car (EV)</option>
                  <option value="bus">Public Bus</option>
                  <option value="train">Train / Metro</option>
                  <option value="bike">Bicycle / Walking</option>
                </select>
              </div>

              <div className="field-item">
                <div className="field-label-with-val">
                  <label>Weekly Distance</label>
                  <span className="val-display">{simTransportKm} km</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  step="5"
                  value={simTransportKm}
                  onChange={(e) => setSimTransportKm(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Electricity Control */}
          <div className="sim-control-group">
            <div className="group-label">
              <Zap size={16} />
              <span>Electricity & Household Energy</span>
            </div>
            <div className="control-fields">
              <div className="field-item">
                <div className="field-label-with-val">
                  <label>Weekly Consumption</label>
                  <span className="val-display">{simElectricityKwh} kWh</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={simElectricityKwh}
                  onChange={(e) => setSimElectricityKwh(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Food Control */}
          <div className="sim-control-group">
            <div className="group-label">
              <Utensils size={16} />
              <span>Dietary Profile</span>
            </div>
            <div className="control-fields">
              <div className="field-item">
                <label>Weekly Diet</label>
                <select
                  value={simDiet}
                  onChange={(e) => setSimDiet(e.target.value)}
                >
                  <option value="meat_heavy">Meat with most meals (High Intensity)</option>
                  <option value="mixed">Mixed — meat a few times a week</option>
                  <option value="vegetarian">Vegetarian (Dairy & plant proteins)</option>
                  <option value="vegan">Vegan (Strictly plant-based)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consumption Control */}
          <div className="sim-control-group">
            <div className="group-label">
              <ShoppingBag size={16} />
              <span>Goods & Shopping</span>
            </div>
            <div className="control-fields">
              <div className="field-item">
                <label>Shopping Activity</label>
                <select
                  value={simConsumption}
                  onChange={(e) => setSimConsumption(e.target.value)}
                >
                  <option value="none">No significant discretionary purchases</option>
                  <option value="clothing">A few clothing items</option>
                  <option value="small_electronics">Small electronic accessories</option>
                  <option value="large_electronics">Major laptop or appliance</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Comparative Breakdown */}
        <div className="sim-results-panel">
          <h3>Category Comparison</h3>
          <p className="panel-hint">Comparison between current baseline (top bar) and simulated scenario (bottom bar).</p>

          <div className="comparison-bars-list">
            {[
              { key: 'transport', label: 'Transportation', color: 'var(--cat-transport)' },
              { key: 'electricity', label: 'Electricity', color: 'var(--cat-electricity)' },
              { key: 'food', label: 'Food & Nutrition', color: 'var(--cat-food)' },
              { key: 'consumption', label: 'Goods & Shopping', color: 'var(--cat-consumption)' },
            ].map(({ key, label, color }) => {
              const baseVal = baseline.breakdown[key] || 0;
              const simVal = simulated.breakdown[key] || 0;
              const diff = Math.round((simVal - baseVal) * 10) / 10;

              return (
                <div key={key} className="comp-item">
                  <div className="comp-meta">
                    <span className="comp-name">{label}</span>
                    <span className="comp-diff">
                      {diff === 0 ? 'No change' : diff < 0 ? `▼ ${Math.abs(diff)} kg` : `▲ +${diff} kg`}
                    </span>
                  </div>

                  {/* Baseline bar */}
                  <div className="bar-track">
                    <div
                      className="bar-fill base"
                      style={{ width: `${Math.min(100, (baseVal / 80) * 100)}%`, backgroundColor: color }}
                    ></div>
                    <span className="bar-tag">{baseVal} kg</span>
                  </div>

                  {/* Simulated bar */}
                  <div className="bar-track">
                    <div
                      className="bar-fill sim"
                      style={{ width: `${Math.min(100, (simVal / 80) * 100)}%`, backgroundColor: color }}
                    ></div>
                    <span className="bar-tag">{simVal} kg</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sim-insight-card">
            <h4>Simulator Summary</h4>
            <p>
              {deltaKg <= 0 ? (
                <>
                  By adopting these modeled changes, you would lower your weekly footprint by <strong>{Math.abs(deltaKg)} kg CO₂e</strong>.
                  Over a full year, this removes approximately <strong>{annualSavedKg} kg of CO₂e</strong> from the atmosphere!
                </>
              ) : (
                <>
                  The modeled configuration increases your weekly emissions by <strong>{deltaKg} kg CO₂e</strong>.
                  Consider selecting lower-emission transit options or reducing energy consumption to maintain progress.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
