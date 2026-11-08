
import { useEffect, useState } from 'react';
import {
    Award,
    CheckCircle2,
    Flame,
    Leaf,
    Sparkles,
    Trophy,
    CalendarDays,
    Sun,
    PartyPopper,
    TreePine,
    Droplets,
    Recycle,
    ShoppingBag,
    Footprints,
    Zap,
    Camera,
    Clock,
    Upload,
    Lock,
    XCircle,
} from 'lucide-react';
import './GreenChallenges.css';

const STORAGE_KEY = 'anviti-green-progress';

const CHALLENGE_CATEGORIES = {
    daily: [
        {
            id: 'bottle-buddy',
            title: 'Bottle Buddy',
            description: 'Carry your reusable water bottle throughout the day.',
            points: 10,
            difficulty: 'Easy',
            icon: Droplets,
        },
        {
            id: 'switch-off-lights',
            title: 'Switch-Off Detective',
            description: 'Switch off unused lights and electrical devices.',
            points: 10,
            difficulty: 'Easy',
            icon: Zap,
        },
        {
            id: 'walk-short-distance',
            title: 'Green Commute',
            description: 'Walk or cycle instead of using a vehicle for a short journey.',
            points: 10,
            difficulty: 'Easy',
            icon: Footprints,
        },
        {
            id: 'plastic-free',
            title: 'Plastic-Free Mission',
            description: 'Avoid single-use plastic throughout the day.',
            points: 10,
            difficulty: 'Medium',
            icon: Recycle,
        },
        {
            id: 'waste-sorting',
            title: 'Waste Sorting Hero',
            description: 'Separate wet and dry waste correctly.',
            points: 10,
            difficulty: 'Easy',
            icon: Leaf,
        },
        {
            id: 'water-saver',
            title: 'Water-Saver Mission',
            description: 'Practise one water-saving habit today.',
            points: 10,
            difficulty: 'Easy',
            icon: Droplets,
        },
    ],

    weekly: [
        {
            id: 'public-transport',
            title: 'Public Transport Explorer',
            description: 'Use public transport at least twice this week.',
            points: 30,
            difficulty: 'Medium',
            icon: CalendarDays,
        },
        {
            id: 'conscious-shopper',
            title: 'Conscious Shopper',
            description: 'Use reusable shopping bags and avoid unnecessary packaging.',
            points: 30,
            difficulty: 'Medium',
            icon: ShoppingBag,
        },
        {
            id: 'plant-parent',
            title: 'Plant Parent',
            description: 'Water and care for a plant throughout the week.',
            points: 30,
            difficulty: 'Easy',
            icon: TreePine,
        },
        {
            id: 'repair-dont-replace',
            title: "Repair, Don't Replace",
            description: 'Repair or reuse an item instead of buying a replacement.',
            points: 30,
            difficulty: 'Medium',
            icon: Recycle,
        },
        {
            id: 'food-waste-fighter',
            title: 'Food Waste Fighter',
            description: 'Plan your meals and reduce food waste for seven days.',
            points: 30,
            difficulty: 'Medium',
            icon: Leaf,
        },
    ],

    festive: [
        {
            id: 'eco-decorator',
            title: 'Eco-Decorator',
            description: 'Create decorations using reusable or natural materials.',
            points: 20,
            difficulty: 'Easy',
            icon: Sparkles,
        },
        {
            id: 'green-festive-lights',
            title: 'Bright but Green',
            description: 'Use energy-efficient lighting during celebrations.',
            points: 20,
            difficulty: 'Easy',
            icon: Zap,
        },
        {
            id: 'waste-free-celebration',
            title: 'Waste-Free Celebration',
            description: 'Celebrate while minimizing waste.',
            points: 20,
            difficulty: 'Medium',
            icon: PartyPopper,
        },
        {
            id: 'thoughtful-gifting',
            title: 'Thoughtful Gifting',
            description: 'Choose handmade, reusable or eco-friendly gifts.',
            points: 20,
            difficulty: 'Easy',
            icon: ShoppingBag,
        },
    ],

    monthly: [
        {
            id: 'green-guardian',
            title: 'Green Guardian',
            description: 'Plant a tree or participate in a tree-planting initiative.',
            points: 60,
            difficulty: 'Hard',
            icon: TreePine,
        },
        {
            id: 'plastic-reduction-month',
            title: 'Plastic Reduction Month',
            description: 'Make a consistent effort to reduce plastic use throughout the month.',
            points: 60,
            difficulty: 'Hard',
            icon: Recycle,
        },
        {
            id: 'water-conservation-month',
            title: 'Water Conservation Champion',
            description: 'Follow water-saving habits throughout the month.',
            points: 60,
            difficulty: 'Hard',
            icon: Droplets,
        },
        {
            id: 'mindful-shopping-month',
            title: 'Mindful Shopping Month',
            description: 'Avoid unnecessary purchases for an entire month.',
            points: 60,
            difficulty: 'Hard',
            icon: ShoppingBag,
        },
    ],
};

