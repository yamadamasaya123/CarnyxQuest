"use client";

import React, { useState, useEffect } from "react";
import LayoutWrapper from "../../components/ui/LayoutWrapper";
import ProfileCard from "../../components/dashboard/ProfileCard";
import XPBar from "../../components/dashboard/XPBar";
import LevelDisplay from "../../components/dashboard/LevelDisplay";
import StreakCard from "../../components/dashboard/StreakCard";
import QuickActions from "../../components/dashboard/QuickActions";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useFasting } from "../../hooks/useFasting";
import { fetchUserMeals } from "../../lib/nutrition";
import { MealLog } from "../../types/meals";
import { formatDuration } from "../../utils/formatters";
import { Flame, Trophy, Clock, Sparkles, Activity, PlusSquare } from "lucide-react";

export default function DashboardPage() {
  const { user, profile: authProfile } = useAuth();
  
  const { profile, streak, loading: profileLoading, refreshProfile } = useProfile(user?.id);
  const { activeSession, elapsedSeconds, startFast, endFast } = useFasting(user?.id);
  
  const [latestMeal, setLatestMeal] = useState<MealLog | null>(null);
  const [mealsLoading, setMealsLoading] = useState<boolean>(true);
  
  // Daily checkin modal controls
  const [isCheckinOpen, setIsCheckinOpen] = useState<boolean>(false);
  const [isCheckinCompleted, setIsCheckinCompleted] = useState<boolean>(false);
  const [mood, setMood] = useState<string>("VIGORATING");
  const [waterMl, setWaterMl] = useState<number>(2500);

  // Growth / Congrats levels up
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch meals on startup to find the latest
  const loadLatestMeal = async () => {
    if (!user?.id) return;
    setMealsLoading(true);
    try {
      const items = await fetchUserMeals(user.id);
      if (items.length > 0) {
        setLatestMeal(items[0]);
      } else {
        setLatestMeal(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMealsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadLatestMeal();
    }
  }, [user?.id]);

  // Handle Covenant Submit
  const handleCovenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: user.id, mood, waterMl })
      });
      const data = await response.json();
      if (data.success) {
        setIsCheckinCompleted(true);
        setIsCheckinOpen(false);
        refreshProfile();
        triggerToast("Daily Covenant Secured! +20 XP awarded.");
      }
    } catch {
      triggerToast("Connection failed.");
    }
  };

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Quick preset shortcuts callbacks
  const triggerQuickMeal = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: user.id,
          name: "Skinside Ribeye Steak",
          weightG: 300,
          isCarnivore: true,
          nutrition: { calories: 873, protein: 72, fat: 65, carbs: 0, source: "USDA Standard" }
        })
      });
      const data = await response.json();
      if (data.success) {
        refreshProfile();
        loadLatestMeal();
        triggerToast("Prey Logged! Ribeye Steak Slab added. +30 XP gained.");
      }
    } catch {
      triggerToast("Failed to write meal.");
    }
  };

  const toggleFastShortcut = () => {
    // Navigates or sets OMAD active instantly
    if (activeSession) {
      endFast(true);
      refreshProfile();
      triggerToast("Metabolic cycle finalized! Added to historical ledger.");
    } else {
      startFast("OMAD", 24);
      refreshProfile();
      triggerToast("OMAD 24-Hour metabolic purge commenced!");
    }
  };

  const activeProf = profile || authProfile;

  if (profileLoading || !activeProf) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-amber-500 uppercase tracking-widest animate-pulse">
          Building Command Dashboard...
        </span>
      </div>
    );
  }

  return (
    <LayoutWrapper activeNav="dashboard">
      
      {/* LOCAL ALERTS */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-amber-500/40 text-amber-100 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slideIn max-w-sm">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="text-xs font-mono font-medium leading-relaxed">{notification}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Row 1: Profile Display and Status */}
        <ProfileCard profile={activeProf} />

        {/* Row 2: Levels Progress Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <XPBar xp={activeProf.xp} level={activeProf.level} />
          </div>
          <div>
            <LevelDisplay level={activeProf.level} />
          </div>
        </div>

        {/* Row 3: Streak Tracker & Quick Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <StreakCard 
              currentStreak={streak?.current || 1} 
              longestStreak={streak?.longest || 1} 
            />
          </div>
          <div className="lg:col-span-2">
            <QuickActions
              onCheckIn={() => setIsCheckinOpen(true)}
              onQuickMealLog={triggerQuickMeal}
              onFastingShortcut={toggleFastShortcut}
              onUpdateWeightLog={() => triggerToast("Navigating to Physical Metrics page to update metrics...")}
              isCheckInCompleted={isCheckinCompleted}
            />
          </div>
        </div>

        {/* Row 4: Complex dashboard details grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Box A: Fasting parameters preview */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              METABOLIC PURGE OVERVIEW
            </h3>

            {activeSession ? (
              <div className="space-y-3 p-3 bg-amber-600/5 border border-amber-500/10 rounded-xl">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-amber-500 font-bold uppercase">{activeSession.protocolName} ACTIVE</span>
                  <span className="text-slate-400 font-bold">{formatDuration(elapsedSeconds)}</span>
                </div>
                <ProgressBar percentage={Math.min(100, (elapsedSeconds / 3600 / activeSession.targetDurationHours) * 100)} />
                <p className="text-[10px] text-slate-500 font-sans">
                  Lysosomal cellular clean-up in progress. Your sirtuin activation index is ascending in background.
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-[11px] text-slate-500 font-mono">NO ACTIVE AUTOPHAGY CLOCKS TRACKED</p>
                <button
                  type="button"
                  onClick={toggleFastShortcut}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono hover:bg-slate-900 hover:text-white cursor-pointer"
                >
                  Trigger 24H Fasting
                </button>
              </div>
            )}
          </div>

          {/* Box B: Latest meal preview */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-4 font-mono text-xs">
            <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-2">
              <PlusSquare className="w-4 h-4 text-emerald-500" />
              LATEST FOOD LOG ACQUISITION
            </h3>

            {mealsLoading ? (
              <div className="text-center py-6 text-[10px] text-slate-600">Syncing logs...</div>
            ) : latestMeal ? (
              <div className="space-y-2.5 p-3.5 bg-slate-900/40 border border-slate-850 rounded-xl">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-200 truncate pr-2">{latestMeal.name}</span>
                  <span className="text-[10px] text-amber-500 shrink-0">{latestMeal.weightG}g portion</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                  <div className="bg-slate-950 p-1.5 rounded">
                    <div className="text-slate-555">P</div>
                    <div className="font-bold text-emerald-400">{latestMeal.proteinG}g</div>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded">
                    <div className="text-slate-555">F</div>
                    <div className="font-bold text-amber-500">{latestMeal.fatG}g</div>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded">
                    <div className="text-slate-555">C</div>
                    <div className="font-bold text-slate-500">{latestMeal.carbsG}g</div>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded">
                    <div className="text-slate-555">KCAL</div>
                    <div className="font-bold text-slate-200">{latestMeal.calories}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-[11px] text-slate-500">NO ACQUIRED MEALS RECORDED TODAY</p>
                <button
                  type="button"
                  onClick={triggerQuickMeal}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 hover:bg-slate-900 hover:text-white cursor-pointer"
                >
                  Quick Log Ribeye preset
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* COVENANT DAILY CHECK-IN DIALOG */}
      <Modal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        title="SECURE SURVIVAL COVENANT (DAILY MINDFULNESS CHECK)"
      >
        <form onSubmit={handleCovenantSubmit} className="space-y-4 font-mono text-xs text-slate-300">
          <p className="font-sans leading-relaxed text-[11px] text-slate-400">
            Committing your metrics daily keeps the lines connected, updates the tribe record, and awards a direct +20 experience points multiplier.
          </p>

          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 font-bold tracking-wider block uppercase">
              Current Vigor Index (Mood)
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200"
            >
              <option value="VIGORATING">VIGORATING — Deep sleep restored skeletal cell energy</option>
              <option value="BATTLING">BATTLING — Autophagy active but hunger challenges active</option>
              <option value="RECOVERING">RECOVERING — Muscle reconstruction focus active</option>
              <option value="SPIRITUAL">SPIRITUAL — Mental clarity peaked on high ketones</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 font-bold tracking-wider block uppercase">
              Hydration checkpoints (Water Ml Intake Today)
            </label>
            <input
              type="number"
              value={waterMl}
              onChange={(e) => setWaterMl(parseInt(e.target.value) || 2000)}
              placeholder="e.g. 2500"
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsCheckinOpen(false)}>
              Discard
            </Button>
            <Button type="submit" variant="amber">
              Seal Covenant
            </Button>
          </div>
        </form>
      </Modal>

    </LayoutWrapper>
  );
}
export { DashboardPage };
