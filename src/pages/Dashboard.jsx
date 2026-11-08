
/* ==============================================================================
   Anviti — Carbon Dashboard
   A human-centered sustainability dashboard making carbon data intuitive,
   welcoming, and actionable for ordinary individuals and households.
   ============================================================================== */

import { useState } from 'react';
import './Dashboard.css';

import {
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Plus,
  Sliders,
  History,
  HelpCircle,
  Check,
  Info,
} from 'lucide-react';

import { findHotspot } from '../lib/hotspot';
import { getRecommendations } from '../lib/recommendations';
import GreenChallenges from '../components/GreenChallenges';

const CATEGORY_CONFIG = {
  transport: {
    label: 'Transportation',
    sublabel: 'Getting around (cars, transit, walking)',
    icon: Car,
    color: '#366B54',
    bgLight: '#EDF4F0',
  },
  electricity: {
    label: 'Electricity & Energy',
    sublabel: 'Powering appliances, cooling & heating',
    icon: Zap,
    color: '#2D6584',
    bgLight: '#EEF4F8',
  },
  food: {
    label: 'Food & Nutrition',
    sublabel: 'What you eat across weekly meals',
    icon: Utensils,
    color: '#A66838',
    bgLight: '#F7EFE9',
  },
  consumption: {
    label: 'Goods & Shopping',
    sublabel: 'Clothing, gadgets & physical purchases',
    icon: ShoppingBag,
    color: '#68537A',
    bgLight: '#F3EEF6',
  },
};

const WEEKLY_BENCHMARK_TARGET = 80;

