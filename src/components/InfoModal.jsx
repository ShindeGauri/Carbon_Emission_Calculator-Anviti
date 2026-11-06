/* ==============================================================================
   Anviti — Information Dialog (About, Privacy, Contact)
   Provides honest, transparent project context without broken or dummy links.
   ============================================================================== */

import { X, ShieldCheck, Mail, Info, Leaf, Heart } from 'lucide-react';

export default function InfoModal({ type, isOpen, onClose }) {
  if (!isOpen || !type) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card info-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              {type === 'about' && <Leaf size={18} />}
              {type === 'privacy' && <ShieldCheck size={18} />}
              {type === 'contact' && <Mail size={18} />}
            </div>
            <div>
              <h3>
                {type === 'about' && 'About Anviti'}
                {type === 'privacy' && 'Privacy & Data Ethics'}
                {type === 'contact' && 'Contact & Project Inquiries'}
              </h3>
              <p className="modal-subtitle">
                {type === 'about' && 'From Carbon Calculation to Carbon Intelligence'}
                {type === 'privacy' && 'How we handle your environmental records'}
                {type === 'contact' && 'Get in touch with the development team'}
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body info-modal-body">
          {type === 'about' && (
            <div className="info-content-block">
              <p>
                <strong>Anviti</strong> is an open climate-intelligence initiative created to help ordinary individuals and families understand how their everyday habits contribute to greenhouse gas emissions.
              </p>
              <h4>Why We Built This</h4>
              <p>
                Most existing carbon calculators feel like intimidating academic exams filled with obscure units, complex spreadsheets, and guilt-inducing totals. Anviti replaces confusion with clarity—transforming basic weekly estimates into actionable, prioritized lifestyle insights.
              </p>
              <h4>Methodology Baseline</h4>
              <p>
                All calculations strictly use peer-reviewed conversion factors from the UK Department for Environment, Food & Rural Affairs (DEFRA), the Indian Central Electricity Authority (CEA) national grid baseline, and Poore & Nemecek food lifecycle research published in <em>Science</em>.
              </p>
            </div>
          )}

          {type === 'privacy' && (
            <div className="info-content-block">
              <p>
                Your privacy and trust are paramount. Anviti is designed around strict data minimization:
              </p>
              <ul className="info-bullet-list">
                <li>
                  <strong>Strict Row Level Security (RLS):</strong> When using Supabase authentication, your records are protected by database-level policies ensuring only you can read or modify your data.
                </li>
                <li>
                  <strong>Local Storage Fallback:</strong> If you use Anviti without an account or in demo mode, your data never leaves your browser storage.
                </li>
                <li>
                  <strong>No Tracking or Monetization:</strong> We do not sell user data, run third-party tracking scripts, or serve commercial advertisements.
                </li>
              </ul>
            </div>
          )}

          {type === 'contact' && (
            <div className="info-content-block">
              <p>
                Anviti was developed as an educational sustainability hackathon initiative at PCCOE.
              </p>
              <div className="contact-details-box">
                <div className="contact-row">
                  <Mail size={16} />
                  <span><strong>Team Email:</strong> anviti.carbon@gmail.com</span>
                </div>
                <div className="contact-row">
                  <Info size={16} />
                  <span><strong>Project Scope:</strong> Open Hackathon Prototype (PCCOE Pune)</span>
                </div>
                <div className="contact-row">
                  <Heart size={16} />
                  <span><strong>Feedback:</strong> Suggestions and methodology feedback are warmly welcomed.</span>
                </div>
              </div>
            </div>
          )}

          <div className="modal-footer-actions">
            <button type="button" className="btn-secondary-full" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
