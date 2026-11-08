import { useEffect, useRef, useState } from 'react';
import {
    Award, CheckCircle2, Flame, Leaf, Sparkles, Trophy,
    CalendarDays, Sun, PartyPopper, TreePine, Droplets,
    Recycle, ShoppingBag, Footprints, Zap, Camera, Clock,
    Upload, Lock, XCircle, Check, X,
} from 'lucide-react';

import './GreenChallenges.css';

const STORAGE_KEY = 'anviti-green-progress';

const PLANT_GROWTH_STAGES = [
    { minPoints: 0, name: 'Little Seedling', emoji: '🌱', message: 'Every green journey begins with one small step.' },
    { minPoints: 50, name: 'Growing Plant', emoji: '🪴', message: 'Your sustainable habits are taking root!' },
    { minPoints: 150, name: 'Lush Green Plant', emoji: '🌿', message: 'Your green efforts are making a difference!' },
    { minPoints: 300, name: 'Thriving Green Tree', emoji: '🌳', message: 'Amazing! You are growing a greener future.' },
];

const CHALLENGE_CATEGORIES = {
    daily: [
        { id: 'bottle-buddy', title: 'Bottle Buddy', description: 'Carry your reusable water bottle throughout the day.', points: 10, difficulty: 'Easy', icon: Droplets },
        { id: 'switch-off-lights', title: 'Switch-Off Detective', description: 'Switch off unused lights and electrical devices.', points: 10, difficulty: 'Easy', icon: Zap },
        { id: 'walk-short-distance', title: 'Green Commute', description: 'Walk or cycle instead of using a vehicle for a short journey.', points: 10, difficulty: 'Easy', icon: Footprints },
        { id: 'plastic-free', title: 'Plastic-Free Mission', description: 'Avoid single-use plastic throughout the day.', points: 10, difficulty: 'Medium', icon: Recycle },
        { id: 'waste-sorting', title: 'Waste Sorting Hero', description: 'Separate wet and dry waste correctly.', points: 10, difficulty: 'Easy', icon: Leaf },
        { id: 'water-saver', title: 'Water-Saver Mission', description: 'Practise one water-saving habit today.', points: 10, difficulty: 'Easy', icon: Droplets },
    ],
    weekly: [
        { id: 'public-transport', title: 'Public Transport Explorer', description: 'Use public transport at least twice this week.', points: 30, difficulty: 'Medium', icon: CalendarDays },
        { id: 'conscious-shopper', title: 'Conscious Shopper', description: 'Use reusable shopping bags and avoid unnecessary packaging.', points: 30, difficulty: 'Medium', icon: ShoppingBag },
        { id: 'plant-parent', title: 'Plant Parent', description: 'Water and care for a plant throughout the week.', points: 30, difficulty: 'Easy', icon: TreePine },
        { id: 'repair-dont-replace', title: "Repair, Don't Replace", description: 'Repair or reuse an item instead of buying a replacement.', points: 30, difficulty: 'Medium', icon: Recycle },
        { id: 'food-waste-fighter', title: 'Food Waste Fighter', description: 'Plan your meals and reduce food waste for seven days.', points: 30, difficulty: 'Medium', icon: Leaf },
    ],
    festive: [
        { id: 'eco-decorator', title: 'Eco-Decorator', description: 'Create Green Diwali decorations using reusable or natural materials.', points: 20, difficulty: 'Easy', icon: Sparkles },
        { id: 'green-festive-lights', title: 'Clay Diya Celebration', description: 'Choose traditional clay diyas or energy-efficient lighting for Diwali.', points: 20, difficulty: 'Easy', icon: Sun },
        { id: 'waste-free-celebration', title: 'Waste-Free Diwali', description: 'Celebrate Diwali while reducing waste and avoiding unnecessary disposables.', points: 20, difficulty: 'Medium', icon: PartyPopper },
        { id: 'thoughtful-gifting', title: 'Thoughtful Gifting', description: 'Choose handmade, reusable or eco-friendly gifts for your loved ones.', points: 20, difficulty: 'Easy', icon: ShoppingBag },
    ],
    monthly: [
        { id: 'green-guardian', title: 'Green Guardian', description: 'Plant a tree or participate in a tree-planting initiative.', points: 60, difficulty: 'Hard', icon: TreePine },
        { id: 'plastic-reduction-month', title: 'Plastic Reduction Month', description: 'Make a consistent effort to reduce plastic use throughout the month.', points: 60, difficulty: 'Hard', icon: Recycle },
        { id: 'water-conservation-month', title: 'Water Conservation Champion', description: 'Follow water-saving habits throughout the month.', points: 60, difficulty: 'Hard', icon: Droplets },
        { id: 'mindful-shopping-month', title: 'Mindful Shopping Month', description: 'Avoid unnecessary purchases for an entire month.', points: 60, difficulty: 'Hard', icon: ShoppingBag },
    ],
};

