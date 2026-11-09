
import { useMemo, useState, useEffect } from 'react';

import {
  Leaf,
  Trophy,
  Bike,
  Zap,
  Recycle,
  ShoppingBag,
  Droplets,
  TreePine,
  Utensils,
  Wrench,
  ArrowRight,
  Footprints,
  Sprout,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload,
  X
} from 'lucide-react';

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './GreenChallenges.css';

// ======================================================
// CHALLENGES
// ======================================================

const challenges = [
  {
    id: 1,
    title: 'Plastic-Free Living',
    description: 'Say no to single-use plastic. Carry reusable bags, bottles and containers.',
    category: 'Waste Reduction',
    difficulty: 'Easy',
    duration: '3 days',
    points: 40,
    icon: ShoppingBag,
    color: 'green'
  },
  {
    id: 2,
    title: 'Grow a Greener Tomorrow',
    description: 'Plant a native tree or sapling and take responsibility for its care.',
    category: 'Nature',
    difficulty: 'Medium',
    duration: '1 week',
    points: 80,
    icon: TreePine,
    color: 'green'
  },
  {
    id: 3,
    title: 'Every Drop Counts',
    description: 'Reduce water waste by fixing leaks and adopting mindful water habits.',
    category: 'Water',
    difficulty: 'Easy',
    duration: '3 days',
    points: 40,
    icon: Droplets,
    color: 'blue'
  },
  {
    id: 4,
    title: 'Power Down Challenge',
    description: 'Switch off unused lights and appliances. Avoid unnecessary standby power.',
    category: 'Energy',
    difficulty: 'Easy',
    duration: '1 week',
    points: 50,
    icon: Zap,
    color: 'gold'
  },
  {
    id: 5,
    title: 'Low-Carbon Commute',
    description: 'Replace short car or bike trips with walking, cycling or public transport.',
    category: 'Transport',
    difficulty: 'Medium',
    duration: '3 days',
    points: 60,
    icon: Bike,
    color: 'green'
  },
  {
    id: 6,
    title: 'Food Waste Rescue',
    description: 'Plan meals, reuse leftovers and separate organic waste for composting.',
    category: 'Food & Waste',
    difficulty: 'Medium',
    duration: '1 week',
    points: 60,
    icon: Recycle,
    color: 'gold'
  },
  {
    id: 7,
    title: 'Repair, Reuse, Repeat',
    description: 'Give an old item a second life instead of buying a replacement.',
    category: 'Consumption',
    difficulty: 'Medium',
    duration: '1 week',
    points: 70,
    icon: Wrench,
    color: 'blue'
  },
  {
    id: 8,
    title: 'Planet-Friendly Plate',
    description: 'Try local, seasonal and plant-based meals to make mindful food choices.',
    category: 'Sustainable Food',
    difficulty: 'Easy',
    duration: '3 days',
    points: 40,
    icon: Utensils,
    color: 'green'
  }
];

// ======================================================
// CHALLENGE ILLUSTRATIONS
// ======================================================

const challengeIllustrations = {
  1: {
    emoji: '🛍️',
    title: 'Choose Reusable',
    detail: 'Small swaps, less plastic'
  },
  2: {
    emoji: '🌱',
    title: 'Grow Green',
    detail: 'Plant today, protect tomorrow'
  },
  3: {
    emoji: '💧',
    title: 'Save Water',
    detail: 'Every drop makes a difference'
  },
  4: {
    emoji: '⚡',
    title: 'Save Energy',
    detail: 'Power down, protect nature'
  },
  5: {
    emoji: '🚲',
    title: 'Travel Green',
    detail: 'Move more, pollute less'
  },
  6: {
    emoji: '♻️',
    title: 'Rescue Food',
    detail: 'Waste less, value more'
  },
  7: {
    emoji: '🔧',
    title: 'Reuse & Repair',
    detail: 'Give old things new life'
  },
  8: {
    emoji: '🥗',
    title: 'Eat Sustainably',
    detail: 'Make planet-friendly choices'
  }
};