export default function Dashboard({
  result,
  isDemo = false,
  user = null,
  onNavigateToCalculator,
  onNavigateToSimulator,
  onNavigateToRecommendations,
  onNavigateToHistory,
  selectedChallengeId,
}) {
  const [showCo2Explanation, setShowCo2Explanation] = useState(false);
  const [showBenchmarkExplanation, setShowBenchmarkExplanation] =
    useState(false);
  const [showLeafBuddy, setShowLeafBuddy] = useState(true);

  const { breakdown = {}, total = 0, meta = {} } = result || {};

  // Hotspot analysis
  const hotspot = findHotspot(breakdown);

  // Sort categories from highest to lowest emissions
  const orderedKeys = Object.keys(breakdown).sort(
    (a, b) => (breakdown[b] || 0) - (breakdown[a] || 0)
  );

  // Calculate category percentages
  const percentages = {};

  orderedKeys.forEach((key) => {
    percentages[key] =
      total > 0
        ? Math.round(((breakdown[key] || 0) / total) * 1000) / 10
        : 0;
  });

  // Top recommendations
  const recommendations = hotspot
    ? getRecommendations(hotspot, breakdown, meta.input || {})
    : [];

  const primaryAction = recommendations[0] || null;
  const secondaryActions = recommendations.slice(1, 3);

  // Donut chart calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let strokeOffset = 0;

  // Safe category configuration for unexpected category keys
  const getCategoryConfig = (key) => {
    return (
      CATEGORY_CONFIG[key] || {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        sublabel: 'Other everyday activities',
        icon: LeafFallback,
        color: '#82938A',
        bgLight: '#F0F3F1',
      }
    );
  };

  function LeafFallback({ size = 16 }) {
    return (
      <span
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        🌿
      </span>
    );
  }

  return (
    <div className="dash-root">

      {/* Editorial Header */}
      <div className="dash-header-row">
        <div>
          <div className="dash-breadcrumb">
            <span>Anviti Dashboard</span>
            <span className="dot-sep">•</span>
            <span>Weekly Environmental Assessment</span>
          </div>

          <h1>Your Environmental Overview</h1>

          <p className="dash-subtitle">
            A clear summary of your estimated carbon footprint and the most
            impactful ways to lighten it.
          </p>
        </div>

        <div className="dash-header-actions">
          <button
            type="button"
            className="btn-dash-primary"
            onClick={onNavigateToCalculator}
          >
            <Plus size={15} />
            <span>+ Enter New Week</span>
          </button>

          <button
            type="button"
            className="btn-dash-secondary"
            onClick={onNavigateToSimulator}
          >
            <Sliders size={15} />
            <span>What-If Sandbox</span>
          </button>

          <button
            type="button"
            className="btn-dash-secondary"
            onClick={onNavigateToHistory}
            title="View Recorded Trends"
          >
            <History size={15} />
            <span>Trends</span>
          </button>
        </div>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="demo-indicator-bar">
          <div className="demo-indicator-dot"></div>
          <span>
            <strong>Sample Activity View:</strong> You are viewing a
            representative sample profile. Click{' '}
            <strong>+ Enter New Week</strong> anytime to calculate and save your
            own actual habits!
          </span>
        </div>
      )}

      {/* Leaf Buddy Welcome */}
      {showLeafBuddy && (
        <section className="leaf-buddy-welcome">
          <div className="leaf-buddy-character-area">
            <div className="leaf-buddy-glow"></div>

            <div
              className="leaf-buddy-character"
              role="img"
              aria-label="Leaf Buddy, your sustainability companion"
            >
              <span className="leaf-buddy-leaf">🌿</span>
              <span className="leaf-buddy-eye left"></span>
              <span className="leaf-buddy-eye right"></span>
              <span className="leaf-buddy-smile"></span>
              <span className="leaf-buddy-cheek left"></span>
              <span className="leaf-buddy-cheek right"></span>
            </div>

            <div className="leaf-buddy-ground-shadow"></div>

            <span className="leaf-buddy-sparkle sparkle-one">✦</span>
            <span className="leaf-buddy-sparkle sparkle-two">✧</span>
            <span className="leaf-buddy-sparkle sparkle-three">✦</span>
          </div>

          <div className="leaf-buddy-message">
            <div className="leaf-buddy-eyebrow">
              <Sparkles size={13} />
              YOUR LITTLE GREEN COMPANION
            </div>

            <h3>Hey there! I'm Leaf Buddy 🌱</h3>

            <p>
              Every small step towards a greener lifestyle matters. I'm here
              to help you understand your carbon footprint and discover simple
              ways to make a positive difference.
            </p>

            <div className="leaf-buddy-tip">
              <span>💡</span>
              <span>
                {hotspot
                  ? `Your biggest opportunity right now is ${getCategoryConfig(hotspot.key).label}. Explore your recommendations to find ways to reduce it!`
                  : 'Start by exploring your weekly footprint and try a green challenge today!'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="leaf-buddy-dismiss"
            onClick={() => setShowLeafBuddy(false)}
            aria-label="Dismiss Leaf Buddy welcome message"
            title="Dismiss welcome message"
          >
            ×
          </button>
        </section>
      )}

      {/* Core Metric Cards */}
      <div className="dash-kpi-grid">

        {/* Carbon Footprint */}
        <div className="kpi-card total">
          <div className="kpi-header">
            <span className="kpi-tag">
              Your Carbon Footprint This Week
            </span>

            <button
              type="button"
              className="term-helper-btn"
              onClick={() =>
                setShowCo2Explanation(!showCo2Explanation)
              }
              title="What is CO₂e?"
              aria-label="Explain CO2e term"
            >
              <span>What is CO₂e?</span>
              <HelpCircle size={13} />
            </button>
          </div>

          <div className="kpi-value-row">
            <span className="kpi-hero-number">{total}</span>
            <span className="kpi-subtext">kg CO₂e this week</span>
          </div>

          {showCo2Explanation && (
            <div className="term-explanation-popup">
              <div className="explanation-head">
                <Info size={14} />
                <strong>Understanding CO₂e</strong>
              </div>

              <p>
                <strong>CO₂e</strong> stands for{' '}
                <em>carbon dioxide equivalent.</em> Different greenhouse gases,
                such as methane and nitrous oxide, are converted into a common
                unit so their climate impact can be compared.
              </p>
            </div>
          )}

          <div className="kpi-footer-note">
            At this pace:{' '}
            <strong>
              {(total * 52).toLocaleString()} kg CO₂e / year
            </strong>{' '}
            across your routine.
          </div>
        </div>

        {/* Biggest Emission Source */}
        <div className="kpi-card hotspot">
          <div className="kpi-header">
            <span className="kpi-tag hotspot-tag">
              Your Biggest Source of Emissions
            </span>

            {hotspot && (
              <span className="kpi-share-badge">
                {hotspot.percentage}% of your total
              </span>
            )}
          </div>

          {hotspot ? (
            <div className="kpi-hotspot-content">
              <div className="hotspot-title">
                {getCategoryConfig(hotspot.key).label || hotspot.label}
              </div>

              <p className="hotspot-desc">
                {hotspot.label} is your leading carbon driver (
                {hotspot.value} kg CO₂e). Because it represents your largest
                chunk, small changes here can create meaningful reductions.
              </p>

              {primaryAction && (
                <div className="primary-action-spotlight">
                  <div className="spotlight-badge">
                    <Sparkles size={12} />
                    <span>Primary Recommended Action</span>
                  </div>

                  <div className="spotlight-title">
                    {primaryAction.title}
                  </div>

                  <div className="spotlight-meta">
                    <span className="spotlight-savings">
                      <TrendingDown size={13} />
                      Saves {primaryAction.estimatedReduction}
                    </span>

                    <button
                      type="button"
                      className="btn-spotlight-jump"
                      onClick={onNavigateToRecommendations}
                    >
                      <span>Take Action</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="kpi-empty">
              No dominant emission driver detected yet.
            </div>
          )}
        </div>

        {/* Weekly Comparison */}
        <div className="kpi-card target">
          <div className="kpi-header">
            <span className="kpi-tag">Your Weekly Comparison</span>

            <button
              type="button"
              className="term-helper-btn"
              onClick={() =>
                setShowBenchmarkExplanation(!showBenchmarkExplanation)
              }
              title="About this comparison guideline"
              aria-label="Explain benchmark source and assumptions"
            >
              <span>Target: {WEEKLY_BENCHMARK_TARGET} kg</span>
              <HelpCircle size={13} />
            </button>
          </div>

          <div className="target-progress-wrap">
            <div className="target-progress-track">
              <div
                className={`target-progress-fill ${total > WEEKLY_BENCHMARK_TARGET ? 'exceeds' : 'within'
                  }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      (total / WEEKLY_BENCHMARK_TARGET) * 100
                    )
                  )}%`,
                }}
              ></div>
            </div>

            <div className="target-progress-meta">
              <span>
                {Math.round(
                  (total / WEEKLY_BENCHMARK_TARGET) * 100
                )}% of target
              </span>

              <span className="target-eval-text">
                {total <= WEEKLY_BENCHMARK_TARGET ? (
                  <span className="status-within">
                    <Check size={13} />
                    {(WEEKLY_BENCHMARK_TARGET - total).toFixed(1)} kg under
                    guideline
                  </span>
                ) : (
                  <span className="status-over">
                    ▲{' '}
                    {(total - WEEKLY_BENCHMARK_TARGET).toFixed(1)} kg over
                    guideline
                  </span>
                )}
              </span>
            </div>
          </div>

          {showBenchmarkExplanation && (
            <div className="term-explanation-popup">
              <div className="explanation-head">
                <Info size={14} />
                <strong>Guideline Source & Assumptions</strong>
              </div>

              <p>
                The <strong>80 kg CO₂e / week</strong> milestone corresponds
                to roughly 4 tonnes per year per person. This is an
                illustrative comparison guideline inspired by sustainable
                lifestyle pathways. It is intended to help track personal
                progress, not to act as a rigid pass/fail test.
              </p>
            </div>
          )}

          <div className="kpi-footer-note">
            Illustrative sustainable lifestyle comparison guideline.
          </div>
        </div>
      </div>

      {/* Emissions Donut and Lifestyle Breakdown */}
      <div className="dash-visual-grid">

        {/* Donut Chart */}
        <div className="visual-card donut-container">
          <h3>Where Your Emissions Come From</h3>

          <p className="card-caption">
            See the proportional share of each everyday activity in your
            total footprint.
          </p>

          <div className="donut-and-legend">

            <div className="svg-donut-wrapper">
              <svg
                viewBox="0 0 160 160"
                className="svg-donut"
                aria-label="Category breakdown donut chart"
              >
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#E8ECE9"
                  strokeWidth="20"
                />

                {total > 0 &&
                  orderedKeys.map((key) => {
                    const pct = percentages[key] / 100;
                    const strokeDash = pct * circumference;
                    const dashOffset = -strokeOffset;

                    strokeOffset += strokeDash;

                    return (
                      <circle
                        key={key}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={getCategoryConfig(key).color}
                        strokeWidth="20"
                        strokeDasharray={`${strokeDash
                          } ${circumference - strokeDash}`}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 80 80)"
                      />
                    );
                  })}
              </svg>

              <div className="donut-center-label">
                <span className="donut-center-num">{total}</span>
                <span className="donut-center-unit">kg CO₂e</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="donut-legend-list">
              {orderedKeys.map((key) => {
                const config = getCategoryConfig(key);
                const isHotspot = hotspot && hotspot.key === key;

                return (
                  <div
                    key={key}
                    className={`legend-row ${isHotspot ? 'is-hotspot' : ''
                      }`}
                  >
                    <div className="legend-row-left">
                      <span
                        className="legend-swatch"
                        style={{ backgroundColor: config.color }}
                      ></span>

                      <span className="legend-name">
                        {config.label}
                      </span>

                      {isHotspot && (
                        <span className="hotspot-mini-pill">
                          Top Driver
                        </span>
                      )}
                    </div>

                    <div className="legend-row-right">
                      <span className="legend-kg">
                        {breakdown[key] || 0} kg
                      </span>
                      <span className="legend-pct">
                        {percentages[key]}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lifestyle Breakdown */}
        <div className="visual-card category-cards-panel">
          <div className="panel-header-row">
            <div>
              <h3>Your Lifestyle Breakdown</h3>

              <p className="card-caption" style={{ marginBottom: 0 }}>
                Everyday activities broken down with clear, readable
                measurements.
              </p>
            </div>

            <button
              type="button"
              className="btn-text-link"
              onClick={onNavigateToRecommendations}
            >
              Explore Solutions →
            </button>
          </div>

          <div className="category-items-grid">
            {orderedKeys.map((key) => {
              const config = getCategoryConfig(key);
              const IconComp = config.icon;
              const isHotspot = hotspot && hotspot.key === key;

              return (
                <div
                  key={key}
                  className={`category-item-card ${isHotspot ? 'hotspot-border' : ''
                    }`}
                  style={{ '--cat-color': config.color }}
                >
                  <div className="item-top">
                    <div
                      className="item-icon-box"
                      style={{
                        backgroundColor: config.bgLight,
                        color: config.color,
                      }}
                    >
                      <IconComp size={16} />
                    </div>

                    <div>
                      <span className="item-cat-title">
                        {config.label}
                      </span>
                      <span className="item-cat-sublabel">
                        {config.sublabel}
                      </span>
                    </div>

                    {isHotspot && (
                      <span className="hotspot-chip">
                        Top Driver
                      </span>
                    )}
                  </div>

                  <div className="item-values">
                    <span className="item-kg">
                      {breakdown[key] || 0}
                    </span>
                    <span className="item-unit">kg CO₂e</span>
                    <span className="item-pct">
                      ({percentages[key]}% of week)
                    </span>
                  </div>

                  <div className="item-bar-track">
                    <div
                      className="item-bar-fill"
                      style={{
                        width: `${percentages[key]}%`,
                        backgroundColor: config.color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Recommendations */}
      {secondaryActions.length > 0 && (
        <div className="dash-recommendations-teaser">
          <div className="teaser-header">
            <div>
              <div className="teaser-badge">
                <Sparkles size={13} />
                <span>Next Steps for {hotspot?.label}</span>
              </div>

              <h3>
                More Ways to Reduce Your {hotspot?.label} Emissions
              </h3>
            </div>

            <button
              type="button"
              className="btn-action-outline"
              onClick={onNavigateToRecommendations}
            >
              <span>View Full Action Plan</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="teaser-grid">
            {secondaryActions.map((rec) => (
              <div key={rec.id} className="teaser-rec-card">
                <div className="teaser-card-header">
                  <span className="teaser-badge-pill">
                    {rec.badge}
                  </span>

                  <span className="teaser-savings">
                    <TrendingDown size={14} />
                    {rec.estimatedReduction}
                  </span>
                </div>

                <h4>{rec.title}</h4>
                <p>{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Green Challenges, Points and Achievements */}
      <GreenChallenges
        selectedChallengeId={selectedChallengeId}
        isDemo={Boolean(isDemo && !user)}
        user={user}
      />

    </div>
  );
}
