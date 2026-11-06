/* ==============================================================================
   Anviti — Auth & Supabase Connection Modal
   Allows logging into Supabase or provides step-by-step connection instructions
   when credentials are not yet configured.
   ============================================================================== */

import { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Copy, Check, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { signInWithEmail, signUpWithEmail } from '../lib/authService';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin', user: _user }) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
        setSuccessMsg('Account created! Please check your email to confirm or sign in.');
      } else {
        await signInWithEmail(email, password);
        setSuccessMsg('Signed in successfully.');
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const copyEnvSnippet = () => {
    const text = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Database size={18} />
            </div>
            <div>
              <h3>{isConfigured ? (mode === 'signin' ? 'Sign In' : 'Create Account') : 'Supabase Integration'}</h3>
              <p className="modal-subtitle">
                {isConfigured
                  ? 'Access your saved carbon footprint history across devices.'
                  : 'Connect your Supabase database to persist user data.'}
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {isConfigured ? (
            /* Supabase is Configured: Show Sign In / Sign Up */
            <div>
              <div className="auth-tab-switch">
                <button
                  type="button"
                  className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => setMode('signin')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => setMode('signup')}
                >
                  Create Account
                </button>
              </div>

              {errorMsg && (
                <div className="alert-box error">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="alert-box success">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="auth-email">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="auth-password">Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary-block" disabled={loading}>
                  {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Register Account'}
                </button>
              </form>
            </div>
          ) : (
            /* Supabase is Not Configured: Show Setup Path */
            <div className="supabase-guide">
              <div className="guide-status-box">
                <div className="status-indicator-bar amber"></div>
                <div>
                  <strong>Running in Local Storage & Demo Mode</strong>
                  <p>
                    All your calculated footprint records are currently saved locally in your browser.
                    To enable multi-user authentication and cloud sync, provide your Supabase keys.
                  </p>
                </div>
              </div>

              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-num">1</span>
                  <div className="step-content">
                    <h4>Create a free Supabase project</h4>
                    <p>Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="inline-link">supabase.com</a> and create a new project.</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-num">2</span>
                  <div className="step-content">
                    <div className="step-header-with-action">
                      <h4>Add keys to your <code>.env</code> file</h4>
                      <button type="button" className="btn-copy-code" onClick={copyEnvSnippet}>
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="code-snippet">
                      VITE_SUPABASE_URL=https://your-project.supabase.co{'\n'}
                      VITE_SUPABASE_ANON_KEY=your-anon-key
                    </pre>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-num">3</span>
                  <div className="step-content">
                    <h4>Run the SQL Schema</h4>
                    <p>
                      Copy and run the SQL in <code className="code-pill">supabase/schema.sql</code> inside the
                      Supabase SQL Editor to create tables with Row Level Security (RLS).
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary-full" onClick={onClose}>
                  Continue in Local / Demo Mode
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
