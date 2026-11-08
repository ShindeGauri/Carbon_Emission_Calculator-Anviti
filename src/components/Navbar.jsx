
/* ==============================================================================
   Anviti — Top Navigation Bar
   Adaptive navigation with profile editing and Green Challenges shortcut.
   ============================================================================== */

import { useEffect, useState } from 'react';
import {
  Leaf,
  Sparkles,
  User,
  LogOut,
  Sliders,
  History,
  Calculator,
  LayoutDashboard,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Pencil,
  X,
  Save,
  LoaderCircle
} from 'lucide-react';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
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

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Load the user's saved profile name.
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user) {
        setFullName('');
        return;
      }

      // Use Auth metadata as the initial fallback.
      setFullName(
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        ''
      );

      if (!isSupabaseConfigured() || !supabase) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (isMounted && data?.full_name) {
          setFullName(data.full_name);
        }
      } catch (error) {
        console.error('Profile loading error:', error);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

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

  // Open the existing Green Challenges section inside Dashboard.
  const handleOpenChallenges = () => {
    if (activeTab !== 'dashboard') {
      onTabChange('dashboard');
    }

    setTimeout(() => {
      const challengeSection = document.querySelector('.gc-section');

      if (challengeSection) {
        challengeSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 200);
  };

  const openProfileEditor = () => {
    setProfileMessage('');
    setProfileError('');
    setIsProfileOpen(true);
  };

  // Save the updated name to Supabase.
  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const cleanedName = fullName.trim();

    if (!cleanedName) {
      setProfileError('Please enter your full name.');
      return;
    }

    if (!user || !supabase || !isSupabaseConfigured()) {
      setProfileError('A connected Supabase account is required to edit your profile.');
      return;
    }

    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: cleanedName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: cleanedName }
      });

      if (authError) throw authError;

      setFullName(cleanedName);
      setProfileMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileError(error.message || 'Unable to update your profile.');
    } finally {
      setProfileSaving(false);
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

            {/* Green Challenges shortcut */}
            <button
              type="button"
              className="nav-tab-btn"
              onClick={handleOpenChallenges}
              title="Go to Green Challenges"
            >
              <Trophy size={15} />
              <span>Challenges</span>
            </button>

          </nav>
        )}

        {/* Right Side Status & Auth Actions */}
        <div className="nav-actions">

          {isLanding ? (
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
            <>

              {/* Supabase Status Pill */}
              <button
                type="button"
                className={`status-pill ${isConnected ? 'connected' : 'demo'}`}
                onClick={() => onOpenAuthModal('signin')}
                title={
                  isConnected
                    ? 'Supabase cloud database is connected'
                    : 'Click to view Supabase setup instructions'
                }
              >
                <span className="status-dot"></span>

                <span className="status-label">
                  {isConnected
                    ? 'Supabase Live'
                    : isDemoMode
                      ? 'Demo Mode'
                      : 'Local Storage'}
                </span>
              </button>

              {/* User / Sign In Button */}
              {user ? (
                <div className="user-profile">

                  <span className="user-email" title={user.email}>
                    {fullName || user.email?.split('@')[0]}
                  </span>

                  {/* Edit Profile */}
                  <button
                    type="button"
                    className="btn-icon-signout"
                    onClick={openProfileEditor}
                    title="Edit Profile"
                    aria-label="Edit Profile"
                  >
                    <Pencil size={15} />
                  </button>

                  {/* Sign Out */}
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

      {/* =========================================================
          EDIT PROFILE MODAL
         ========================================================= */}
      {isProfileOpen && (
        <div
          onClick={() => setIsProfileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(15, 30, 22, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              color: '#263b31'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '22px'
              }}
            >
              <div>
                <h2
                  id="profile-modal-title"
                  style={{
                    margin: 0,
                    fontSize: '21px',
                    fontWeight: 750
                  }}
                >
                  Edit Profile
                </h2>

                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '13px',
                    color: '#718078'
                  }}
                >
                  Update your Anviti account details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                aria-label="Close profile editor"
                style={{
                  border: 'none',
                  background: '#f1f5f2',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#42584b'
                }}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>

              <label
                htmlFor="profile-full-name"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 650,
                  marginBottom: '8px'
                }}
              >
                Full Name
              </label>

              <input
                id="profile-full-name"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setProfileError('');
                  setProfileMessage('');
                }}
                placeholder="Enter your full name"
                required
                maxLength={80}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  border: '1px solid #dce5de',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#263b31',
                  marginBottom: '16px'
                }}
              />

              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 650,
                  marginBottom: '8px'
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  border: '1px solid #e5ebe6',
                  borderRadius: '10px',
                  background: '#f5f7f5',
                  color: '#718078',
                  fontSize: '14px',
                  marginBottom: '18px'
                }}
              />

              {profileError && (
                <p
                  role="alert"
                  style={{
                    color: '#b42318',
                    fontSize: '13px',
                    margin: '0 0 14px'
                  }}
                >
                  {profileError}
                </p>
              )}

              {profileMessage && (
                <p
                  role="status"
                  style={{
                    color: '#21834b',
                    fontSize: '13px',
                    margin: '0 0 14px'
                  }}
                >
                  {profileMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                style={{
                  width: '100%',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  background: profileSaving ? '#91aa99' : '#287849',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: profileSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {profileSaving ? (
                  <>
                    <LoaderCircle size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}
    </header>
  );
}
