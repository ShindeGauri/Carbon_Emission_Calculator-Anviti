/* ==============================================================================
   Anviti — Top Navigation Bar
   Adaptive editorial navigation:
   - Clean public presentation for unauthenticated landing page visitors.
   - Dedicated dashboard tabs & tools for authenticated users and demo explorers.
   ============================================================================== */

import { 
  Leaf, Sparkles, User, LogOut, Sliders, History, 
  Calculator, LayoutDashboard, ArrowLeft, ArrowRight 
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { signOutUser } from '../lib/authService';

export default function Navbar({ 
  activeTab, 
  onTabChange, 
  user, 
  onOpenAuthModal, 
  isDemoMode,
  onSignOut 
}) {
  const isConnected = isSupabaseConfigured();
  const isLanding = activeTab === 'landing' && !user;

  const handleSignOut = async () => {
    try {
      await signOutUser();
      if (onSignOut) {
        onSignOut();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const scrollToSection = (id) => {
    if (activeTab !== 'landing') {
      onTabChange('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Brand */}
        <div 
          className="brand" 
          onClick={() => onTabChange(user ? 'dashboard' : 'landing')} 
          role="button" 
          tabIndex={0}
        >
          <div className="brand-icon">
            <Leaf size={18} strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Anviti</span>
            <span className="brand-tag">Carbon Intelligence</span>
          </div>
        </div>

        {/* Public Landing Navigation vs. In-App Tabs */}
        {isLanding ? (
          /* Public Landing Navigation */
          <nav className="nav-public-links" aria-label="Landing Page Navigation">
            <button
              type="button"
              className="nav-link-item"
              onClick={() => scrollToSection('how-it-works')}
            >
              How It Works
            </button>
            <button
              type="button"
              className="nav-link-item"
              onClick={() => scrollToSection('features')}
            >
              Features
            </button>
            <button
              type="button"
              className="nav-link-item"
              onClick={() => scrollToSection('why-anviti')}
            >
              Why Anviti?
            </button>
            <button
              type="button"
              className="nav-link-item preview-link"
              onClick={() => onTabChange('dashboard')}
            >
              Interactive Demo
            </button>
          </nav>
        ) : (
          /* In-App App Tabs */
          <nav className="nav-tabs" aria-label="Main Application Navigation">
            {!user && (
              <button
                type="button"
                className="nav-tab-btn back-home-tab"
                onClick={() => onTabChange('landing')}
                title="Return to public homepage"
              >
                <ArrowLeft size={14} />
                <span>Home</span>
              </button>
            )}

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onTabChange('dashboard')}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => onTabChange('calculator')}
            >
              <Calculator size={15} />
              <span>Calculator</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => onTabChange('recommendations')}
            >
              <Sparkles size={15} />
              <span>Action Plan</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
              onClick={() => onTabChange('simulator')}
            >
              <Sliders size={15} />
              <span>What-If</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => onTabChange('history')}
            >
              <History size={15} />
              <span>Trends</span>
            </button>
          </nav>
        )}

        {/* Right Side Status & Auth Actions */}
        <div className="nav-actions">
          {isLanding ? (
            /* Unauthenticated Visitor Actions on Landing Page */
            <div className="landing-nav-actions">
              <button
                type="button"
                className="btn-nav-signin"
                onClick={() => onOpenAuthModal('signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn-nav-get-started"
                onClick={() => onOpenAuthModal('signup')}
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            /* In-App Navigation Actions */
            <>
              {/* Supabase Status Pill */}
              <button
                type="button"
                className={`status-pill ${isConnected ? 'connected' : 'demo'}`}
                onClick={() => onOpenAuthModal('signin')}
                title={isConnected ? 'Supabase cloud database is connected' : 'Click to view Supabase setup instructions'}
              >
                <span className="status-dot"></span>
                <span className="status-label">
                  {isConnected ? 'Supabase Live' : isDemoMode ? 'Demo Mode' : 'Local Storage'}
                </span>
              </button>

              {/* User / Sign In Button */}
              {user ? (
                <div className="user-profile">
                  <span className="user-email" title={user.email}>
                    {user.email.split('@')[0]}
                  </span>
                  <button
                    type="button"
                    className="btn-icon-signout"
                    onClick={handleSignOut}
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="demo-user-actions">
                  <button
                    type="button"
                    className="btn-auth-trigger"
                    onClick={() => onOpenAuthModal('signup')}
                  >
                    <User size={14} />
                    <span>Sign In / Save</span>
                  </button>
                  <button
                    type="button"
                    className="btn-exit-demo"
                    onClick={() => onTabChange('landing')}
                    title="Exit demo and return to public home"
                  >
                    Exit Demo
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