const TABS = [
    { id: 'daily', label: 'Daily Challenges', icon: Sun },
    { id: 'weekly', label: 'Weekly Challenges', icon: CalendarDays },
    { id: 'festive', label: 'Green Diwali', icon: PartyPopper },
    { id: 'monthly', label: 'Monthly Challenges', icon: TreePine },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
];

const CHALLENGE_ILLUSTRATIONS = {
    'bottle-buddy': { emoji: '💧', label: 'Water saving', theme: 'water' },
    'water-saver': { emoji: '🚰', label: 'Water conservation', theme: 'water' },
    'water-conservation-month': { emoji: '💦', label: 'Water saving', theme: 'water' },
    'plastic-free': { emoji: '♻️', label: 'Plastic reduction', theme: 'recycling' },
    'waste-sorting': { emoji: '🗑️', label: 'Waste sorting', theme: 'recycling' },
    'repair-dont-replace': { emoji: '🔧', label: 'Repair and reuse', theme: 'recycling' },
    'plastic-reduction-month': { emoji: '🌍', label: 'Plastic reduction', theme: 'recycling' },
    'plant-parent': { emoji: '🪴', label: 'Plant care', theme: 'planting' },
    'green-guardian': { emoji: '🌳', label: 'Tree planting', theme: 'planting' },
    'conscious-shopper': { emoji: '🛍️', label: 'Sustainable shopping', theme: 'shopping' },
    'thoughtful-gifting': { emoji: '🎁', label: 'Eco-friendly gifting', theme: 'shopping' },
    'mindful-shopping-month': { emoji: '🛒', label: 'Mindful shopping', theme: 'shopping' },
    'switch-off-lights': { emoji: '💡', label: 'Energy conservation', theme: 'energy' },
    'walk-short-distance': { emoji: '🚴', label: 'Walking and cycling', theme: 'mobility' },
    'public-transport': { emoji: '🚌', label: 'Public transportation', theme: 'transport' },
    'food-waste-fighter': { emoji: '🥕', label: 'Food waste reduction', theme: 'food' },
    'eco-decorator': { emoji: '🎨', label: 'Eco-friendly decorations', theme: 'festive' },
    'green-festive-lights': { emoji: '🪔', label: 'Eco-friendly Diwali lighting', theme: 'diya' },
    'waste-free-celebration': { emoji: '🎉', label: 'Waste-free celebration', theme: 'celebration' },
};

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
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return { ...EMPTY_PROGRESS };

        const parsed = JSON.parse(saved);
        const dailyCompletions = { ...(parsed.dailyCompletions || {}) };

        const oldDailyIds = {
            'reusable-bottle': 'bottle-buddy',
            'avoid-plastic': 'plastic-free',
        };

        Object.keys(dailyCompletions).forEach((date) => {
            dailyCompletions[date] = [
                ...new Set((dailyCompletions[date] || []).map((id) => oldDailyIds[id] || id)),
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
                ...(parsed.diwaliCompletions || []).map((id) => oldFestiveIds[id] || id),
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
        return { ...EMPTY_PROGRESS };
    }
}

function calculateStreak(dailyCompletions) {
    const dates = Object.keys(dailyCompletions || {})
        .filter((date) => dailyCompletions[date]?.length > 0)
        .sort()
        .reverse();

    if (!dates.length) return 0;

    const todayKey = getTodayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toLocaleDateString('en-CA');

    if (dates[0] !== todayKey && dates[0] !== yesterdayKey) return 0;

    let streak = 0;
    const expected = new Date(`${dates[0]}T12:00:00`);

    for (const date of dates) {
        if (date !== expected.toLocaleDateString('en-CA')) break;
        streak++;
        expected.setDate(expected.getDate() - 1);
    }

    return streak;
}

function calculatePoints(progress) {
    const daily = Object.values(progress.dailyCompletions || {})
        .reduce((total, ids) => total + ids.length * 10, 0);

    const weekly = Object.values(progress.weeklyCompletions || {})
        .reduce((total, ids) => total + ids.length * 30, 0);

    const monthly = Object.values(progress.monthlyCompletions || {})
        .reduce((total, ids) => total + ids.length * 60, 0);

    const festive = (progress.festiveCompletions || []).length * 20;

    return daily + weekly + monthly + festive;
}

function getCompletedThisWeek(dailyCompletions) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    return Object.entries(dailyCompletions || {}).reduce((total, [date, ids]) => {
        const completionDate = new Date(`${date}T12:00:00`);
        return completionDate >= start && completionDate <= today
            ? total + ids.length
            : total;
    }, 0);
}

