/* ==============================================================================
   Anviti — History and Trends Component
   Renders historical calculation records, period-over-period comparisons,
   and visual emissions trajectory.
   ============================================================================== */

import { useState } from 'react';
import { History, TrendingDown, TrendingUp, Calendar, AlertCircle, ArrowRight, Trash2, CheckCircle } from 'lucide-react';
import { clearLocalUserRecords } from '../lib/recordsService';

export default function HistorySection({
  records = [],
  isDemo = false,
  onSelectRecord,
  onRefreshRecords,
  onNavigateToCalculator,
}) {
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClear = () => {
    if (window.confirm('Clear all locally saved records and revert to sample demo data?')) {
      clearLocalUserRecords();
      setClearedNotice(true);
      if (onRefreshRecords) onRefreshRecords();
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  // Chronological order for trend chart (oldest to newest)
  const chronological = [...records].reverse();

  // Latest 2 entries for period-over-period comparison
  const latest = records[0];
  const previous = records[1];

  let diffKg = null;
  let diffPct = null;
  if (latest && previous) {
    diffKg = Math.round((latest.total_co2e - previous.total_co2e) * 100) / 100;
    diffPct = previous.total_co2e > 0
      ? Math.round(((latest.total_co2e - previous.total_co2e) / previous.total_co2e) * 1000) / 10
      : 0;
  }

  // Find max value for trend bar chart scaling
  const maxVal = Math.max(...records.map((r) => r.total_co2e), 100);

  return (
    <div className="history-root">
      {/* Header */}
      <div className="history-header">
        <div>
          <div className="history-badge">
            <History size={14} />
            <span>Progress Tracking</span>
          </div>
          <h2>Recorded Footprint History</h2>
          <p>Review your carbon emissions trajectory across recorded check-in periods.</p>
        </div>

        <div className="history-actions">
          <button
            type="button"
            className="btn-action-outline"
            onClick={onNavigateToCalculator}
          >
            + New Check-In
          </button>
          {!isDemo && records.length > 0 && (
            <button
              type="button"
              className="btn-action-ghost"
              onClick={handleClear}
              title="Clear locally stored records"
            >
              <Trash2 size={14} />
              <span>Reset Local</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo Mode Notice */}
      {isDemo && (
        <div className="demo-notice-banner">
          <div className="banner-icon">
            <AlertCircle size={16} />
          </div>
          <div className="banner-content">
            <strong>Sample Demo Records Displayed</strong>
            <p>
              Showing 2 representative historical check-in periods to illustrate trend comparisons.
              Use the Calculator to record your own actual check-ins; your entries will automatically replace this demo view.
            </p>
          </div>
        </div>
      )}

      {clearedNotice && (
        <div className="alert-box success">
          <CheckCircle size={16} />
          <span>Local storage cleared. Reset to default demo state.</span>
        </div>
      )}

      {records.length === 0 ? (
        /* Empty State */
        <div className="empty-state-box">
          <Calendar size={28} />
          <h3>No Records Saved Yet</h3>
          <p>You haven't logged any footprint calculations yet. Complete your first weekly check-in to begin tracking progress.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateToCalculator}
          >
            Log First Calculation
          </button>
        </div>
      ) : (
        <>
          {/* Comparison Card (If 2+ entries) */}
          {records.length >= 2 ? (
            <div className="period-comparison-card">
              <div className="comp-header">
                <h3>Period-over-Period Comparison</h3>
                <span className="comp-dates">
                  {previous.period_label} → {latest.period_label}
                </span>
              </div>

              <div className="comp-metrics-row">
                <div className="comp-stat-box">
                  <span className="stat-label">Previous Entry</span>
                  <div className="stat-value">{previous.total_co2e} <span className="stat-unit">kg CO₂e</span></div>
                </div>

                <div className="comp-stat-box">
                  <span className="stat-label">Latest Entry</span>
                  <div className="stat-value">{latest.total_co2e} <span className="stat-unit">kg CO₂e</span></div>
                </div>

                <div className={`comp-stat-box delta-box ${diffKg <= 0 ? 'good' : 'warn'}`}>
                  <span className="stat-label">Net Trajectory</span>
                  <div className="stat-value">
                    {diffKg <= 0 ? (
                      <>
                        <TrendingDown size={18} />
                        <span>{Math.abs(diffKg)} kg</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp size={18} />
                        <span>+{diffKg} kg</span>
                      </>
                    )}
                  </div>
                  <span className="stat-pct">
                    {diffKg <= 0 ? `${Math.abs(diffPct)}% reduction` : `+${diffPct}% increase`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Only 1 entry message */
            <div className="single-entry-note">
              <div className="note-icon">
                <AlertCircle size={18} />
              </div>
              <div>
                <strong>1 Check-in Recorded</strong>
                <p>
                  A single period is logged ({latest.total_co2e} kg CO₂e).
                  Add a second weekly check-in to unlock period-over-period comparisons, percentage trajectory, and category deltas.
                </p>
              </div>
            </div>
          )}

          {/* Visual Trend Chart */}
          <div className="trend-chart-card">
            <div className="chart-title-row">
              <h3>Emissions Trajectory</h3>
              <span className="chart-legend-target">— 80 kg Weekly Target</span>
            </div>

            <div className="trend-bars-container">
              {chronological.map((rec, idx) => {
                const heightPct = Math.min(100, (rec.total_co2e / maxVal) * 100);
                const isOverTarget = rec.total_co2e > 80;

                return (
                  <div key={rec.id || idx} className="trend-bar-col">
                    <div className="bar-value-top">{rec.total_co2e}</div>
                    <div className="bar-track-vertical">
                      {/* Target reference line at 80kg */}
                      <div
                        className="target-line"
                        style={{ bottom: `${(80 / maxVal) * 100}%` }}
                        title="80 kg target benchmark"
                      ></div>
                      <div
                        className={`bar-fill-vertical ${isOverTarget ? 'over-target' : 'on-target'}`}
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    </div>
                    <div className="bar-period-label">
                      {rec.period_label.replace(/\(.*?\)/, '')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Log List */}
          <div className="history-list-section">
            <h3>Recorded Check-Ins</h3>
            <div className="history-items-grid">
              {records.map((rec) => (
                <div key={rec.id} className="history-item-card">
                  <div className="item-header">
                    <div>
                      <h4 className="item-title">{rec.period_label}</h4>
                      <span className="item-date">
                        {new Date(rec.recorded_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="item-total-badge">
                      <span className="total-num">{rec.total_co2e}</span>
                      <span className="total-unit">kg CO₂e</span>
                    </div>
                  </div>

                  <div className="item-category-chips">
                    <span className="cat-chip">
                      🚗 Transport: {rec.transport_co2e} kg
                    </span>
                    <span className="cat-chip">
                      ⚡ Power: {rec.electricity_co2e} kg
                    </span>
                    <span className="cat-chip">
                      🥗 Food: {rec.food_co2e} kg
                    </span>
                    <span className="cat-chip">
                      📦 Goods: {rec.consumption_co2e} kg
                    </span>
                  </div>

                  <div className="item-footer">
                    <span className="hotspot-tag">
                      Primary Hotspot: <strong>{rec.highest_category}</strong> ({rec.highest_category_pct}%)
                    </span>

                    {onSelectRecord && (
                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={() => onSelectRecord(rec)}
                      >
                        <span>Inspect in Dashboard</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
