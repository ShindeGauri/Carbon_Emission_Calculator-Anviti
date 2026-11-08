
/* ==============================================================================
   Anviti — Actionable Recommendations Component
   Renders personalized climate actions and connects them with Green Challenges.
   ============================================================================== */

import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info,
  Leaf
} from 'lucide-react';

import { getRecommendations } from '../lib/recommendations';

/*
  Connect recommendation IDs with existing Green Challenge IDs.

  Only challenges that currently exist in GreenChallenges.jsx
  are included here.
*/

const RECOMMENDATION_CHALLENGES = {
  'tr-01': 'public-transport',
  'tr-02': 'walk-short-distance',
  'el-02': 'switch-off-lights',
};

export default function RecommendationsSection({
  hotspot,
  breakdown,
  rawInput,
  onSimulateAction,
  onStartChallenge
}) {

  const recommendations = getRecommendations(
    hotspot,
    breakdown,
    rawInput
  );

  if (!hotspot || !breakdown || recommendations.length === 0) {
    return (
      <div className="section-card empty-state">
        <div className="empty-icon-box">
          <Info size={24} />
        </div>

        <h3>No Emission Hotspot Detected Yet</h3>

        <p>
          Complete a footprint check-in using the Calculator
          to generate personalized, data-backed action recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="recommendations-container">

      {/* Editorial Header */}

      <div className="recommendations-header">

        <div className="header-badge">
          <Sparkles size={14} />
          <span>
            Priority Focus Area: {hotspot.label}
          </span>
        </div>

        <h2>Targeted Reduction Pathways</h2>

        <p className="header-description">
          Based on your activity breakdown,{' '}
          <strong>{hotspot.label}</strong> generates{' '}
          <strong>{hotspot.percentage}%</strong> of your total
          emissions ({hotspot.value} kg CO₂e).

          Targeting your primary driver yields the steepest
          carbon reductions with minimal lifestyle disruption.
        </p>

      </div>

      {/* Recommendations Cards Grid */}

      <div className="recommendations-grid">

        {recommendations.map((rec) => {

          const matchingChallenge =
            RECOMMENDATION_CHALLENGES[rec.id];

          return (

            <div key={rec.id} className="rec-card">

              <div className="rec-card-top">

                <span
                  className={`rec-badge ${rec.badge
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  {rec.badge}
                </span>

                <span className="rec-effort">
                  Effort: {rec.effort}
                </span>

              </div>

              <h3 className="rec-title">
                {rec.title}
              </h3>

              <p className="rec-description">
                {rec.description}
              </p>

              <div className="rec-card-footer">

                <div className="rec-reduction-stat">

                  <span className="reduction-label">
                    Estimated Potential Savings
                  </span>

                  <span className="reduction-value">
                    <TrendingDown size={14} />
                    {rec.estimatedReduction}
                  </span>

                </div>

                <div className="rec-action-buttons">

                  {/* Start Matching Green Challenge */}

                  {matchingChallenge && onStartChallenge && (

                    <button
                      type="button"
                      className="btn-start-challenge"
                      onClick={() =>
                        onStartChallenge(matchingChallenge)
                      }
                      title="Find this challenge in Green Challenges"
                    >
                      <Leaf size={14} />
                      <span>Start This Challenge</span>
                    </button>

                  )}

                  {/* Existing What-If Simulator Action */}

                  {onSimulateAction && (

                    <button
                      type="button"
                      className="btn-simulate-action"
                      onClick={() =>
                        onSimulateAction(rec.category)
                      }
                      title="Test in What-If Simulator"
                    >
                      <span>Simulate Impact</span>
                      <ArrowRight size={13} />
                    </button>

                  )}

                </div>

              </div>

            </div>

          );

        })}

      </div>

      {/* Methodology Disclaimer */}

      <div className="methodology-note">

        <div className="note-icon">
          <ShieldCheck size={16} />
        </div>

        <p>
          <strong>Methodology Note:</strong> All savings
          estimates are derived transparently from peer-reviewed
          emission factors (DEFRA / Indian CEA grid averages).
          No opaque machine learning or unverified approximations
          are used.
        </p>

      </div>

    </div>
  );
}