export default function GreenChallenges({
    selectedChallengeId = null,
    isDemo = false,
    user = null,
}) {
    const [progress, setProgress] = useState(loadProgress);
    const [activeTab, setActiveTab] = useState('daily');
    const [selectedFiles, setSelectedFiles] = useState({});
    const [notice, setNotice] = useState('');
    const [highlightedChallengeId, setHighlightedChallengeId] = useState(null);
    const [celebration, setCelebration] = useState(null);
    const [pointsAnimationKey, setPointsAnimationKey] = useState(0);

    // Stage 5: achievement unlock popup state.
    const [achievementCelebration, setAchievementCelebration] = useState(null);
    const previousUnlockedAchievements = useRef(null);

    // Approval controls are available only in an explicit demo session without a logged-in user.
    const isDemoModeActive = Boolean(isDemo && !user);

    useEffect(() => {
        if (!selectedChallengeId) return;

        const matchingCategory = Object.entries(CHALLENGE_CATEGORIES).find(
            ([, challenges]) => challenges.some((challenge) => challenge.id === selectedChallengeId)
        );

        if (!matchingCategory) return;

        setActiveTab(matchingCategory[0]);
        setHighlightedChallengeId(selectedChallengeId);

        const scrollTimer = setTimeout(() => {
            document.getElementById(`challenge-${selectedChallengeId}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 250);

        const highlightTimer = setTimeout(() => setHighlightedChallengeId(null), 3500);

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

    const plantStageIndex = greenPoints >= 300 ? 3 : greenPoints >= 150 ? 2 : greenPoints >= 50 ? 1 : 0;
    const currentPlantStage = PLANT_GROWTH_STAGES[plantStageIndex];
    const nextPlantStage = PLANT_GROWTH_STAGES[plantStageIndex + 1];

    const plantGrowthProgress = nextPlantStage
        ? Math.min(100, Math.round(
            ((greenPoints - currentPlantStage.minPoints) /
                (nextPlantStage.minPoints - currentPlantStage.minPoints)) * 100
        ))
        : 100;

    const pointsToNextStage = nextPlantStage
        ? Math.max(0, nextPlantStage.minPoints - greenPoints)
        : 0;

    const currentStreak = calculateStreak(progress.dailyCompletions);
    const completedThisWeek = getCompletedThisWeek(progress.dailyCompletions);

    const getCompletionList = (category) => {
        if (category === 'daily') return progress.dailyCompletions?.[todayKey] || [];
        if (category === 'weekly') return progress.weeklyCompletions?.[weekKey] || [];
        if (category === 'festive') return progress.festiveCompletions || [];
        if (category === 'monthly') return progress.monthlyCompletions?.[monthKey] || [];
        return [];
    };

    const isCompleted = (challenge, category) =>
        getCompletionList(category).includes(challenge.id);

    const getStatus = (challenge) => {
        const status = progress.pendingProofs?.[challenge.id]?.status;
        if (status === 'pending') return 'pending';
        if (status === 'rejected') return 'rejected';
        return 'none';
    };

    const startChallenge = (challengeId) => {
        setProgress((previous) => ({
            ...previous,
            startedChallenges: [...new Set([...(previous.startedChallenges || []), challengeId])],
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

        setSelectedFiles((previous) => ({ ...previous, [challengeId]: file }));
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

        setNotice('Proof submitted successfully! It is now waiting for verification.');
    };

    const approveChallengeCompletion = (challengeId) => {
        if (!isDemoModeActive) return;

        const submission = progress.pendingProofs?.[challengeId];

        if (!submission || submission.status !== 'pending') return;

        const challenge = CHALLENGE_CATEGORIES[submission.category]?.find(
            (item) => item.id === challengeId
        );

        if (!challenge) return;

        if (isCompleted(challenge, submission.category)) {
            setNotice('This challenge has already been completed.');
            return;
        }

        const awardedPoints = challenge.points;
        const newTotalPoints = greenPoints + awardedPoints;

        const upcomingPlantStage = PLANT_GROWTH_STAGES.find(
            (stage) => stage.minPoints > greenPoints && stage.minPoints <= newTotalPoints
        );

        setProgress((previous) => {
            const updated = {
                ...previous,
                pendingProofs: { ...previous.pendingProofs },
            };

            if (submission.category === 'daily') {
                updated.dailyCompletions = {
                    ...previous.dailyCompletions,
                    [todayKey]: [...new Set([
                        ...(previous.dailyCompletions?.[todayKey] || []),
                        challengeId,
                    ])],
                };
            } else if (submission.category === 'weekly') {
                updated.weeklyCompletions = {
                    ...previous.weeklyCompletions,
                    [weekKey]: [...new Set([
                        ...(previous.weeklyCompletions?.[weekKey] || []),
                        challengeId,
                    ])],
                };
            } else if (submission.category === 'festive') {
                updated.festiveCompletions = [
                    ...new Set([...(previous.festiveCompletions || []), challengeId]),
                ];
            } else if (submission.category === 'monthly') {
                updated.monthlyCompletions = {
                    ...previous.monthlyCompletions,
                    [monthKey]: [...new Set([
                        ...(previous.monthlyCompletions?.[monthKey] || []),
                        challengeId,
                    ])],
                };
            }

            delete updated.pendingProofs[challengeId];
            return updated;
        });

        setPointsAnimationKey((previous) => previous + 1);

        setCelebration({
            title: upcomingPlantStage ? 'Your Green Plant Has Grown!' : 'Challenge Completed!',
            challengeTitle: submission.challengeTitle,
            points: awardedPoints,
            totalPoints: newTotalPoints,
            plantStage: upcomingPlantStage || null,
        });

        setNotice(`Challenge approved! You earned ${awardedPoints} Green Points.`);
    };

    const rejectChallengeProof = (challengeId) => {
        if (!isDemoModeActive) return;

        const submission = progress.pendingProofs?.[challengeId];
        if (!submission || submission.status !== 'pending') return;

        setProgress((previous) => ({
            ...previous,
            pendingProofs: {
                ...previous.pendingProofs,
                [challengeId]: {
                    ...previous.pendingProofs[challengeId],
                    status: 'rejected',
                    rejectedAt: new Date().toISOString(),
                },
            },
        }));

        setNotice('Proof rejected. You can upload another image and resubmit.');
    };

    const achievements = [
        { id: 'first-step', title: 'First Green Step', description: 'Earn your first 10 Green Points.', icon: Leaf, unlocked: greenPoints >= 10 },
        { id: 'green-explorer', title: 'Green Explorer', description: 'Earn 50 Green Points.', icon: Sparkles, unlocked: greenPoints >= 50 },
        { id: 'consistency-star', title: 'Consistency Star', description: 'Maintain a 3-day activity streak.', icon: Flame, unlocked: currentStreak >= 3 },
        {
            id: 'festive-champion',
            title: 'Green Diwali Guardian',
            description: 'Get all four Green Diwali challenges approved.',
            icon: Trophy,
            unlocked: CHALLENGE_CATEGORIES.festive.every(
                (challenge) => (progress.festiveCompletions || []).includes(challenge.id)
            ),
        },
        {
            id: 'weekly-hero',
            title: 'Weekly Hero',
            description: 'Complete at least three weekly challenges.',
            icon: CalendarDays,
            unlocked: (progress.weeklyCompletions?.[weekKey] || []).length >= 3,
        },
        {
            id: 'monthly-guardian',
            title: 'Monthly Guardian',
            description: 'Complete a monthly challenge.',
            icon: TreePine,
            unlocked: (progress.monthlyCompletions?.[monthKey] || []).length >= 1,
        },
    ];

    // Stage 5: detect newly unlocked achievements.
    useEffect(() => {
        const unlockedNow = achievements.filter((item) => item.unlocked);
        const unlockedIds = unlockedNow.map((item) => item.id);

        // On first render, remember existing achievements without showing old popups.
        if (previousUnlockedAchievements.current === null) {
            previousUnlockedAchievements.current = unlockedIds;
            return;
        }

        const previousIds = previousUnlockedAchievements.current;
        const newlyUnlocked = unlockedNow.filter(
            (item) => !previousIds.includes(item.id)
        );

        previousUnlockedAchievements.current = unlockedIds;

        if (newlyUnlocked.length > 0) {
            // If multiple badges unlock together, celebrate the latest one.
            const latestAchievement = newlyUnlocked[newlyUnlocked.length - 1];

            setAchievementCelebration(latestAchievement);
            setActiveTab('achievements');
        }
    }, [greenPoints, currentStreak, progress.festiveCompletions, progress.weeklyCompletions, progress.monthlyCompletions]);

    const unlockedAchievements = achievements.filter((item) => item.unlocked).length;

    const renderChallengeCard = (challenge, category) => {
        const Icon = challenge.icon;
        const illustration = CHALLENGE_ILLUSTRATIONS[challenge.id];
        const completed = isCompleted(challenge, category);
        const status = getStatus(challenge);
        const started = (progress.startedChallenges || []).includes(challenge.id);
        const selectedFile = selectedFiles[challenge.id];
        const isHighlighted = highlightedChallengeId === challenge.id;

        return (
            <article
                id={`challenge-${challenge.id}`}
                className={`gc-challenge-card ${isHighlighted ? 'gc-highlighted-challenge' : ''}`}
                key={challenge.id}
            >
                <div className="gc-challenge-card-top">
                    <div className={`gc-challenge-icon ${illustration ? `gc-has-illustration gc-illustration-${illustration.theme}` : ''}`}>
                        {illustration ? (
                            <span className="gc-challenge-emoji" role="img" aria-label={illustration.label}>
                                {illustration.emoji}
                            </span>
                        ) : <Icon size={22} />}
                    </div>
                    <span className="gc-challenge-points">+{challenge.points} Points</span>
                </div>

                <div className="gc-challenge-content">
                    <h4>{challenge.title}</h4>
                    <p>{challenge.description}</p>
                </div>

                <div className="gc-challenge-meta">
                    <span>Difficulty: {challenge.difficulty}</span>
                    {completed && <span className="gc-status-completed"><CheckCircle2 size={14} /> Completed</span>}
                    {status === 'pending' && !completed && <span className="gc-status-pending"><Clock size={14} /> Pending</span>}
                    {status === 'rejected' && !completed && <span className="gc-status-rejected"><XCircle size={14} /> Rejected</span>}
                </div>

                {completed ? (
                    <div className="gc-completed-message">
                        <CheckCircle2 size={16} />
                        Challenge Completed · +{challenge.points} Points
                    </div>
                ) : status === 'pending' ? (
                    <div className="gc-pending-area">
                        <div className="gc-pending-message"><Clock size={16} /> Waiting for verification</div>

                        {isDemoModeActive && (
                            <div className="gc-demo-review">
                                <p>Demo testing controls</p>
                                <div className="gc-demo-review-buttons">
                                    <button type="button" className="gc-approve-btn" onClick={() => approveChallengeCompletion(challenge.id)}>
                                        <Check size={15} /> Approve
                                    </button>
                                    <button type="button" className="gc-reject-btn" onClick={() => rejectChallengeProof(challenge.id)}>
                                        <X size={15} /> Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {!started && (
                            <button type="button" className="gc-complete-btn" onClick={() => startChallenge(challenge.id)}>
                                Start Challenge
                            </button>
                        )}

                        {started && (
                            <div className="gc-proof-area">
                                <label className="gc-proof-label">
                                    <Camera size={15} /> Upload photo proof
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => selectProof(challenge.id, event.target.files?.[0])}
                                />

                                {selectedFile && <span className="gc-selected-file">Selected: {selectedFile.name}</span>}

                                {status === 'rejected' && (
                                    <p className="gc-rejected-help">
                                        Your previous proof was rejected. Select another image and resubmit.
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="gc-complete-btn gc-submit-btn"
                                    disabled={!selectedFile}
                                    onClick={() => submitProof(challenge, category)}
                                >
                                    <Upload size={15} /> Submit Proof
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
                <div className="gc-main-heading">
                    <div className="gc-title-row"><Leaf size={25} /><h2>Green Challenges</h2></div>
                    <p>Make small sustainable choices, build greener habits and earn rewards!</p>
                </div>

                <div className="gc-stats-grid">
                    <div className={`gc-stat-card points-card ${pointsAnimationKey ? 'gc-points-celebrating' : ''}`}>
                        <div className="gc-stat-icon points-icon"><Leaf size={25} /></div>
                        <div>
                            <p>Green Points</p>
                            <h3 key={pointsAnimationKey} className={pointsAnimationKey ? 'gc-points-number gc-points-pop' : 'gc-points-number'}>
                                {greenPoints}
                            </h3>
                            <span>Your eco rewards</span>
                        </div>
                    </div>

                    <div className="gc-stat-card streak-card">
                        <div className="gc-stat-icon streak-icon"><Flame size={25} /></div>
                        <div><p>Current Streak</p><h3>{currentStreak}</h3><span>Keep the habit alive</span></div>
                    </div>

                    <div className="gc-stat-card weekly-card">
                        <div className="gc-stat-icon weekly-icon"><CheckCircle2 size={25} /></div>
                        <div><p>Completed This Week</p><h3>{completedThisWeek}</h3><span>Your weekly progress</span></div>
                    </div>

                    <div className="gc-stat-card achievement-card">
                        <div className="gc-stat-icon achievement-icon"><Award size={25} /></div>
                        <div><p>Achievements</p><h3>{unlockedAchievements}/{achievements.length}</h3><span>Badges unlocked</span></div>
                    </div>
                </div>

                <div className={`gc-plant-growth ${celebration?.plantStage ? 'gc-plant-stage-celebration' : ''}`}>
                    <div className="gc-plant-visual">
                        <div className="gc-plant-glow"></div>
                        <span
                            key={plantStageIndex}
                            className={`gc-plant-emoji gc-plant-stage-${plantStageIndex}`}
                            role="img"
                            aria-label={currentPlantStage.name}
                        >
                            {currentPlantStage.emoji}
                        </span>
                        <div className="gc-plant-ground"></div>
                    </div>

                    <div className="gc-plant-details">
                        <span className="gc-plant-eyebrow"><Sparkles size={13} /> YOUR GREEN GROWTH JOURNEY</span>
                        <h3>{currentPlantStage.name}</h3>
                        <p>{currentPlantStage.message}</p>

                        <div className="gc-plant-progress-heading">
                            <span>Growth progress</span>
                            <strong>{greenPoints} Green Points</strong>
                        </div>

                        <div className="gc-plant-progress-track" role="progressbar" aria-label="Progress towards next plant growth stage" aria-valuenow={plantGrowthProgress} aria-valuemin={0} aria-valuemax={100}>
                            <div className="gc-plant-progress-fill" style={{ width: `${plantGrowthProgress}%` }}></div>
                        </div>

                        <span className="gc-plant-next-stage">
                            {nextPlantStage
                                ? `${pointsToNextStage} more points to reach ${nextPlantStage.name}`
                                : 'Maximum growth reached! Keep earning Green Points.'}
                        </span>
                    </div>
                </div>

                <div className="gc-tabs">
                    {TABS.map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button key={tab.id} type="button" className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                                <TabIcon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {notice && (
                    <div className="gc-notice" role="status">
                        <span>{notice}</span>
                        <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message"><XCircle size={17} /></button>
                    </div>
                )}

                {activeTab === 'festive' && (
                    <div className="gc-diwali-banner">
                        <div className="gc-diwali-icon"><Sparkles size={25} /></div>
                        <div>
                            <span className="gc-diwali-eyebrow">Celebrate responsibly</span>
                            <h3>A Greener, Brighter Diwali</h3>
                            <p>Celebrate the festival of lights with thoughtful choices that are kinder to our planet.</p>
                            <span className="gc-diwali-reward">Complete all four missions to unlock Green Diwali Guardian.</span>
                        </div>
                    </div>
                )}

                {activeTab !== 'achievements' && (
                    <div className="gc-category-section">
                        <div className="gc-category-heading">
                            <h3>{TABS.find((tab) => tab.id === activeTab)?.label}</h3>
                            <p>
                                {activeTab === 'daily' && 'Complete simple eco-friendly activities in your everyday life.'}
                                {activeTab === 'weekly' && 'Take on bigger missions and build sustainable habits over seven days.'}
                                {activeTab === 'festive' && 'Make your Diwali celebrations joyful, creative and environmentally friendly.'}
                                {activeTab === 'monthly' && 'Take on meaningful goals and make a lasting environmental impact.'}
                            </p>
                        </div>

                        <div className="gc-challenge-grid">
                            {CHALLENGE_CATEGORIES[activeTab].map((challenge) => renderChallengeCard(challenge, activeTab))}
                        </div>
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="gc-achievements-section">
                        <h3>Your Achievements</h3>
                        <p className="gc-achievements-intro">Unlock badges by completing challenges and maintaining your green habits.</p>

                        <div className="gc-badges-grid">
                            {achievements.map((achievement) => {
                                const Icon = achievement.icon;
                                return (
                                    <div
                                        key={achievement.id}
                                        className={`gc-badge-card ${achievement.unlocked ? 'unlocked' : ''} ${achievementCelebration?.id === achievement.id ? 'gc-badge-newly-unlocked' : ''} ${achievement.id === 'festive-champion' && achievement.unlocked ? 'gc-badge-festive' : ''}`}
                                    >
                                        <div className="gc-badge-icon">
                                            <Icon size={28} />
                                            {achievement.unlocked && <span className="gc-badge-sparkle">✦</span>}
                                        </div>
                                        <div className="gc-badge-status-icon">
                                            {achievement.unlocked ? <CheckCircle2 size={19} /> : <Lock size={18} />}
                                        </div>
                                        <strong>{achievement.title}</strong>
                                        <p>{achievement.description}</p>
                                        <span>{achievement.unlocked ? 'Unlocked!' : 'Not unlocked yet'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {isDemoModeActive && (
                    <div className="gc-demo-note">
                        <strong>Demo testing mode:</strong> Approval controls are enabled only for testing. Do not leave this enabled in the production version.
                    </div>
                )}

                <div className="gc-disclaimer">
                    <strong>How rewards work:</strong> Green Points are awarded when a challenge proof is approved. Submitted proofs are saved locally in this frontend prototype. Actual admin verification and image storage will be connected through the backend.
                </div>
            </div>

            {/* Existing Stage 4 challenge celebration */}
            {celebration && (
                <div
                    className="gc-celebration-overlay"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) setCelebration(null);
                    }}
                >
                    <div className="gc-confetti-container" aria-hidden="true">
                        {Array.from({ length: 48 }, (_, index) => (
                            <span
                                key={index}
                                className="gc-confetti-piece"
                                style={{
                                    left: `${(index * 37) % 100}%`,
                                    animationDelay: `${(index % 10) * 0.1}s`,
                                    animationDuration: `${2.3 + (index % 5) * 0.35}s`,
                                    '--confetti-x': `${((index % 5) - 2) * 35}px`,
                                    '--confetti-color': ['#5aa469', '#f4c95d', '#83c5be', '#f28c8c', '#8dbb72'][index % 5],
                                }}
                            />
                        ))}
                    </div>

                    <div className="gc-celebration-modal" role="dialog" aria-modal="true" aria-labelledby="gc-celebration-title">
                        <button type="button" className="gc-celebration-close" onClick={() => setCelebration(null)} aria-label="Close celebration">
                            <X size={19} />
                        </button>

                        <div className="gc-celebration-icon">
                            {celebration.plantStage ? celebration.plantStage.emoji : '🏆'}
                        </div>

                        <span className="gc-celebration-eyebrow"><Sparkles size={14} /> ANVITI GREEN REWARDS</span>
                        <h2 id="gc-celebration-title">{celebration.title}</h2>

                        <p className="gc-celebration-description">
                            Amazing work! You successfully completed
                            <strong> {celebration.challengeTitle}</strong>.
                        </p>

                        <div className="gc-celebration-points">
                            <Leaf size={22} />
                            <span>+{celebration.points} Green Points</span>
                        </div>

                        <p className="gc-celebration-total">Your new total: {celebration.totalPoints} Green Points</p>

                        {celebration.plantStage && (
                            <div className="gc-plant-unlock-message">
                                <span className="gc-plant-unlock-emoji">{celebration.plantStage.emoji}</span>
                                <div>
                                    <strong>{celebration.plantStage.name}</strong>
                                    <p>{celebration.plantStage.message}</p>
                                </div>
                            </div>
                        )}

                        <p className="gc-celebration-footer">Every small action helps create a greener future!</p>

                        <button type="button" className="gc-celebration-done" onClick={() => setCelebration(null)}>
                            <CheckCircle2 size={17} /> Continue Growing
                        </button>
                    </div>
                </div>
            )}

            {/* Stage 5: achievement unlock celebration */}
            {achievementCelebration && (
                <div
                    className="gc-achievement-overlay"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) setAchievementCelebration(null);
                    }}
                >
                    <div className="gc-achievement-confetti" aria-hidden="true">
                        {Array.from({ length: 42 }, (_, index) => (
                            <span
                                key={index}
                                className="gc-achievement-confetti-piece"
                                style={{
                                    left: `${(index * 41) % 100}%`,
                                    animationDelay: `${(index % 9) * 0.12}s`,
                                    '--achievement-confetti-color': ['#5aa469', '#f4c95d', '#83c5be', '#b6d98c', '#f3a77b'][index % 5],
                                }}
                            />
                        ))}
                    </div>

                    <div
                        className={`gc-achievement-modal ${achievementCelebration.id === 'festive-champion' ? 'gc-achievement-modal-festive' : ''}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="gc-achievement-title"
                    >
                        <button
                            type="button"
                            className="gc-achievement-close"
                            onClick={() => setAchievementCelebration(null)}
                            aria-label="Close achievement celebration"
                        >
                            <X size={19} />
                        </button>

                        <div className="gc-achievement-rays" aria-hidden="true">
                            ✦
                        </div>

                        <div className="gc-achievement-trophy">
                            {achievementCelebration.id === 'festive-champion' ? '🏆' : '🏅'}
                        </div>

                        <span className="gc-achievement-eyebrow">
                            <Sparkles size={14} /> ACHIEVEMENT UNLOCKED
                        </span>

                        <h2 id="gc-achievement-title">
                            {achievementCelebration.title}
                        </h2>

                        <p className="gc-achievement-description">
                            {achievementCelebration.description}
                        </p>

                        {achievementCelebration.id === 'festive-champion' && (
                            <div className="gc-achievement-special-message">
                                <span>🪔</span>
                                <p>
                                    You completed all four Green Diwali missions!
                                    Your celebration is kinder to the planet.
                                </p>
                            </div>
                        )}

                        <div className="gc-achievement-unlocked-label">
                            <CheckCircle2 size={17} />
                            <span>Added to your achievements</span>
                        </div>

                        <button
                            type="button"
                            className="gc-achievement-continue"
                            onClick={() => setAchievementCelebration(null)}
                        >
                            <Trophy size={17} /> Awesome!
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
