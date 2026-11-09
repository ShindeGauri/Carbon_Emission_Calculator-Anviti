
import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewNotes, setReviewNotes] = useState({});
  const [reviewingId, setReviewingId] = useState(null);

  const loadSubmissions = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('challenge_submissions')
        .select(`
          id,
          user_id,
          challenge_id,
          challenge_title,
          description,
          proof_path,
          status,
          points_awarded,
          review_note,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const { data: profileData, error: profileError } =
        await supabase.rpc('get_challenge_submitter_profiles');

      if (profileError) throw profileError;

      const profileMap = Object.fromEntries(
        (profileData || []).map(profile => [
          profile.user_id,
            {
              full_name: profile.full_name,
              email: profile.email
            }
          ])
        );

      setSubmissions(
        (data || []).map(item => ({
          ...item,
          submitter: profileMap[item.user_id] || null
        }))
      );
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setError(err.message || 'Unable to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const pendingCount = submissions.filter(
    item => item.status === 'pending'
  ).length;

  const approvedCount = submissions.filter(
    item => item.status === 'approved'
  ).length;

  const rejectedCount = submissions.filter(
    item => item.status === 'rejected'
  ).length;

  const openProof = async (proofPath) => {
    try {
      const { data, error } = await supabase.storage
        .from('challenge-proofs')
        .createSignedUrl(proofPath, 60);

      if (error) throw error;

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Unable to open proof:', err);
      alert('Unable to open proof file. Please try again.');
    }
  };

  const handleReview = async (item, decision) => {
    if (reviewingId) return;

    const action = decision === 'approved' ? 'approve' : 'reject';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${item.challenge_title}"?`
    );

    if (!confirmed) return;

    setReviewingId(item.id);

    try {
      const { data, error } = await supabase.rpc(
        'review_challenge_submission',
        {
          p_submission_id: item.id,
          p_decision: decision,
          p_review_note: reviewNotes[item.id] || null
        }
      );

      if (error) throw error;

      if (!data?.success) {
        throw new Error('Review could not be completed.');
      }

      alert(
        decision === 'approved'
          ? `Challenge approved! ${data.points_awarded} points awarded.`
          : 'Challenge rejected successfully.'
      );

      setReviewNotes(prev => {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      });

      await loadSubmissions();
    } catch (err) {
      console.error('Challenge review failed:', err);
      alert(err.message || 'Unable to review this submission.');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span>ANVITI • ADMIN CONTROL CENTER</span>
          <h1>Admin Dashboard</h1>
          <p>Manage users and review sustainability challenge submissions.</p>
        </div>
        <ShieldCheck size={48} />
      </div>

      <div className="admin-stats">
        <div>
          <Users />
          <span>Total Submissions</span>
          <strong>{submissions.length}</strong>
        </div>

        <div>
          <Clock />
          <span>Pending Reviews</span>
          <strong>{pendingCount}</strong>
        </div>

        <div>
          <CheckCircle2 />
          <span>Approved</span>
          <strong>{approvedCount}</strong>
        </div>

        <div>
          <XCircle />
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
        </div>
      </div>

      <section className="admin-review-section">
        <div className="admin-review-heading">
          <div>
            <h2>Challenge Submissions</h2>
            <p>Review proof files submitted by users.</p>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={loadSubmissions}
            disabled={loading || reviewingId !== null}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading && (
          <p className="admin-message">Loading submissions...</p>
        )}

        {error && (
          <p className="admin-error">{error}</p>
        )}

        {!loading && !error && submissions.length === 0 && (
          <p className="admin-message">
            No challenge submissions received yet.
          </p>
        )}

        {!loading && !error && submissions.length > 0 && (
          <div className="admin-submission-list">
            {submissions.map(item => (
              <article
                className="admin-submission-card"
                key={item.id}
              >
                <div className="admin-submission-top">
                  <div>
                    <span className="admin-submission-label">
                      CHALLENGE #{item.challenge_id}
                    </span>
                    <h3>{item.challenge_title}</h3>
                  </div>

                  <span className={`admin-status ${item.status}`}>
                    {item.status}
                  </span>
                </div>

                <p className="admin-submission-description">
                  {item.description}
                </p>

                <div className="admin-submission-meta">
                  <span>
                    <Clock size={14} />
                    {new Date(item.created_at).toLocaleString()}
                  </span>

                  <span>
                    User: {item.submitter?.full_name || 'Name unavailable'}
                  </span>

                  <span>    
                    Email: {item.submitter?.email || 'Email unavailable'}
                  </span>
                </div>

                <div className="admin-submission-footer">
                  <button
                    className="admin-proof-btn"
                    onClick={() => openProof(item.proof_path)}
                  >
                    <FileText size={16} />
                    View Proof
                    <ExternalLink size={14} />
                  </button>

                  {item.status === 'approved' && (
                    <span className="admin-points">
                      {item.points_awarded} points awarded
                    </span>
                  )}
                </div>

                {item.status === 'pending' && (
                  <div className="admin-review-actions">
                    <label htmlFor={`review-note-${item.id}`}>
                      Review Note (optional)
                    </label>

                    <textarea
                      id={`review-note-${item.id}`}
                      value={reviewNotes[item.id] || ''}
                      onChange={event =>
                        setReviewNotes(prev => ({
                          ...prev,
                          [item.id]: event.target.value
                        }))
                      }
                      placeholder="Write a reason or feedback..."
                      rows={2}
                      disabled={reviewingId !== null}
                    />

                    <div className="admin-decision-buttons">
                      <button
                        className="admin-approve-btn"
                        onClick={() => handleReview(item, 'approved')}
                        disabled={reviewingId !== null}
                      >
                        <CheckCircle2 size={16} />
                        {reviewingId === item.id ? 'Processing...' : 'Approve'}
                      </button>

                      <button
                        className="admin-reject-btn"
                        onClick={() => handleReview(item, 'rejected')}
                        disabled={reviewingId !== null}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {item.status === 'rejected' && item.review_note && (
                  <p className="admin-review-note">
                    <strong>Review note:</strong> {item.review_note}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
