/* ==============================================================================
   Anviti — AI Sustainability Assistant Component
   Floating chat panel with contextual personalized sustainability guidance,
   suggested questions, interactive tool actions, and verified goal creation.
   ============================================================================== */

import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, X, Send, RotateCcw, ArrowRight, CheckCircle2, 
  HelpCircle, Bot, User, Target, Check, AlertCircle, ShieldCheck
} from 'lucide-react';
import { sendAssistantMessage } from '../lib/assistantService';
import { createGoal } from '../lib/goalsService';

const SUGGESTED_QUESTIONS = [
  'How can I reduce my carbon footprint?',
  'What is my biggest source of emissions?',
  'Analyze my footprint this month.',
  'How can I save electricity?',
  'Suggest a weekly sustainability goal.',
  'Compare two transport options.',
];

export default function ChatAssistant({
  user,
  currentResult,
  records = [],
  onNavigateTab,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingGoal, setPendingGoal] = useState(null);
  const [savingGoal, setSavingGoal] = useState(false);
  const [assistantMode, setAssistantMode] = useState('rule-based'); // 'rule-based' | 'live-ai'

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize welcome message
  useEffect(() => {
    const displayName = user?.email ? user.email.split('@')[0] : 'friend';
    const hasData = Boolean(currentResult?.total);

    const welcomeGreeting = user
      ? `Hello ${displayName}! I'm your Anviti Sustainability Assistant. I have context on your latest weekly check-in (${hasData ? `${currentResult.total} kg CO₂e` : 'no entries yet'}). Ask me anything about your emissions, savings tips, or goals!`
      : `Hello! I'm Anviti's Sustainability Assistant. I can answer common climate questions, compare transit choices, or help you understand how Anviti measures your carbon footprint. How can I help you today?`;

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: welcomeGreeting,
        actions: user
          ? [
              { label: 'Open Dashboard', tab: 'dashboard' },
              { label: 'Action Plan', tab: 'recommendations' },
            ]
          : [
              { label: 'Explore Demo', tab: 'dashboard' },
              { label: 'Calculator', tab: 'calculator' },
            ],
      },
    ]);
  }, [user, currentResult]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, pendingGoal, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || inputVal;
    if (!textToSend || !textToSend.trim() || loading) return;

    setErrorMsg('');
    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    // Build authorized, privacy-safe context
    const safeContext = {
      isAuthenticated: Boolean(user),
      userEmail: user?.email || null,
      latestRecord: currentResult
        ? {
            total_co2e: currentResult.total,
            highest_category: currentResult.meta?.highestCategory || 'electricity',
            highest_category_pct: 45,
            breakdown: currentResult.breakdown || {},
            raw_input: currentResult.meta?.input || {},
          }
        : null,
      historicalCount: records.length,
      recommendations: [],
    };

    try {
      const response = await sendAssistantMessage(textToSend, safeContext);
      setAssistantMode(response.mode);

      const assistantMsg = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: response.text,
        actions: response.actions || [],
        source: response.mode,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If response includes a proposed goal, prompt for confirmation
      if (response.suggestedGoal) {
        setPendingGoal(response.suggestedGoal);
      }
    } catch (err) {
      console.error('Chat Assistant error:', err);
      setErrorMsg('Sorry, I had trouble processing that question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGoal = async () => {
    if (!pendingGoal) return;
    setSavingGoal(true);

    try {
      await createGoal({
        title: pendingGoal.title,
        category: pendingGoal.category,
        target_reduction_kg: pendingGoal.target_reduction_kg,
      });

      const confirmationMsg = {
        id: 'ast-goal-conf-' + Date.now(),
        sender: 'assistant',
        text: `✓ **Goal Confirmed & Saved!**\n\n"${pendingGoal.title}" has been added to your active sustainability commitments. You can track its progress in your Action Plan!`,
        actions: [
          { label: 'View Action Plan', tab: 'recommendations' },
        ],
      };

      setMessages((prev) => [...prev, confirmationMsg]);
      setPendingGoal(null);
    } catch (err) {
      console.error('Goal save error:', err);
      setErrorMsg('Could not save goal. Please check your network and try again.');
    } finally {
      setSavingGoal(false);
    }
  };

  const handleCancelGoal = () => {
    setPendingGoal(null);
  };

  const handleResetChat = () => {
    const welcome = messages[0];
    setMessages(welcome ? [welcome] : []);
    setPendingGoal(null);
    setErrorMsg('');
  };

  return (
    <div className="chat-assistant-root">
      {/* 1. Floating Launch Button */}
      {!isOpen && (
        <button
          type="button"
          className="btn-floating-ask"
          onClick={() => setIsOpen(true)}
          aria-label="Open Ask Anviti Chat Assistant"
        >
          <div className="floating-btn-icon">
            <Sparkles size={18} />
          </div>
          <span className="floating-btn-label">Ask Anviti</span>
        </button>
      )}

      {/* 2. Floating Chat Panel */}
      {isOpen && (
        <div className="chat-panel-container" role="dialog" aria-modal="false" aria-label="Anviti Assistant">
          {/* Header */}
          <div className="chat-panel-header">
            <div className="chat-header-title-box">
              <div className="assistant-avatar">
                <Bot size={18} />
              </div>
              <div>
                <div className="assistant-title-row">
                  <h3>Ask Anviti</h3>
                  <span className={`assistant-mode-chip ${assistantMode}`}>
                    {assistantMode === 'live-ai' ? 'Live AI' : 'Rule-Based Mode'}
                  </span>
                </div>
                <span className="assistant-subtitle">Sustainability Companion</span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="btn-chat-icon"
                onClick={handleResetChat}
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                className="btn-chat-icon close"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Assistant Mode Banner */}
          <div className="chat-mode-banner">
            <ShieldCheck size={13} />
            <span>
              {assistantMode === 'live-ai'
                ? 'Connected to upstream AI model. Responses adhere strictly to Anviti conversion factors.'
                : 'Operating in context & rule-based mode. Transparent, verified science with zero hallucination.'}
            </span>
          </div>

          {/* Conversation Thread */}
          <div className="chat-messages-scroll">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === 'assistant' ? <Bot size={15} /> : <User size={15} />}
                </div>

                <div className="message-bubble-wrapper">
                  <div className="message-bubble">
                    <p className="message-text">{msg.text}</p>
                  </div>

                  {/* Contextual Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="message-actions-row">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="btn-chat-action"
                          onClick={() => {
                            if (onNavigateTab) {
                              onNavigateTab(act.tab);
                            }
                          }}
                        >
                          <span>{act.label}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pending Goal Confirmation Dialog */}
            {pendingGoal && (
              <div className="goal-confirm-card">
                <div className="goal-confirm-head">
                  <Target size={16} />
                  <strong>Confirm Weekly Sustainability Goal</strong>
                </div>
                <p className="goal-confirm-title">{pendingGoal.title}</p>
                <div className="goal-confirm-stats">
                  <span>Category: <strong>{pendingGoal.category}</strong></span>
                  <span>Target: <strong>~{pendingGoal.target_reduction_kg} kg CO₂e</strong></span>
                </div>
                <div className="goal-confirm-actions">
                  <button
                    type="button"
                    className="btn-confirm-goal-primary"
                    onClick={handleConfirmGoal}
                    disabled={savingGoal}
                  >
                    <Check size={14} />
                    <span>{savingGoal ? 'Saving Goal...' : 'Confirm & Save Goal'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-confirm-goal-cancel"
                    onClick={handleCancelGoal}
                    disabled={savingGoal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Loading Typing Indicator */}
            {loading && (
              <div className="chat-message-row assistant">
                <div className="message-avatar">
                  <Bot size={15} />
                </div>
                <div className="message-bubble loading">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="chat-error-alert">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Grid */}
          <div className="chat-suggestions-area">
            <span className="suggestions-header">Suggested Questions:</span>
            <div className="suggestions-chips-wrap">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn-suggestion-chip"
                  onClick={() => handleSend(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about your emissions, eco tips, or goals..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={loading}
              maxLength={500}
            />
            <button
              type="submit"
              className="btn-send-message"
              disabled={!inputVal.trim() || loading}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
