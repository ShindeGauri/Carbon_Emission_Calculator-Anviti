/* ==============================================================================
   Anviti — Public Landing Page
   A welcoming, human-centered entry point explaining Anviti's mission
   and guiding visitors from curiosity to carbon consciousness.
   ============================================================================== */

import { 
  ArrowRight, Calculator, Sparkles, Sliders, History, 
  CheckCircle2, Compass, ShieldCheck, Heart, Footprints,
  Car, Zap, Utensils, ShoppingBag
} from 'lucide-react';

const CURRENT_YEAR = 2026;

export default function LandingPage({ onGetStarted, onExploreDemo, onOpenInfoModal }) {
  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page-root">
      {/* =====================================================================
          1. HERO SECTION
          ===================================================================== */}
      <section className="landing-hero-section">
        <div className="hero-content-col">
          <div className="hero-eyebrow-pill">
            <Footprints size={14} />
            <span>Sustainable Living Made Simple</span>
          </div>

          <h1 className="hero-headline">
            Small changes.<br />
            <span className="hero-headline-accent">A lighter footprint.</span>
          </h1>

          <p className="hero-supporting-text">
            Understand how your everyday choices affect the environment. Discover what
            contributes most to your carbon footprint and find simple ways to reduce it.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => onGetStarted('signup')}
            >
              <span>Discover My Footprint</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="btn-hero-secondary"
              onClick={scrollToHowItWorks}
            >
              How It Works
            </button>
          </div>

          <div className="hero-sublink-row">
            <span>Want to test it first?</span>
            <button
              type="button"
              className="btn-demo-link"
              onClick={onExploreDemo}
            >
              Explore our interactive preview with sample data →
            </button>
          </div>

          {/* Quick Trust Highlights */}
          <div className="hero-trust-badges">
            <div className="trust-badge-item">
              <CheckCircle2 size={15} />
              <span>No technical background needed</span>
            </div>
            <div className="trust-badge-item">
              <CheckCircle2 size={15} />
              <span>Takes less than 3 minutes</span>
            </div>
            <div className="trust-badge-item">
              <CheckCircle2 size={15} />
              <span>100% transparent & private</span>
            </div>
          </div>
        </div>

        {/* Hero Visual: Custom Crafted Sustainability Vector Illustration */}
        <div className="hero-visual-col" aria-hidden="true">
          <div className="hero-card-illustration">
            <svg
              viewBox="0 0 460 360"
              className="hero-svg-artwork"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft Background Hills */}
              <circle cx="230" cy="180" r="140" fill="#EBF3EE" />
              <path
                d="M40 310 C120 230, 200 270, 290 240 C360 210, 420 250, 440 310 L440 360 L20 360 Z"
                fill="#D8E8DC"
              />
              <path
                d="M20 320 C100 280, 220 310, 310 280 C380 260, 410 290, 440 320 L440 360 L20 360 Z"
                fill="#C6DEC8"
              />

              {/* Gentle Sun */}
              <circle cx="360" cy="80" r="32" fill="#F4DEAF" />
              <circle cx="360" cy="80" r="24" fill="#EBCB85" />

              {/* Eco Home with Solar Panel */}
              <rect x="250" y="210" width="105" height="85" rx="6" fill="#FFFFFF" stroke="#1A3A2A" strokeWidth="2.5" />
              <polygon points="235,210 302,155 370,210" fill="#366B54" stroke="#1A3A2A" strokeWidth="2.5" />
              {/* Solar Panel on Roof */}
              <polygon points="265,198 300,165 330,165 295,198" fill="#2D6584" />
              <line x1="282" y1="181" x2="312" y2="181" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="297" y1="165" x2="280" y2="198" stroke="#FFFFFF" strokeWidth="1" />
              {/* Home Door & Window */}
              <rect x="288" y="245" width="28" height="50" rx="3" fill="#D3DDD6" />
              <circle cx="310" cy="270" r="2" fill="#1A3A2A" />
              <rect x="260" y="230" width="22" height="22" rx="3" fill="#EBF3EE" stroke="#1A3A2A" strokeWidth="1.5" />
              <line x1="271" y1="230" x2="271" y2="252" stroke="#1A3A2A" strokeWidth="1" />
              <line x1="260" y1="241" x2="282" y2="241" stroke="#1A3A2A" strokeWidth="1" />

              {/* Stylized Tree */}
              <rect x="110" y="235" width="16" height="75" rx="3" fill="#8C6239" />
              <circle cx="118" cy="185" r="44" fill="#2D5A43" />
              <circle cx="140" cy="195" r="34" fill="#3D7457" />
              <circle cx="95" cy="200" r="30" fill="#4B8564" />

              {/* Bicycle (Active Mobility) */}
              <circle cx="170" cy="285" r="16" stroke="#1A3A2A" strokeWidth="3" fill="none" />
              <circle cx="215" cy="285" r="16" stroke="#1A3A2A" strokeWidth="3" fill="none" />
              <polyline points="170,285 188,285 200,265 180,265 170,285" stroke="#1A3A2A" strokeWidth="2.5" fill="none" />
              <line x1="200" y1="265" x2="215" y2="285" stroke="#1A3A2A" strokeWidth="2.5" />
              <line x1="180" y1="265" x2="175" y2="255" stroke="#1A3A2A" strokeWidth="2.5" />
              <line x1="170" y1="255" x2="182" y2="255" stroke="#1A3A2A" strokeWidth="2.5" />
              <line x1="200" y1="265" x2="208" y2="250" stroke="#1A3A2A" strokeWidth="2.5" />
              <line x1="203" y1="250" x2="215" y2="250" stroke="#1A3A2A" strokeWidth="2.5" />

              {/* Floating Leaf / Footprint Badge */}
              <g transform="translate(45, 65)">
                <rect width="135" height="52" rx="10" fill="#FFFFFF" stroke="#D3DDD6" strokeWidth="1.5" />
                <circle cx="26" cy="26" r="14" fill="#EBF3EE" />
                <path d="M22 30 C22 22, 30 18, 30 18 C30 18, 32 26, 26 30 Z" fill="#2D5A43" />
                <text x="48" y="22" fill="#56685E" fontSize="9" fontWeight="600" textTransform="uppercase">Weekly Trend</text>
                <text x="48" y="38" fill="#1A3A2A" fontSize="13" fontWeight="800">▼ 14% Lighter</text>
              </g>

              {/* Wind Turbine Silhouette */}
              <line x1="390" y1="220" x2="390" y2="295" stroke="#8FA89B" strokeWidth="2" />
              <line x1="390" y1="220" x2="375" y2="198" stroke="#8FA89B" strokeWidth="1.5" />
              <line x1="390" y1="220" x2="410" y2="205" stroke="#8FA89B" strokeWidth="1.5" />
              <line x1="390" y1="220" x2="385" y2="242" stroke="#8FA89B" strokeWidth="1.5" />
            </svg>

            {/* Ambient Card Caption */}
            <div className="hero-card-foot">
              <span className="card-foot-label">From Everyday Choices to Environmental Clarity</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. HOW IT WORKS SECTION
          ===================================================================== */}
      <section id="how-it-works" className="landing-how-section">
        <div className="section-intro-block">
          <span className="section-pill">The Process</span>
          <h2 className="section-heading">How Anviti Works</h2>
          <p className="section-subtext">
            Four simple steps designed to take the mystery and guilt out of carbon tracking.
          </p>
        </div>

        <div className="steps-cards-grid">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-card-num-circle">1</div>
            <div className="step-card-icon-box">
              <Compass size={22} />
            </div>
            <h3 className="step-card-title">1. Measure</h3>
            <p className="step-card-desc">
              Enter details about your everyday transport, electricity use, food choices, and shopping habits.
            </p>
            <div className="step-category-tags">
              <span><Car size={12} /> Transport</span>
              <span><Zap size={12} /> Electricity</span>
              <span><Utensils size={12} /> Food</span>
              <span><ShoppingBag size={12} /> Goods</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-card-num-circle">2</div>
            <div className="step-card-icon-box">
              <Calculator size={22} />
            </div>
            <h3 className="step-card-title">2. Understand</h3>
            <p className="step-card-desc">
              Discover which activities contribute most to your estimated carbon footprint without confusing scientific jargon.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-card-num-circle">3</div>
            <div className="step-card-icon-box">
              <Sparkles size={22} />
            </div>
            <h3 className="step-card-title">3. Improve</h3>
            <p className="step-card-desc">
              Receive practical, high-impact suggestions tailored specifically to your habits so you know where to start.
            </p>
          </div>

          {/* Step 4 */}
          <div className="step-card">
            <div className="step-card-num-circle">4</div>
            <div className="step-card-icon-box">
              <History size={22} />
            </div>
            <h3 className="step-card-title">4. Track</h3>
            <p className="step-card-desc">
              Monitor changes in your footprint over time and see the tangible positive difference your small habits create.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. FEATURES SECTION
          ===================================================================== */}
      <section id="features" className="landing-features-section">
        <div className="section-intro-block">
          <span className="section-pill">Built for Everyone</span>
          <h2 className="section-heading">Everything You Need to Make Progress</h2>
          <p className="section-subtext">
            Simple, practical tools that turn environmental data into everyday guidance.
          </p>
        </div>

        <div className="features-cards-grid">
          {/* Feature 1 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper transport">
              <Calculator size={22} />
            </div>
            <h3 className="feature-item-title">Carbon Footprint Calculator</h3>
            <p className="feature-item-desc">
              Enter everyday activity approximations across transport, power, diet, and goods to calculate your estimated weekly emissions with complete transparency.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper food">
              <Sparkles size={22} />
            </div>
            <h3 className="feature-item-title">Personalized Action Plan</h3>
            <p className="feature-item-desc">
              Get straightforward, quantified recommendations tailored to your highest emission areas so you know which simple swaps save the most carbon.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper electricity">
              <Sliders size={22} />
            </div>
            <h3 className="feature-item-title">What-If Simulator</h3>
            <p className="feature-item-desc">
              Experiment with hypothetical lifestyle changes like carpooling or plant-based meals to preview your potential savings before making changes in real life.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-item-card">
            <div className="feature-icon-wrapper consumption">
              <History size={22} />
            </div>
            <h3 className="feature-item-title">Progress Tracking</h3>
            <p className="feature-item-desc">
              Save your weekly check-ins, view visual emissions trends, and compare recorded periods to watch your environmental footprint lighten over time.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. WHY ANVITI? SECTION
          ===================================================================== */}
      <section id="why-anviti" className="landing-why-section">
        <div className="why-content-container">
          <div className="why-header-text">
            <span className="section-pill">Why Anviti?</span>
            <h2 className="section-heading">Sustainability Designed for Everyday Life</h2>
            <p className="why-lead-paragraph">
              Most carbon calculators feel like intimidating academic exams with complex math, obscure units, and guilt-inducing totals. Anviti was built to be different: an approachable partner that helps ordinary people understand their impact and identify achievable lifestyle improvements.
            </p>
          </div>

          <div className="why-pillars-grid">
            <div className="why-pillar-card">
              <div className="pillar-icon-box">
                <Heart size={20} />
              </div>
              <h4>No Guilt, Just Clarity</h4>
              <p>
                We do not judge your lifestyle. We provide honest, friendly explanations so you can see where your emissions come from without feeling overwhelmed.
              </p>
            </div>

            <div className="why-pillar-card">
              <div className="pillar-icon-box">
                <Compass size={20} />
              </div>
              <h4>Achievable Action Over Perfection</h4>
              <p>
                You do not need to overhaul your entire life overnight. Focusing on just one or two high-leverage changes moves the needle far more effectively.
              </p>
            </div>

            <div className="why-pillar-card">
              <div className="pillar-icon-box">
                <ShieldCheck size={20} />
              </div>
              <h4>Verified, Transparent Science</h4>
              <p>
                Every calculation is open and traceable to official conversion standards (DEFRA and Indian national grid data). No opaque algorithms or fake AI claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. FINAL CALL TO ACTION SECTION
          ===================================================================== */}
      <section className="landing-final-cta-section">
        <div className="final-cta-card">
          <div className="final-cta-badge">Start Your Journey Today</div>
          <h2 className="final-cta-headline">Ready to understand your footprint?</h2>
          <p className="final-cta-subtext">
            Join conscious households taking small, meaningful steps toward a cleaner future.
            It takes just two minutes to get your first baseline check-in.
          </p>
          <div className="final-cta-buttons">
            <button
              type="button"
              className="btn-final-cta-primary"
              onClick={() => onGetStarted('signup')}
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn-final-cta-ghost"
              onClick={onExploreDemo}
            >
              Try Interactive Preview First
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. FOOTER
          ===================================================================== */}
      <footer className="landing-footer-section">
        <div className="landing-footer-container">
          <div className="footer-brand-col">
            <div className="footer-brand-title">
              <Footprints size={18} />
              <span>Anviti</span>
            </div>
            <p className="footer-tagline-text">
              Carbon Footprint Monitoring: From Carbon Calculation to Carbon Intelligence.
            </p>
            <span className="footer-copyright">
              © {CURRENT_YEAR} Anviti Sustainability Initiative. Developed for PCCOE.
            </span>
          </div>

          <div className="footer-links-col">
            <div className="footer-nav-group">
              <span className="footer-group-title">Explore</span>
              <button type="button" className="footer-link-btn" onClick={scrollToHowItWorks}>
                How It Works
              </button>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
              </button>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => {
                  const el = document.getElementById('why-anviti');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Why Anviti?
              </button>
              <button type="button" className="footer-link-btn" onClick={onExploreDemo}>
                Interactive Demo
              </button>
            </div>

            <div className="footer-nav-group">
              <span className="footer-group-title">Project & Trust</span>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => onOpenInfoModal('about')}
              >
                About Anviti
              </button>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => onOpenInfoModal('privacy')}
              >
                Privacy & Data
              </button>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => onOpenInfoModal('contact')}
              >
                Contact & Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