const TABS = [
    { id: 'daily', label: 'Daily Challenges', icon: Sun },
    { id: 'weekly', label: 'Weekly Challenges', icon: CalendarDays },
    { id: 'festive', label: 'Festive Special', icon: PartyPopper },
    { id: 'monthly', label: 'Monthly Challenges', icon: TreePine },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
];

const EMPTY_PROGRESS = {
    dailyCompletions: {},
    festiveCompletions: [],
    weeklyCompletions: {},
    monthlyCompletions: {},
    pendingProofs: {},
    startedChallenges: [],
};

function getTodayKey() {
    return new Date().toLocaleDateString('en-CA');
}

function getWeekKey() {
    const date = new Date();
    const day = date.getDay() || 7;

    date.setDate(date.getDate() - day + 1);

    return date.toLocaleDateString('en-CA');
}

function getMonthKey() {
    const date = new Date();

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, '0')}`;
}

// Preserve progress created by the previous version.
function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return EMPTY_PROGRESS;

        const parsed = JSON.parse(saved);

        const dailyCompletions = {
            ...(parsed.dailyCompletions || {}),
        };

        const oldDailyIds = {
            'reusable-bottle': 'bottle-buddy',
            'avoid-plastic': 'plastic-free',
        };

        Object.keys(dailyCompletions).forEach((date) => {
            dailyCompletions[date] = [
                ...new Set(
                    (dailyCompletions[date] || []).map(
                        (id) => oldDailyIds[id] || id
                    )
                ),
            ];
        });

        const oldFestiveIds = {
            'diwali-lights': 'green-festive-lights',
            'diwali-decorations': 'eco-decorator',
            'diwali-waste': 'waste-free-celebration',
        };

        const festiveCompletions = [
            ...new Set([
                ...(parsed.festiveCompletions || []),
                ...(parsed.diwaliCompletions || []).map(
                    (id) => oldFestiveIds[id] || id
                ),
            ]),
        ];

        return {
            ...EMPTY_PROGRESS,
            ...parsed,
            dailyCompletions,
            festiveCompletions,
            weeklyCompletions: parsed.weeklyCompletions || {},
            monthlyCompletions: parsed.monthlyCompletions || {},
            pendingProofs: parsed.pendingProofs || {},
            startedChallenges: parsed.startedChallenges || [],
        };
    } catch (error) {
        console.error('Could not load Green Challenge progress:', error);

        return EMPTY_PROGRESS;
    }
}

function calculateStreak(dailyCompletions) {
    const dates = Object.keys(dailyCompletions)
        .filter((date) => dailyCompletions[date]?.length > 0)
        .sort()
        .reverse();

    if (dates.length === 0) return 0;

    const today = new Date();
    const todayKey = getTodayKey();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayKey = yesterday.toLocaleDateString('en-CA');

    if (dates[0] !== todayKey && dates[0] !== yesterdayKey) {
        return 0;
    }

    let streak = 0;
    let expected = new Date(`${dates[0]}T12:00:00`);

    for (const date of dates) {
        const expectedKey = expected.toLocaleDateString('en-CA');

        if (date !== expectedKey) break;

        streak++;

        expected.setDate(expected.getDate() - 1);
    }

    return streak;
}

function calculatePoints(progress) {
    const dailyPoints = Object.values(
        progress.dailyCompletions || {}
    ).reduce((total, ids) => total + ids.length * 10, 0);

    const weeklyPoints = Object.values(
        progress.weeklyCompletions || {}
    ).reduce((total, ids) => total + ids.length * 30, 0);

    const monthlyPoints = Object.values(
        progress.monthlyCompletions || {}
    ).reduce((total, ids) => total + ids.length * 60, 0);

    const festivePoints =
        (progress.festiveCompletions || []).length * 20;

    return dailyPoints + weeklyPoints + monthlyPoints + festivePoints;
}

function getCompletedThisWeek(dailyCompletions) {
    const today = new Date();
    const start = new Date(today);

    start.setDate(today.getDate() - 6);

    return Object.entries(dailyCompletions || {}).reduce(
        (total, [date, ids]) => {
            const completionDate = new Date(`${date}T12:00:00`);

            if (completionDate >= start && completionDate <= today) {
                return total + ids.length;
            }

            return total;
        },
        0
    );
}

export default function GreenChallenges({ selectedChallengeId = null }) {
    const [progress, setProgress] = useState(loadProgress);
    const [activeTab, setActiveTab] = useState('daily');
    const [selectedFiles, setSelectedFiles] = useState({});
    const [notice, setNotice] = useState('');
    const [highlightedChallengeId, setHighlightedChallengeId] = useState(null);

    // Open the correct tab when a challenge is selected from Recommendations.
    useEffect(() => {
        if (!selectedChallengeId) return;

        const matchingCategory = Object.entries(CHALLENGE_CATEGORIES).find(
            ([category, challenges]) =>
                challenges.some(
                    (challenge) => challenge.id === selectedChallengeId
                )
        );

        if (!matchingCategory) return;

        const [category] = matchingCategory;

        setActiveTab(category);
        setHighlightedChallengeId(selectedChallengeId);

        // Wait for the selected tab to render, then scroll to its challenge.
        const scrollTimer = setTimeout(() => {
            const challengeElement = document.getElementById(
                `challenge-${selectedChallengeId}`
            );

            challengeElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 250);

        // Remove the highlight after a short time.
        const highlightTimer = setTimeout(() => {
            setHighlightedChallengeId(null);
        }, 3500);

        return () => {
            clearTimeout(scrollTimer);
            clearTimeout(highlightTimer);
        };
    }, [selectedChallengeId]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (error) {
            console.error('Could not save Green Challenge progress:', error);
        }
    }, [progress]);

    const todayKey = getTodayKey();
    const weekKey = getWeekKey();
    const monthKey = getMonthKey();

    const greenPoints = calculatePoints(progress);

    const currentStreak = calculateStreak(
        progress.dailyCompletions
    );

    const completedThisWeek = getCompletedThisWeek(
        progress.dailyCompletions
    );

    const getCompletionList = (category) => {
        if (category === 'daily') {
            return progress.dailyCompletions[todayKey] || [];
        }

        if (category === 'weekly') {
            return progress.weeklyCompletions[weekKey] || [];
        }

        if (category === 'festive') {
            return progress.festiveCompletions || [];
        }

        if (category === 'monthly') {
            return progress.monthlyCompletions[monthKey] || [];
        }

        return [];
    };

    const isCompleted = (challenge, category) => {
        return getCompletionList(category).includes(challenge.id);
    };

    const getStatus = (challenge) => {
        if (progress.pendingProofs[challenge.id]?.status === 'pending') {
            return 'pending';
        }

        if (progress.pendingProofs[challenge.id]?.status === 'rejected') {
            return 'rejected';
        }

        return 'none';
    };

    const startChallenge = (challengeId) => {
        setProgress((previous) => ({
            ...previous,
            startedChallenges: [
                ...new Set([
                    ...(previous.startedChallenges || []),
                    challengeId,
                ]),
            ],
        }));

        setNotice('Challenge started! Good luck with your green mission.');
    };

    const selectProof = (challengeId, file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setNotice('Please select an image file as proof.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setNotice('Please select an image smaller than 5 MB.');
            return;
        }

        setSelectedFiles((previous) => ({
            ...previous,
            [challengeId]: file,
        }));

        setNotice('Proof image selected successfully.');
    };

    const submitProof = (challenge, category) => {
        const file = selectedFiles[challenge.id];

        if (!file) {
            setNotice('Please select a proof image first.');
            return;
        }

        if (isCompleted(challenge, category)) {
            setNotice('This challenge is already completed.');
            return;
        }

        const submission = {
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            category,
            fileName: file.name,
            submittedAt: new Date().toISOString(),
            status: 'pending',
        };

        setProgress((previous) => ({
            ...previous,
            pendingProofs: {
                ...previous.pendingProofs,
                [challenge.id]: submission,
            },
        }));

        setSelectedFiles((previous) => {
            const updated = { ...previous };
            delete updated[challenge.id];
            return updated;
        });

        setNotice(
            'Proof saved in this frontend prototype. Admin verification will be connected with the backend later.'
        );
    };

    const achievements = [
        {
            id: 'first-step',
            title: 'First Green Step',
            description: 'Earn your first 10 Green Points.',
            icon: Leaf,
            unlocked: greenPoints >= 10,
        },
        {
            id: 'green-explorer',
            title: 'Green Explorer',
            description: 'Earn 50 Green Points.',
            icon: Sparkles,
            unlocked: greenPoints >= 50,
        },
        {
            id: 'consistency-star',
            title: 'Consistency Star',
            description: 'Maintain a 3-day activity streak.',
            icon: Flame,
            unlocked: currentStreak >= 3,
        },
        {
            id: 'festive-champion',
            title: 'Festive Champion',
            description: 'Complete all four festive challenges.',
            icon: Trophy,
            unlocked: CHALLENGE_CATEGORIES.festive.every(
                (challenge) =>
                    (progress.festiveCompletions || []).includes(challenge.id)
            ),
        },
        {
            id: 'weekly-hero',
            title: 'Weekly Hero',
            description: 'Complete at least three weekly challenges.',
            icon: CalendarDays,
            unlocked:
                (progress.weeklyCompletions[weekKey] || []).length >= 3,
        },
        {
            id: 'monthly-guardian',
            title: 'Monthly Guardian',
            description: 'Complete a monthly challenge.',
            icon: TreePine,
            unlocked:
                (progress.monthlyCompletions[monthKey] || []).length >= 1,
        },
    ];

    const unlockedAchievements = achievements.filter(
        (item) => item.unlocked
    ).length;

    const renderChallengeCard = (challenge, category) => {
        const Icon = challenge.icon;
        const completed = isCompleted(challenge, category);
        const status = getStatus(challenge);
        const started = progress.startedChallenges.includes(challenge.id);
        const selectedFile = selectedFiles[challenge.id];
        const isHighlighted = highlightedChallengeId === challenge.id;

        return (
            <article
                id={`challenge-${challenge.id}`}
                className={`gc-challenge-card ${isHighlighted ? 'gc-highlighted-challenge' : ''}`}
                key={challenge.id}
                style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    borderRadius: '14px',
                    border: isHighlighted
                        ? '2px solid #2f9660'
                        : '1px solid var(--border-color, #e5e7eb)',
                    background: 'var(--card-bg, #ffffff)',
                    boxShadow: isHighlighted
                        ? '0 0 0 4px rgba(47, 150, 96, 0.16)'
                        : undefined,
                    transition: 'border 0.25s ease, box-shadow 0.25s ease',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '42px',
                            height: '42px',
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '12px',
                            background: '#edf5ef',
                            color: '#366b54',
                        }}
                    >
                        <Icon size={22} />
                    </div>

                    <span
                        style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '6px 10px',
                            borderRadius: '20px',
                            background: '#edf5ef',
                            color: '#366b54',
                        }}
                    >
                        +{challenge.points} Points
                    </span>
                </div>

                <div>
                    <h3 style={{ margin: '0 0 7px', fontSize: '17px' }}>
                        {challenge.title}
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            fontSize: '13px',
                            lineHeight: 1.6,
                            color: 'var(--text-secondary, #64748b)',
                        }}
                    >
                        {challenge.description}
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                    }}
                >
                    <span style={{ color: '#64748b' }}>
                        Difficulty: {challenge.difficulty}
                    </span>

                    {completed && (
                        <span style={{ color: '#25834d', fontWeight: 600 }}>
                            <CheckCircle2 size={13} style={{ verticalAlign: 'middle' }} /> Completed
                        </span>
                    )}

                    {status === 'pending' && !completed && (
                        <span style={{ color: '#b7791f', fontWeight: 600 }}>
                            <Clock size={13} style={{ verticalAlign: 'middle' }} /> Pending
                        </span>
                    )}

                    {status === 'rejected' && !completed && (
                        <span style={{ color: '#c24141', fontWeight: 600 }}>
                            <XCircle size={13} style={{ verticalAlign: 'middle' }} /> Rejected
                        </span>
                    )}
                </div>

                {completed ? (
                    <div
                        style={{
                            padding: '10px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            background: '#edf5ef',
                            color: '#286344',
                            fontWeight: 600,
                            fontSize: '13px',
                        }}
                    >
                        <CheckCircle2 size={15} style={{ verticalAlign: 'middle' }} /> Challenge Completed
                    </div>
                ) : status === 'pending' ? (
                    <div
                        style={{
                            padding: '11px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            background: '#fff7e6',
                            color: '#946200',
                            fontSize: '13px',
                        }}
                    >
                        <Clock size={15} style={{ verticalAlign: 'middle' }} /> Waiting for admin verification
                    </div>
                ) : (
                    <>
                        {!started && (
                            <button
                                type="button"
                                className="gc-complete-btn"
                                onClick={() => startChallenge(challenge.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                Start Challenge
                            </button>
                        )}

                        {started && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '9px',
                                }}
                            >
                                <label
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'var(--text-primary, #334155)',
                                    }}
                                >
                                    <Camera size={15} style={{ verticalAlign: 'middle' }} /> Upload photo proof
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        selectProof(
                                            challenge.id,
                                            event.target.files?.[0]
                                        )
                                    }
                                    style={{
                                        width: '100%',
                                        fontSize: '12px',
                                    }}
                                />

                                {selectedFile && (
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            color: '#366b54',
                                            overflowWrap: 'anywhere',
                                        }}
                                    >
                                        Selected: {selectedFile.name}
                                    </span>
                                )}

                                {status === 'rejected' && (
                                    <p
                                        style={{
                                            margin: 0,
                                            color: '#c24141',
                                            fontSize: '12px',
                                        }}
                                    >
                                        Your previous proof was rejected. You can select another image and resubmit.
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="gc-complete-btn"
                                    disabled={!selectedFile}
                                    onClick={() => submitProof(challenge, category)}
                                    style={{
                                        cursor: selectedFile ? 'pointer' : 'not-allowed',
                                        opacity: selectedFile ? 1 : 0.55,
                                    }}
                                >
                                    <Upload size={15} style={{ verticalAlign: 'middle' }} /> Submit Proof
                                </button>
                            </div>
                        )}
                    </>
                )}
            </article>
        );
    };

    return (
        <section className="gc-section">
            <div className="gc-panel">
                <div style={{ marginBottom: '22px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '6px',
                        }}
                    >
                        <Leaf size={23} color="#366b54" />
                        <h2 style={{ margin: 0 }}>Green Challenges</h2>
                    </div>

                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Make small sustainable choices, build greener habits and earn rewards!
                    </p>
                </div>

                {/* Green Progress Summary */}
                <div className="gc-stats-grid">
                    <div className="gc-stat-card points-card">
                        <div className="gc-stat-icon points-icon">
                            <Leaf size={25} />
                        </div>
                        <div>
                            <p>Green Points</p>
                            <h3>{greenPoints}</h3>
                            <span>Your eco rewards</span>
                        </div>
                    </div>

                    <div className="gc-stat-card streak-card">
                        <div className="gc-stat-icon streak-icon">
                            <Flame size={25} />
                        </div>
                        <div>
                            <p>Current Streak</p>
                            <h3>{currentStreak}</h3>
                            <span>Keep the habit alive</span>
                        </div>
                    </div>

                    <div className="gc-stat-card weekly-card">
                        <div className="gc-stat-icon weekly-icon">
                            <CheckCircle2 size={25} />
                        </div>
                        <div>
                            <p>Completed This Week</p>
                            <h3>{completedThisWeek}</h3>
                            <span>Your weekly progress</span>
                        </div>
                    </div>

                    <div className="gc-stat-card achievement-card">
                        <div className="gc-stat-icon achievement-icon">
                            <Award size={25} />
                        </div>
                        <div>
                            <p>Achievements</p>
                            <h3>{unlockedAchievements}/{achievements.length}</h3>
                            <span>Badges unlocked</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div
                    className="gc-tabs"
                    style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        padding: '5px 0 14px',
                        marginTop: '20px',
                    }}
                >
                    {TABS.map((tab) => {
                        const TabIcon = tab.icon;
                        const active = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flexShrink: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    padding: '10px 14px',
                                    borderRadius: '9px',
                                    border: active
                                        ? '1px solid #366b54'
                                        : '1px solid #e2e8f0',
                                    background: active ? '#366b54' : 'transparent',
                                    color: active ? '#ffffff' : 'var(--text-primary, #475569)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                <TabIcon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* User Feedback */}
                {notice && (
                    <div
                        role="status"
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '10px',
                            padding: '12px',
                            margin: '10px 0',
                            borderRadius: '9px',
                            background: '#edf5ef',
                            color: '#28533f',
                            fontSize: '13px',
                        }}
                    >
                        <span>{notice}</span>

                        <button
                            type="button"
                            onClick={() => setNotice('')}
                            aria-label="Dismiss message"
                            style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: 'inherit',
                            }}
                        >
                            <XCircle size={16} />
                        </button>
                    </div>
                )}

                {/* Challenge Categories */}
                {activeTab !== 'achievements' && (
                    <div style={{ marginTop: '15px' }}>
                        <div style={{ marginBottom: '17px' }}>
                            <h3 style={{ margin: '0 0 5px', fontSize: '19px' }}>
                                {TABS.find((tab) => tab.id === activeTab)?.label}
                            </h3>

                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                                {activeTab === 'daily' &&
                                    'Complete simple eco-friendly activities in your everyday life.'}

                                {activeTab === 'weekly' &&
                                    'Take on bigger missions and build sustainable habits over seven days.'}

                                {activeTab === 'festive' &&
                                    'Make your celebrations joyful, creative and environmentally friendly.'}

                                {activeTab === 'monthly' &&
                                    'Take on meaningful goals and make a lasting environmental impact.'}
                            </p>
                        </div>

                        <div className="gc-challenge-grid">
                            {CHALLENGE_CATEGORIES[activeTab].map((challenge) =>
                                renderChallengeCard(challenge, activeTab)
                            )}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                {activeTab === 'achievements' && (
                    <div style={{ marginTop: '20px' }}>
                        <h3 style={{ margin: '0 0 5px', fontSize: '19px' }}>
                            Your Achievements
                        </h3>

                        <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '13px' }}>
                            Unlock badges by completing challenges and maintaining your green habits.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                                gap: '14px',
                            }}
                        >
                            {achievements.map((achievement) => {
                                const Icon = achievement.icon;

                                return (
                                    <div
                                        key={achievement.id}
                                        style={{
                                            padding: '18px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: achievement.unlocked
                                                ? '#edf5ef'
                                                : 'var(--card-bg, #ffffff)',
                                            opacity: achievement.unlocked ? 1 : 0.7,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '12px',
                                            }}
                                        >
                                            <Icon
                                                size={28}
                                                color={achievement.unlocked ? '#366b54' : '#94a3b8'}
                                            />

                                            {achievement.unlocked ? (
                                                <CheckCircle2 size={19} color="#25834d" />
                                            ) : (
                                                <Lock size={18} color="#94a3b8" />
                                            )}
                                        </div>

                                        <h4 style={{ margin: '0 0 6px', fontSize: '15px' }}>
                                            {achievement.title}
                                        </h4>

                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: '12px',
                                                color: '#64748b',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {achievement.description}
                                        </p>

                                        <p
                                            style={{
                                                margin: '12px 0 0',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: achievement.unlocked ? '#25834d' : '#94a3b8',
                                            }}
                                        >
                                            {achievement.unlocked ? 'Unlocked!' : 'Not unlocked yet'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Progress Disclaimer */}
                <div
                    style={{
                        marginTop: '22px',
                        padding: '13px',
                        borderRadius: '9px',
                        background: '#f5f7f5',
                        color: '#64748b',
                        fontSize: '12px',
                        lineHeight: 1.6,
                    }}
                >
                    <strong>How rewards work:</strong> Green Points are awarded for approved
                    challenge completions. Proof submission in this frontend prototype
                    currently saves a pending status locally. Actual admin verification
                    and point awarding will be connected through the backend.
                </div>
            </div>
        </section>
    );
}
