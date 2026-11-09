import { useEffect, useState } from 'react';
import {
  Leaf, Sparkles, User, LogOut, Sliders, History,
  Calculator, LayoutDashboard, ArrowLeft, ArrowRight,
  Trophy, ShieldCheck, Pencil, X, Save
} from 'lucide-react';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { signOutUser } from '../lib/authService';

export default function Navbar({
  activeTab,
  onTabChange,
  user,
  onOpenAuthModal,
  isDemoMode,
  onSignOut,
  isAdmin
}) {
  const isConnected = isSupabaseConfigured();
  const isLanding = activeTab === 'landing' && !user;

  const [showProfile, setShowProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const handleSignOut = async () => {
    try {
      await signOutUser();
      if (onSignOut) onSignOut();
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

  const openProfile = async () => {
    setShowProfile(true);
    setProfileMessage('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      setFullName(data?.full_name || '');
    } catch (err) {
      setProfileError(err.message || 'Could not load profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');

    if (!fullName.trim()) {
      setProfileError('Please enter your full name.');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim()
        })
        .eq('id', user.id)
        .select('full_name')
        .single();

      if (error) throw error;

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: data.full_name }
      });

      if (authError) {
        console.warn('Auth metadata update failed:', authError);
      }

      setFullName(data.full_name);
      setProfileMessage('Your name has been updated successfully!');
    } catch (err) {
      setProfileError(
        err.message || 'Could not update your name. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="navbar-root">
      <div className="navbar-container">

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

        {isLanding ? (
          <nav className="nav-public-links" aria-label="Landing Page Navigation">
            <button type="button" className="nav-link-item"
              onClick={() => scrollToSection('how-it-works')}>
              How It Works
            </button>

            <button type="button" className="nav-link-item"
              onClick={() => scrollToSection('features')}>
              Features
            </button>

            <button type="button" className="nav-link-item"
              onClick={() => scrollToSection('why-anviti')}>
              Why Anviti?
            </button>

            <button type="button" className="nav-link-item preview-link"
              onClick={() => onTabChange('dashboard')}>
              Interactive Demo
            </button>
          </nav>
        ) : (
          <nav className="nav-tabs" aria-label="Main Application Navigation">

            {!user && (
              <button type="button" className="nav-tab-btn back-home-tab"
                onClick={() => onTabChange('landing')}>
                <ArrowLeft size={14} />
                <span>Home</span>
              </button>
            )}

            <button type="button"
              className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onTabChange('dashboard')}>
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>

            <button type="button"
              className={`nav-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => onTabChange('calculator')}>
              <Calculator size={15} />
              <span>Calculator</span>
            </button>

            <button type="button"
              className={`nav-tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => onTabChange('recommendations')}>
              <Sparkles size={15} />
              <span>Action Plan</span>
            </button>

            <button type="button"
              className={`nav-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
              onClick={() => onTabChange('simulator')}>
              <Sliders size={15} />
              <span>What-If</span>
            </button>

            <button type="button"
              className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => onTabChange('history')}>
              <History size={15} />
              <span>Trends</span>
            </button>

            <button type="button"
              className={`nav-tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => onTabChange('challenges')}>
              <Trophy size={15} />
              <span>Green Challenges</span>
            </button>

            {user && isAdmin && (
              <button type="button"
                className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => onTabChange('admin')}>
                <ShieldCheck size={15} />
                <span>Admin</span>
              </button>
            )}
          </nav>
        )}

        <div className="nav-actions">

          {isLanding ? (
            <div className="landing-nav-actions">
              <button type="button" className="btn-nav-signin"
                onClick={() => onOpenAuthModal('signin')}>
                Sign In
              </button>

              <button type="button" className="btn-nav-get-started"
                onClick={() => onOpenAuthModal('signup')}>
                <span>Get Started</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <>
              <button type="button"
                className={`status-pill ${isConnected ? 'connected' : 'demo'}`}
                onClick={() => onOpenAuthModal('signin')}
                title="Supabase connection status">
                <span className="status-dot"></span>
                <span className="status-label">
                  {isConnected ? 'Supabase Live' : isDemoMode ? 'Demo Mode' : 'Local Storage'}
                </span>
              </button>

              {user ? (
                <div className="user-profile">
                  <span className="user-email" title={user.email}>
                    {user.email?.split('@')[0]}
                  </span>

                  <button type="button"
                    className="btn-icon-signout"
                    onClick={openProfile}
                    title="Edit Profile"
                    aria-label="Edit Profile">
                    <Pencil size={16} />
                  </button>

                  <button type="button"
                    className="btn-icon-signout"
                    onClick={handleSignOut}
                    title="Sign Out"
                    aria-label="Sign Out">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="demo-user-actions">
                  <button type="button" className="btn-auth-trigger"
                    onClick={() => onOpenAuthModal('signup')}>
                    <User size={14} />
                    <span>Sign In / Save</span>
                  </button>

                  <button type="button" className="btn-exit-demo"
                    onClick={() => onTabChange('landing')}>
                    Exit Demo
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showProfile && (
        <div
          onClick={() => setShowProfile(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#fff',
              color: '#253b2e',
              borderRadius: '18px',
              padding: '28px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '22px'
            }}>
              <h2 style={{ margin: 0, fontSize: '22px' }}>
                Edit Profile
              </h2>

              <button type="button"
                onClick={() => setShowProfile(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#253b2e'
                }}>
                <X size={21} />
              </button>
            </div>

            <form onSubmit={saveProfile}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={profileLoading || saving}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  border: '1px solid #ccd8ce',
                  borderRadius: '9px',
                  fontSize: '15px',
                  marginBottom: '14px'
                }}
              />

              <p style={{
                fontSize: '13px',
                color: '#657568',
                marginBottom: '18px'
              }}>
                Email: {user.email}
              </p>

              {profileLoading && <p>Loading profile...</p>}

              {profileError && (
                <p style={{ color: '#c0392b', fontSize: '13px' }}>
                  {profileError}
                </p>
              )}

              {profileMessage && (
                <p style={{ color: '#27834a', fontSize: '13px' }}>
                  {profileMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={profileLoading || saving}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '9px',
                  background: '#315b40',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}