const filters = [
  'All',
  'Waste Reduction',
  'Nature',
  'Water',
  'Energy',
  'Transport',
  'Food & Waste',
  'Consumption',
  'Sustainable Food'
];

// ======================================================
// DATE HELPER
// ======================================================

const getLocalDateKey = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function GreenChallenges() {
  const [completed, setCompleted] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [submitted, setSubmitted] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ====================================================
  // LOAD USER SUBMISSIONS
  // ====================================================

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissions() {
      if (!isSupabaseConfigured() || !supabase) return;

      try {
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) return;

        const { data, error } = await supabase
          .from('challenge_submissions')
          .select(
            'challenge_id, challenge_title, status, created_at, reviewed_at, review_note'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!isMounted) return;

        const approvedIds = data
          .filter(item => item.status === 'approved')
          .map(item => item.challenge_id);

        const pendingIds = data
          .filter(item => item.status === 'pending')
          .map(item => item.challenge_id);

        setSubmissions(data);

        setCompleted([...new Set(approvedIds)]);

        setSubmitted([
          ...new Set(
            pendingIds.filter(id => !approvedIds.includes(id))
          )
        ]);

      } catch (error) {
        console.error('Failed to load challenge submissions:', error);
      }
    }

    loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  // ====================================================
  // FILTER CHALLENGES
  // ====================================================

  const visibleChallenges = useMemo(() => {
    return challenges.filter(challenge =>
      activeFilter === 'All' || challenge.category === activeFilter
    );
  }, [activeFilter]);

  // ====================================================
  // LATEST SUBMISSION FOR EACH CHALLENGE
  // ====================================================

  const latestSubmissions = useMemo(() => {
    const latest = {};

    submissions.forEach(item => {
      if (!latest[item.challenge_id]) {
        latest[item.challenge_id] = item;
      }
    });

    return latest;
  }, [submissions]);

  // ====================================================
  // APPROVED SUBMISSIONS
  // ====================================================

  const approvedSubmissions = useMemo(() => {
    return submissions.filter(item => item.status === 'approved');
  }, [submissions]);

  // ====================================================
  // GREEN POINTS
  // ====================================================

  const earnedPoints = challenges
    .filter(challenge => completed.includes(challenge.id))
    .reduce((sum, challenge) => sum + challenge.points, 0);

  // ====================================================
  // PLANT GROWTH LEVEL
  // ====================================================

  const plantStage = useMemo(() => {
    if (earnedPoints >= 300) {
      return {
        emoji: '🌳',
        label: 'Growing Forest',
        message: 'Amazing! You are making a lasting impact.',
        nextMilestone: null,
        progress: 100
      };
    }

    if (earnedPoints >= 150) {
      return {
        emoji: '🌲',
        label: 'Lush Plant',
        message: 'Your sustainable journey is flourishing!',
        nextMilestone: 300,
        progress: ((earnedPoints - 150) / 150) * 100
      };
    }

    if (earnedPoints >= 50) {
      return {
        emoji: '🌿',
        label: 'Growing Plant',
        message: 'Keep going! Your green journey is growing.',
        nextMilestone: 150,
        progress: ((earnedPoints - 50) / 100) * 100
      };
    }

    return {
      emoji: '🌱',
      label: 'Little Seedling',
      message: 'Every great forest starts with a little seed.',
      nextMilestone: 50,
      progress: (earnedPoints / 50) * 100
    };
  }, [earnedPoints]);

  // ====================================================
  // OVERALL PROGRESS
  // ====================================================

  const progress = (completed.length / challenges.length) * 100;

  // ====================================================
  // WEEKLY APPROVED ACTIVITIES
  // ====================================================

  const now = new Date();
  const weekStart = new Date(now);

  weekStart.setHours(0, 0, 0, 0);

  weekStart.setDate(
    now.getDate() - ((now.getDay() + 6) % 7)
  );

  const weeklyActivities = new Set(
    approvedSubmissions
      .filter(item => {
        const activityDate = new Date(
          item.reviewed_at || item.created_at
        );

        return activityDate >= weekStart && activityDate <= now;
      })
      .map(item => item.challenge_id)
  ).size;

  // ====================================================
  // CURRENT STREAK
  // ====================================================

  const activityDates = new Set(
    approvedSubmissions
      .map(item =>
        getLocalDateKey(item.reviewed_at || item.created_at)
      )
      .filter(Boolean)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = getLocalDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayKey = getLocalDateKey(yesterday);

  let currentStreak = 0;

  if (
    activityDates.has(todayKey) ||
    activityDates.has(yesterdayKey)
  ) {
    const streakStart = activityDates.has(todayKey)
      ? today
      : yesterday;

    for (let i = 0; i < 365; i++) {
      const day = new Date(streakStart);
      day.setDate(streakStart.getDate() - i);

      if (activityDates.has(getLocalDateKey(day))) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // ====================================================
  // ACHIEVEMENTS
  // ====================================================

  const achievementThresholds = [1, 2, 3, 5, 7, 8];

  const unlockedAchievements = achievementThresholds.filter(
    threshold => completed.length >= threshold
  ).length;

  // ====================================================
  // SUBMIT CHALLENGE PROOF
  // ====================================================

  const handleProofSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!proofFile || !proofText.trim() || !selectedChallenge) {
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      alert('Supabase is not configured. Please try again later.');
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedTypes.includes(proofFile.type)) {
      alert('Please upload a JPG, PNG, WEBP or PDF file.');
      return;
    }

    if (proofFile.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5 MB.');
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        alert('Please log in before submitting a challenge.');
        return;
      }

      const safeFileName = proofFile.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );

      const filePath =
        `${user.id}/${selectedChallenge.id}_${Date.now()}_${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('challenge-proofs')
        .upload(filePath, proofFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('challenge_submissions')
        .insert({
          user_id: user.id,
          challenge_id: selectedChallenge.id,
          challenge_title: selectedChallenge.title,
          description: proofText.trim(),
          proof_path: filePath
        });

      if (insertError) throw insertError;

      setSubmitted(prev => [
        ...new Set([...prev, selectedChallenge.id])
      ]);

      setSubmissions(prev => [
        {
          challenge_id: selectedChallenge.id,
          challenge_title: selectedChallenge.title,
          status: 'pending',
          created_at: new Date().toISOString(),
          reviewed_at: null,
          review_note: null
        },
        ...prev
      ]);

      setSelectedChallenge(null);
      setProofText('');
      setProofFile(null);

      alert('Your challenge proof has been submitted successfully!');

    } catch (error) {
      console.error('Challenge submission failed:', error);
      alert(error.message || 'Submission failed. Please try again.');

    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="green-page">

      {/* ================= HERO ================= */}

      <section className="green-header">

        <div className="green-hero-content">

          <span className="green-eyebrow">
            <Leaf size={15} />
            ANVITI • SUSTAINABILITY HUB
          </span>

          <h1>
            Small Steps,
            <br />
            Greener Future.
          </h1>

          <p>
            Turn everyday choices into meaningful environmental action.
            Take a challenge, make a difference and inspire change.
          </p>

          <div className="green-hero-note">
            <Sparkles size={16} />
            Every sustainable action counts.
          </div>

        </div>

        <div className="green-header-icon">
          <Sprout size={76} strokeWidth={1.2} />
        </div>

      </section>

      {/* ================= FOUR STAT CARDS ================= */}

      <section className="green-stats">

        <div className="green-stat-card">
          <div className="green-stat-icon">
            <Leaf size={25} />
          </div>

          <span>Green Points</span>
          <strong>{earnedPoints}</strong>
          <small>Points earned</small>
        </div>

        <div className="green-stat-card streak-card">

          <div className="green-stat-icon streak-icon">
            <Flame
              size={28}
              fill="#F59E0B"
              stroke="#C65D16"
              strokeWidth={1.8}
            />
          </div>

          <span>Current Streak</span>
          <strong>{currentStreak} Days</strong>
          <small>Based on approved activities</small>
        </div>

        <div className="green-stat-card">
          <div className="green-stat-icon">
            <CheckCircle2 size={25} />
          </div>

          <span>Completed This Week</span>
          <strong>{weeklyActivities}</strong>
          <small>Approved activities</small>
        </div>

        <div className="green-stat-card">
          <div className="green-stat-icon">
            <Trophy size={25} />
          </div>

          <span>Achievements</span>
          <strong>{unlockedAchievements}/6</strong>
          <small>Badges unlocked</small>
        </div>

      </section>

      {/* ================= PROGRESS ================= */}

      <section className="green-progress-card">

        <div className="green-progress-heading">
          <div>
            <h2>Keep Growing!</h2>
            <p>
              Small actions today create a better tomorrow.
            </p>
          </div>

          <strong>{Math.round(progress)}%</strong>
        </div>

        <progress
          max="100"
          value={progress}
          aria-label="Challenge completion progress"
        />

        <div className="green-progress-footer">
          <span>
            {completed.length} of {challenges.length} approved
          </span>

          <span>
            {challenges.length - completed.length} to go
          </span>
        </div>

      </section>

      {/* ================= PLANT GROWTH ================= */}

      <section className="green-plant-growth">

        <div className="green-plant-visual">

          <div className="green-plant-orbit">
            <span>✦</span>
            <span>✧</span>
            <span>✦</span>
          </div>

          <div className="green-plant-emoji">
            {plantStage.emoji}
          </div>

          <div className="green-plant-ground" />

        </div>

        <div className="green-plant-info">

          <span className="green-plant-label">
            YOUR GREEN JOURNEY
          </span>

          <h2>{plantStage.label}</h2>

          <p>{plantStage.message}</p>

          <div className="green-plant-progress-track">
            <div
              className="green-plant-progress-fill"
              style={{ width: `${plantStage.progress}%` }}
            />
          </div>

          <div className="green-plant-label">
            {plantStage.nextMilestone
              ? `${earnedPoints} / ${plantStage.nextMilestone} points to next stage`
              : 'You have reached the highest growth stage!'}
          </div>

        </div>

      </section>

      {/* ================= CHALLENGE HEADING ================= */}

      <section className="green-section-heading">

        <div>
          <span className="green-small-label">
            MAKE A DIFFERENCE
          </span>

          <h2>Explore Challenges</h2>

          <p>
            Choose an activity that fits your lifestyle and start today.
          </p>
        </div>

        <div className="green-section-decoration">
          <Footprints size={27} />
        </div>

      </section>

      {/* ================= FILTERS ================= */}

      <div className="green-filters">

        {filters.map(filter => (
          <button
            key={filter}
            className={activeFilter === filter ? 'active' : ''}
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}

      </div>

      {/* ================= CHALLENGE CARDS ================= */}

      <div className="challenge-grid">

        {visibleChallenges.map(challenge => {

          const Icon = challenge.icon;
          const illustration = challengeIllustrations[challenge.id];

          const isCompleted = completed.includes(challenge.id);
          const isSubmitted = submitted.includes(challenge.id);

          const latestSubmission = latestSubmissions[challenge.id];

          const isRejected =
            !isCompleted &&
            !isSubmitted &&
            latestSubmission?.status === 'rejected';

          return (
            <article className="challenge-card" key={challenge.id}>

              <div className="challenge-card-top">

                <div className="challenge-icon">
                  <Icon size={24} />
                </div>

                <span className="challenge-category">
                  {challenge.category}
                </span>

              </div>

              {/* CHALLENGE ILLUSTRATION */}

              <div className="challenge-illustration">

                <div className="challenge-illustration-emoji">
                  {illustration.emoji}
                </div>

                <div className="challenge-illustration-text">
                  <strong>{illustration.title}</strong>
                  <span>{illustration.detail}</span>
                </div>

                <span className="challenge-illustration-sparkle">
                  ✦
                </span>

              </div>

              <span className="challenge-number">
                CHALLENGE {String(challenge.id).padStart(2, '0')}
              </span>

              <h3>{challenge.title}</h3>

              <p>{challenge.description}</p>

              <div className="challenge-details">

                <span>
                  <Sparkles size={14} />
                  {challenge.difficulty}
                </span>

                <span>
                  <Clock size={14} />
                  {challenge.duration}
                </span>

              </div>

              <div className="challenge-card-bottom">

                <div className="challenge-points">
                  <Trophy size={16} />
                  <strong>{challenge.points}</strong>
                  <span>points</span>
                </div>

                <button
                  className="challenge-button"
                  disabled={isCompleted || isSubmitted}
                  onClick={() => {
                    setSelectedChallenge(challenge);
                    setProofText('');
                    setProofFile(null);
                  }}
                >
                  {isCompleted
                    ? 'Approved'
                    : isSubmitted
                      ? 'Pending Review'
                      : isRejected
                        ? 'Submit Again'
                        : 'Submit Proof'}

                  {isCompleted
                    ? <CheckCircle2 size={16} />
                    : <ArrowRight size={16} />}
                </button>

              </div>

              {/* APPROVED STATUS */}

              {isCompleted && (
                <div className="challenge-approved">
                  <CheckCircle2 size={14} />
                  Proof approved • {challenge.points} points earned
                </div>
              )}

              {/* PENDING STATUS */}

              {isSubmitted && !isCompleted && (
                <div className="challenge-pending">
                  <Clock size={14} />
                  Proof submitted • Awaiting review
                </div>
              )}

              {/* REJECTED STATUS */}

              {isRejected && (
                <div className="challenge-rejected">

                  <X size={15} />

                  <div>
                    <strong>Proof Rejected</strong>

                    {latestSubmission.review_note && (
                      <p>
                        Review note: {latestSubmission.review_note}
                      </p>
                    )}

                    <small>
                      You can submit your proof again.
                    </small>
                  </div>

                </div>
              )}

            </article>
          );
        })}

      </div>

      {/* ================= IMPACT NOTE ================= */}

      <div className="impact-note">

        <Leaf size={19} />

        <p>
          Your actions matter. Environmental impact values will be shown
          only when supported by reliable calculations.
        </p>

      </div>

      {/* ================= PROOF SUBMISSION MODAL ================= */}

      {selectedChallenge && (

        <div className="proof-modal-overlay">

          <div className="proof-modal">

            <button
              className="proof-modal-close"
              onClick={() => setSelectedChallenge(null)}
              aria-label="Close"
              disabled={isSubmitting}
            >
              <X size={21} />
            </button>

            <span className="green-small-label">
              SHARE YOUR IMPACT
            </span>

            <h2>Submit Your Proof</h2>

            <p>
              Show us how you completed:
              <strong> {selectedChallenge.title}</strong>
            </p>

            <form onSubmit={handleProofSubmit}>

              <label htmlFor="proof-description">
                What did you do?
              </label>

              <textarea
                id="proof-description"
                value={proofText}
                onChange={event => setProofText(event.target.value)}
                placeholder="Briefly describe your sustainable action..."
                required
                rows={4}
                disabled={isSubmitting}
              />

              <label htmlFor="proof-file">
                Upload photo or document
              </label>

              <div className="proof-upload-area">

                <Upload size={25} />

                <span>
                  {proofFile
                    ? proofFile.name
                    : 'Choose your proof file'}
                </span>

                <small>Image or PDF • Maximum 5 MB</small>

                <input
                  id="proof-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={event =>
                    setProofFile(event.target.files[0] || null)
                  }
                  required
                  disabled={isSubmitting}
                />

              </div>

              <button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Submitting...'
                  : 'Submit for Review'}

                {!isSubmitting && <ArrowRight size={17} />}
              </button>

            </form>

            <p className="proof-privacy-note">
              <CheckCircle2 size={14} />
              Your submission will be reviewed before points are awarded.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}
