import React, { useState, useEffect } from "react";

// Active Full-Stack Gamified Modules
import LiveAuth from "./components/LiveAuth";
import LiveDashboard from "./components/LiveDashboard";
import LiveMeals from "./components/LiveMeals";
import LiveFasting from "./components/LiveFasting";
import LiveProgress from "./components/LiveProgress";
import LiveChallenges from "./components/LiveChallenges";
import LiveWorkouts from "./components/LiveWorkouts";
import { db } from "./lib/db";
import { UserProfile } from "./types";

import {
  User,
  Flame,
  LogOut,
  Trophy,
  Activity,
  Award,
  Zap,
  Dumbbell,
  Clock,
  Sparkles,
  Shield,
} from "lucide-react";

export default function App() {
  // Live App Sub-Session Navigation
  const [activeLiveNav, setActiveLiveNav] = useState<
    "dashboard" | "meals" | "fasting" | "progress" | "challenges" | "workouts"
  >("dashboard");

  // Global Auth Session
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Success Notification & Level Up signals
  const [notification, setNotification] = useState<string | null>(null);
  const [levelUpCongrats, setLevelUpCongrats] = useState<boolean>(false);
  const [rewardXpToast, setRewardXpToast] = useState<number | null>(null);

  // Trigger state to reload components in background
  const [metricsRefresh, setMetricsRefresh] = useState<number>(0);

  // Load existing user session
  useEffect(() => {
    const bootSession = async () => {
      const session = await db.getActiveUserAndProfile();
      if (session.user && session.profile) {
        setUser(session.user);
        setProfile(session.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    };
    bootSession();
  }, []);

  const syncActiveUser = async () => {
    const session = await db.getActiveUserAndProfile();
    setUser(session.user);
    setProfile(session.profile);
    setMetricsRefresh((p) => p + 1);
  };

  const triggerLogOut = async () => {
    await db.logout();
    setUser(null);
    setProfile(null);
  };

  // Helper Toast trigger
  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Callback when user earns XP to handle level-ups instantly & trigger celebrations!
  const handleXpPayout = (xp: number, levelUpOccurred: boolean) => {
    setRewardXpToast(xp);
    setTimeout(() => setRewardXpToast(null), 2000);
    
    if (levelUpOccurred) {
      setLevelUpCongrats(true);
      triggerToast("SACRED ASCENT! You leveled up and earned additional Golden Points!");
    } else {
      triggerToast(`Secured +${xp} experience coordinates.`);
    }
    syncActiveUser();
    
    // Dispatch events to instantly sync all dashboard & quest/trophy badges
    window.dispatchEvent(new Event("fasting_history_updated"));
    window.dispatchEvent(new Event("checkins_updated"));
    window.dispatchEvent(new Event("meals_updated"));
    window.dispatchEvent(new Event("weight_updated"));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-600 selection:text-white font-sans leading-normal relative overflow-hidden">
      
      {/* GLOBAL BACKGROUND GLOWS AND ATMOSPHERICS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-600/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* TOP NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-amber-500/40 text-amber-100 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slideIn max-w-sm">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="text-xs font-mono font-medium leading-relaxed">{notification}</span>
        </div>
      )}

      {/* CONGRATS LEVEL UP OVERLAY MODAL */}
      {levelUpCongrats && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-red-500"></div>
            <Award className="w-16 h-16 text-amber-500 mx-auto animate-bounce mt-4" />
            <h3 className="text-xl font-black font-mono text-amber-400 uppercase tracking-widest">
              SACRED LEVEL UP!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "Your metabolic channels are fortified. Your cells hum with increased autophagy velocity."
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              You upgraded your class status, unlocking +25 Golden Points.
            </p>
            <button
              onClick={() => setLevelUpCongrats(false)}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold py-2.5 rounded-xl text-xs cursor-pointer tracking-wider"
            >
              ACKNOWLEDGE COVENANT
            </button>
          </div>
        </div>
      )}

      {/* REWARD FLOATING TRANSITION TOAST */}
      {rewardXpToast && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black font-mono px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-1.5 text-xs tracking-widest animate-pulse">
          <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>+{rewardXpToast} XP SUCCESS!</span>
        </div>
      )}

      {/* CORE APPLICATION HEADER MASTHEAD */}
      <header className="py-6 border-b border-slate-900 bg-slate-950/60 relative overflow-hidden shadow-lg">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded border border-amber-500/15">
                CarnyxQuest
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
              Carnyx<span className="text-amber-500 font-light">Quest</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl font-sans">
              Track your progress, complete challenges, and stay consistent on your carnivore journey.
            </p>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT CANVAS CONTAINER */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        <div className="space-y-6">
          {!user ? (
            <LiveAuth onAuthSuccess={syncActiveUser} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* SIDE NAVIGATION PANEL FOR THE GAME */}
              <aside className="lg:col-span-1 space-y-4">
                <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 shadow-xl space-y-4">
                  {/* User Mini Profile */}
                  {profile && (
                    <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl text-center space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-xl rounded-full"></div>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 mx-auto border border-amber-500/20 flex items-center justify-center font-bold text-xs">
                        {profile.level}
                      </div>
                      <h4 className="font-extrabold text-sm tracking-wide truncate">{profile.displayName}</h4>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono px-2 py-0.5 rounded uppercase font-bold border border-amber-500/10">
                        {profile.primalClass}
                      </span>
                    </div>
                  )}

                  <nav className="space-y-1">
                    {/* Nav 1: Dashboard */}
                    <button
                      onClick={() => setActiveLiveNav("dashboard")}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer ${
                        activeLiveNav === "dashboard"
                          ? "bg-amber-600 text-white font-bold"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <Flame className="w-4 h-4 shrink-0" />
                      <span>Command Board</span>
                    </button>

                    {/* Nav 2: Eating logger */}
                    <button
                      onClick={() => setActiveLiveNav("meals")}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer ${
                        activeLiveNav === "meals"
                          ? "bg-amber-600 text-white font-bold"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <User className="w-4 h-4 shrink-0" />
                      <span>Prey Meal Logs</span>
                    </button>

                    {/* Nav 3: Biological Fasting */}
                    <button
                      onClick={() => setActiveLiveNav("fasting")}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer ${
                        activeLiveNav === "fasting"
                          ? "bg-amber-600 text-white font-bold"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Autophagy Clock</span>
                    </button>

                    {/* Nav 4: Physical progress */}
                    <button
                      onClick={() => setActiveLiveNav("progress")}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer ${
                        activeLiveNav === "progress"
                          ? "bg-amber-600 text-white font-bold"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <Activity className="w-4 h-4 shrink-0" />
                      <span>Physical Metrics</span>
                    </button>

                    {/* Nav 4.5: Metabolic Workouts */}
                    <button
                      onClick={() => setActiveLiveNav("workouts")}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer ${
                        activeLiveNav === "workouts"
                          ? "bg-amber-600 text-white font-bold"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <Dumbbell className="w-4 h-4 shrink-0" />
                      <span>Metabolic Workouts</span>
                    </button>

                    {/* Nav 5: Challenges */}
                    <button
                      onClick={() => setActiveLiveNav("challenges")}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer ${
                        activeLiveNav === "challenges"
                          ? "bg-amber-600 text-white font-bold"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <Trophy className="w-4 h-4 shrink-0" />
                      <span>Quests & Trophies</span>
                    </button>

                    {/* Nav 6: Log Out */}
                    <button
                      onClick={triggerLogOut}
                      className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl text-red-400 hover:bg-red-950/20 transition-all text-left cursor-pointer mt-4"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Log Out</span>
                    </button>
                  </nav>
                </div>
              </aside>

              {/* GAME ACTIVE PANEL VIEWPORT */}
              <section className="lg:col-span-3 space-y-6">
                {activeLiveNav === "dashboard" && (
                  <LiveDashboard
                    profileId={user.id}
                    onRefreshMetricsTrigger={metricsRefresh}
                    onSuccessNotification={triggerToast}
                    onCheckInSuccess={handleXpPayout}
                  />
                )}
                {activeLiveNav === "meals" && (
                  <LiveMeals
                    profileId={user.id}
                    onLoggedSuccess={handleXpPayout}
                    onSuccessNotification={triggerToast}
                  />
                )}
                {activeLiveNav === "fasting" && (
                  <LiveFasting
                    profileId={user.id}
                    onFastingComplete={handleXpPayout}
                  />
                )}
                {activeLiveNav === "progress" && (
                  <LiveProgress profileId={user.id} />
                )}
                {activeLiveNav === "challenges" && (
                  <LiveChallenges 
                    profileId={user.id} 
                    userLevel={profile?.level || 1}
                    onEnrollSuccess={syncActiveUser}
                  />
                )}
                {activeLiveNav === "workouts" && (
                  <LiveWorkouts
                    profileId={user.id}
                    onWorkoutLogged={handleXpPayout}
                  />
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      {/* RE-POLISHED FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500 mt-16">
        <div className="w-full max-w-7xl mx-auto px-4">
          <p className="font-mono text-[11px] text-slate-400 font-semibold">
            CarnyxQuest © 2026. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
