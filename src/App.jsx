
/* ==============================================================================
   Anviti — Main Application Entry & Routing
   Manages public landing experience for visitors, seamless authentication,
   and authenticated/demo carbon intelligence workflows.
   ============================================================================== */

import { useState, useEffect, useCallback } from 'react';

import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import InfoModal from './components/InfoModal';
import ChatAssistant from './components/ChatAssistant';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ActivityInput from './pages/ActivityInput';

import RecommendationsSection from './components/RecommendationsSection';
import WhatIfSimulator from './components/WhatIfSimulator';
import HistorySection from './components/HistorySection';

import { fetchFootprintRecords } from './lib/recordsService';
import {
  subscribeToAuthChanges,
  getCurrentUser
} from './lib/authService';

import { findHotspot } from './lib/hotspot';

import { Leaf } from 'lucide-react';

import './App.css';

export default function App() {

  const [activeTab, setActiveTab] = useState('landing');

  const [user, setUser] = useState(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [authInitialMode, setAuthInitialMode] = useState('signin');

  const [infoModalType, setInfoModalType] = useState(null);

  const [records, setRecords] = useState([]);

  const [isDemoMode, setIsDemoMode] = useState(true);

  const [currentResult, setCurrentResult] = useState(null);

  const [loading, setLoading] = useState(true);

  // Stores the challenge selected from AI Recommendations
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);


  // =========================================
  // LOAD RECORDS
  // =========================================

  const loadRecords = useCallback(async () => {

    try {

      const {
        records: fetchedRecords,
        isDemo
      } = await fetchFootprintRecords();

      setRecords(fetchedRecords || []);

      setIsDemoMode(isDemo);

      // Reconstruct latest result for dashboard

      if (fetchedRecords && fetchedRecords.length > 0) {

        const latest = fetchedRecords[0];

        setCurrentResult({

          breakdown: {
            transport: latest.transport_co2e,
            electricity: latest.electricity_co2e,
            food: latest.food_co2e,
            consumption: latest.consumption_co2e,
          },

          total: latest.total_co2e,

          meta: {

            input: latest.raw_input || {

              transport: {
                mode: latest.transport_mode,
                km: latest.transport_km
              },

              electricity: {
                kwh: latest.electricity_kwh
              },

              food: {
                diet: latest.diet_type
              },

              consumption: {
                activity: latest.shopping_activity
              },

            },

            factorsUsed: latest.factors_used || {},

          },

        });

      }

    } catch (err) {

      console.error('Error loading records:', err);

    } finally {

      setLoading(false);

    }

  }, []);


  // =========================================
  // AUTHENTICATION AND INITIAL LOAD
  // =========================================

  useEffect(() => {

    getCurrentUser().then((currentUser) => {

      setUser(currentUser);

      if (currentUser) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('landing');
      }

      loadRecords();

    });

    const { unsubscribe } = subscribeToAuthChanges((newUser) => {

      setUser(newUser);

      if (newUser) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('landing');
      }

      loadRecords();

    });

    return () => unsubscribe();

  }, [loadRecords]);


  // =========================================
  // AUTH MODAL
  // =========================================

  const handleOpenAuth = (mode = 'signin') => {

    setAuthInitialMode(mode);

    setIsAuthModalOpen(true);

  };


  // =========================================
  // SIGN OUT
  // =========================================

  const handleSignOut = () => {

    setUser(null);

    setActiveTab('landing');

    setSelectedChallengeId(null);

    loadRecords();

  };


  // =========================================
  // CALCULATION COMPLETE
  // =========================================

  const handleCalculationComplete = (result, record) => {

    setCurrentResult(result);

    setRecords((prev) => [record, ...prev]);

    setIsDemoMode(false);

    setActiveTab('dashboard');

  };


  // =========================================
  // SELECT PAST RECORD
  // =========================================

  const handleSelectRecord = (record) => {

    setCurrentResult({

      breakdown: {
        transport: record.transport_co2e,
        electricity: record.electricity_co2e,
        food: record.food_co2e,
        consumption: record.consumption_co2e,
      },

      total: record.total_co2e,

      meta: {

        input: record.raw_input || {

          transport: {
            mode: record.transport_mode,
            km: record.transport_km
          },

          electricity: {
            kwh: record.electricity_kwh
          },

          food: {
            diet: record.diet_type
          },

          consumption: {
            activity: record.shopping_activity
          },

        },

        factorsUsed: record.factors_used || {},

      },

    });

    setActiveTab('dashboard');

  };


  // =========================================
  // START CHALLENGE FROM RECOMMENDATIONS
  // =========================================

  const handleStartChallenge = (challengeId) => {

    setSelectedChallengeId(challengeId);

    setActiveTab('dashboard');

  };


  // =========================================
  // IDENTIFY EMISSION HOTSPOT
  // =========================================

  const hotspot = currentResult
    ? findHotspot(currentResult.breakdown)
    : null;


  // =========================================
  // MAIN APPLICATION UI
  // =========================================

  return (

    <div className="app-shell">

      {/* Top Navigation */}

      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onOpenAuthModal={handleOpenAuth}
        isDemoMode={isDemoMode}
        onSignOut={handleSignOut}
      />


      {/* Main Content Area */}

      <main
        className={`app-main-content ${activeTab === 'landing' ? 'landing-mode' : ''
          }`}
      >

        {loading ? (

          <div className="loading-state-wrapper">

            <div className="loading-spinner"></div>

            <span>
              Loading environmental records...
            </span>

          </div>

        ) : (

          <>

            {/* 1. Public Landing Page */}

            {activeTab === 'landing' && !user && (

              <LandingPage

                onGetStarted={(mode) =>
                  handleOpenAuth(mode || 'signup')
                }

                onExploreDemo={() =>
                  setActiveTab('dashboard')
                }

                onOpenInfoModal={(type) =>
                  setInfoModalType(type)
                }

              />

            )}


            {/* 2. Carbon Footprint Dashboard */}

            {activeTab === 'dashboard' && (

              <Dashboard

                result={currentResult}

                isDemo={isDemoMode}

                user={user}

                selectedChallengeId={selectedChallengeId}

                onNavigateToCalculator={() =>
                  setActiveTab('calculator')
                }

                onNavigateToSimulator={() =>
                  setActiveTab('simulator')
                }

                onNavigateToRecommendations={() =>
                  setActiveTab('recommendations')
                }

                onNavigateToHistory={() =>
                  setActiveTab('history')
                }

              />

            )}


            {/* 3. Carbon Calculator */}

            {activeTab === 'calculator' && (

              <ActivityInput

                onCalculationComplete={
                  handleCalculationComplete
                }

              />

            )}


            {/* 4. Personalized Action Plan */}

            {activeTab === 'recommendations' && (

              <RecommendationsSection

                hotspot={hotspot}

                breakdown={currentResult?.breakdown}

                rawInput={currentResult?.meta?.input}

                onSimulateAction={() =>
                  setActiveTab('simulator')
                }

                onStartChallenge={handleStartChallenge}

              />

            )}


            {/* 5. What-If Simulator */}

            {activeTab === 'simulator' && (

              <WhatIfSimulator

                baselineResult={currentResult}

              />

            )}


            {/* 6. History and Trends */}

            {activeTab === 'history' && (

              <HistorySection

                records={records}

                isDemo={isDemoMode}

                onSelectRecord={handleSelectRecord}

                onRefreshRecords={loadRecords}

                onNavigateToCalculator={() =>
                  setActiveTab('calculator')
                }

              />

            )}

          </>

        )}

      </main>


      {/* Footer */}

      {activeTab !== 'landing' && (

        <footer className="app-footer">

          <div className="footer-container">

            <div className="footer-left">

              <div className="footer-logo">

                <Leaf size={16} />

                <span>Anviti</span>

              </div>

              <p className="footer-tagline">

                Carbon Footprint Monitoring: From Carbon
                Calculation to Carbon Intelligence.

              </p>

            </div>


            <div className="footer-right">

              <button

                type="button"

                className="footer-mini-link"

                onClick={() => setInfoModalType('about')}

              >
                About
              </button>

              <span className="dot-sep">•</span>


              <button

                type="button"

                className="footer-mini-link"

                onClick={() => setInfoModalType('privacy')}

              >
                Privacy
              </button>

              <span className="dot-sep">•</span>


              <button

                type="button"

                className="footer-mini-link"

                onClick={() => setInfoModalType('contact')}

              >
                Contact
              </button>

            </div>

          </div>

        </footer>

      )}


      {/* Authentication Dialog */}

      {isAuthModalOpen && (

        <AuthModal

          key={`${isAuthModalOpen}-${authInitialMode}`}

          isOpen={isAuthModalOpen}

          onClose={() => setIsAuthModalOpen(false)}

          initialMode={authInitialMode}

          user={user}

        />

      )}


      {/* Project Information Dialog */}

      <InfoModal

        type={infoModalType}

        isOpen={Boolean(infoModalType)}

        onClose={() => setInfoModalType(null)}

      />


      {/* Floating AI Sustainability Assistant */}

      <ChatAssistant

        user={user}

        currentResult={currentResult}

        records={records}

        onNavigateTab={setActiveTab}

      />

    </div>

  );

}
