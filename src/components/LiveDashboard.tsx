import React, { useState, useEffect } from "react";
import { db, getRequiredXpForLevel } from "../lib/db";
import { UserProfile, Streak, DailyCheckIn, XpTransaction, PrimalClass, ShieldLog } from "../types";
import {
  Flame,
  Shield,
  Compass,
  Coins,
  ChevronRight,
  Sparkles,
  Zap,
  CalendarCheck,
  Award,
  CircleCheck,
  ShoppingBag,
  Swords,
  Timer,
  Info,
  Loader2,
} from "lucide-react";

interface LiveDashboardProps {
  profileId: string;
  onRefreshMetricsTrigger: number;
  onSuccessNotification: (message: string) => void;
  onCheckInSuccess: (xpEarned: number, leveledUp: boolean) => void;
}

export default function LiveDashboard({
  profileId,
  onRefreshMetricsTrigger,
  onSuccessNotification,
  onCheckInSuccess,
}: LiveDashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckIn[]>([]);
  const [transactions, setTransactions] = useState<XpTransaction[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [shieldLogs, setShieldLogs] = useState<ShieldLog[]>([]);

  // Check-in input notes
  const [checkInNotes, setCheckInNotes] = useState<string>("");
  const [shopLoading, setShopLoading] = useState<boolean>(false);
  const [showGpModal, setShowGpModal] = useState<boolean>(false);
  const [checkInLoading, setCheckInLoading] = useState<boolean>(false);

  const loadData = async () => {
    const prof = await db.getProfile(profileId);
    if (prof) {
      setProfile(prof);
      const str = await db.getStreak(profileId);
      setStreak(str);
      const ci = await db.getCheckIns(profileId);
      setCheckins(ci);
      const tx = await db.getTransactions(profileId);
      setTransactions(tx);
      const ml = await db.getMeals(profileId);
      setMeals(ml.slice(0, 3)); // show top 3 latest
      const logs = await db.getShieldLogs(profileId);
      setShieldLogs(logs);
    }
  };

  useEffect(() => {
    loadData();

    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener("fasting_history_updated", handleRefresh);
    window.addEventListener("meals_updated", handleRefresh);
    window.addEventListener("checkins_updated", handleRefresh);
    window.addEventListener("weight_updated", handleRefresh);
    window.addEventListener("shields_updated", handleRefresh);

    return () => {
      window.removeEventListener("fasting_history_updated", handleRefresh);
      window.removeEventListener("meals_updated", handleRefresh);
      window.removeEventListener("checkins_updated", handleRefresh);
      window.removeEventListener("weight_updated", handleRefresh);
      window.removeEventListener("shields_updated", handleRefresh);
    };
  }, [profileId, onRefreshMetricsTrigger]);

  if (!profile || !streak) {
    return (
      <div className="py-20 text-center text-slate-400">
        Prone position detected. Establishing profile connection...
      </div>
    );
  }

  // Calculate XP ratio
  const reqXp = getRequiredXpForLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.experience / reqXp) * 100));

  // Determine if checked in today
  const todayStr = new Date().toISOString().split("T")[0];
  const isCheckedInToday = checkins.some((c) => c.checkInDate === todayStr);

  // Buy a Marrow protective shield
  const handlePurchaseShield = async () => {
    setShopLoading(true);
    try {
      const res = await db.buyShield(profileId);
      if (res.success) {
        onSuccessNotification("Purchased 1 Marrow Protector Shield! Your streak is insulated from breaks.");
        await loadData();
      } else {
        alert(res.error || "Failed to finalize golden bargain.");
      }
    } catch (err: any) {
      alert("Store transaction faulted: " + err.message);
    } finally {
      setShopLoading(false);
    }
  };

  // Perform daily review check-in
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkInLoading) return;
    setCheckInLoading(true);
    try {
      const res = await db.completeDailyCheckIn(profileId, checkInNotes);
      if (res.error) {
        alert(res.error);
      } else {
        onCheckInSuccess(res.xpEarned, res.leveledUp);
        
        if (res.shieldActivated) {
          onSuccessNotification("Marrow Shield activated. Daily streak preserved.");
        } else {
          onSuccessNotification("Daily check-in ritual completed successfully! Current streak incremented.");
        }

        setCheckInNotes("");
        window.dispatchEvent(new Event("checkins_updated"));
        await loadData();
      }
    } catch (err: any) {
      alert("Checkin coordination issue: " + err.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  // Find the latest check-in note
  const latestCheckInWithNote = [...checkins]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .find((c) => c.notes && c.notes.trim() !== "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT HAND PANEL: CHARACTER SHEET & CORE STATS */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* CHARACTER STAT CARD WITH METADATA */}
        <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 border border-amber-900/40 relative overflow-hidden">
          {/* Visual gradient backdrop */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-amber-500/30 flex flex-col items-center justify-center text-center p-1 relative shadow-inner">
                {profile.primalClass === PrimalClass.Slayer && <Swords className="w-7 h-7 text-red-500" />}
                {profile.primalClass === PrimalClass.Chieftain && <Shield className="w-7 h-7 text-amber-500" />}
                {profile.primalClass === PrimalClass.Reaver && <Compass className="w-7 h-7 text-orange-500" />}
                <span className="text-[10px] font-mono leading-none mt-1 font-bold">
                  {profile.primalClass}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                    {profile.displayName}
                  </h3>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded">
                    CLASS: {profile.primalClass.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Vanguard of the meat-communion cohort. Tracking biomarkers live.
                </p>
              </div>
            </div>

            {/* CURRENCY & SHOP INVENTORY */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowGpModal(true)}
                className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-850 hover:border-amber-500/40 hover:bg-slate-850 transition cursor-pointer flex items-center gap-2.5 text-left active:scale-[0.98]"
                title="View Gold Points (GP) information"
              >
                <Coins className="w-4 h-4 text-amber-500 animate-pulse" />
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block leading-none uppercase tracking-wide">Invent Gold</span>
                  <span className="text-sm font-black font-mono text-amber-300 leading-none block mt-1 flex items-center gap-1">
                    {profile.goldPoints} GP <span className="text-[9px] text-slate-500 font-normal opacity-70">(Info)</span>
                  </span>
                </div>
              </button>

              {/* Buy Shield (costs 80g) */}
              <button
                onClick={handlePurchaseShield}
                disabled={shopLoading || profile.goldPoints < 80}
                className="bg-amber-950/40 border border-amber-500/30 hover:border-amber-500 text-amber-400 font-mono font-extrabold text-[10px] uppercase p-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                title="Purchase Marrow Shield protection for 80 Golden Points"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                <span>Shield (80 GP)</span>
              </button>
            </div>
          </div>

          {/* XP PROGRESS METER */}
          <div className="mt-8 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 block font-bold">
                Level {profile.level} Pathfinder
              </span>
              <span className="text-slate-500 block">
                {profile.experience} / {reqXp} XP ({xpPercent}%)
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${xpPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 transition-all duration-300 shadow-md shadow-amber-500/10"
              ></div>
            </div>
          </div>
        </div>

        {/* DAILY REVIEW CHECK-IN FORM */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 relative">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h4 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-500" />
              Sacred Daily Check-In Ritual
            </h4>

            {isCheckedInToday && (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <CircleCheck className="w-3 h-3" />
                <span>COMPLETED</span>
              </span>
            )}
          </div>

          {isCheckedInToday ? (
            <div className="p-4 bg-emerald-950/10 border border-emerald-500/10 rounded-xl space-y-2 text-xs">
              <p className="text-slate-300 font-semibold">Communion Secured for Yawning Twilight!</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Your biological data, streak preservation parameters, and macronutrient targets have been coordinated. Continue logging meats or activate the autophagy timer to maximize pathfinder gains.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <p className="text-[11px] text-slate-500">
                Seal your day's biometric consistency to secure checking points and insulate your streaks. Entering notes awards custom Path progression.
              </p>
              <div>
                <input
                  type="text"
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="e.g. Broken OMAD with Ribeye, mental clarity incredibly high today."
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-amber-500 focus:ring-0"
                />
              </div>
              <button
                type="submit"
                disabled={checkInLoading}
                className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:border-slate-800 text-white font-extrabold font-mono uppercase tracking-wider text-xs py-2.5 px-6 rounded-xl cursor-pointer transition flex items-center gap-1.5 border border-amber-500/20 shadow-md disabled:opacity-55 disabled:pointer-events-none"
              >
                {checkInLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>TRANSMITTING TRIBAL RECORD...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-100" />
                    <span>Complete Check-In (+10 XP)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* LATEST COMMUNION NOTE */}
        {latestCheckInWithNote && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-amber-900/15 space-y-2.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/2.5 blur-3xl pointer-events-none"></div>
            <h4 className="text-[11px] font-extrabold font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Latest Hunter Note
            </h4>
            <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-850/60">
              <p className="text-slate-305 text-xs italic leading-relaxed">
                "{latestCheckInWithNote.notes}"
              </p>
              <div className="mt-2 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                <span>Date: {latestCheckInWithNote.checkInDate}</span>
                <span>Ritual Secured</span>
              </div>
            </div>
          </div>
        )}

        {/* LATEST MEAL JOURNAL INSIGHTS */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
            <h4 className="text-[11px] font-extrabold font-mono tracking-widest text-slate-400 uppercase">
              Patriarchal Pantry (Latest 3 Meals Logged)
            </h4>
          </div>

          {meals.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-600 font-mono italic">
              Your journal is void of registered meats. Log dinners in the Meat Log console.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {meals.map((m) => (
                <div key={m.id} className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-xs text-amber-200 truncate pr-2">{m.cutType}</span>
                    {m.isCarbZero && (
                      <span className="inline-flex items-center justify-center text-center bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                        ZERO CARBS
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
                    <span>{m.weightGrams}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT HAND SIDEBAR: STREAKS, PROTECTION, TRANSACTION RECORDS */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* BIOMETRIC STREAK PANEL */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-amber-900/20 relative space-y-4">
          <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2.5">
            Primal Streak Telemetry
          </h4>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
              <div className="text-2xl font-black font-mono text-amber-500 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>{streak.currentStreak}</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold block mt-1">
                Active Streak
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
              <div className="text-2xl font-black font-mono text-slate-300">
                {streak.longestStreak}
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold block mt-1">
                Longest Streak
              </span>
            </div>
          </div>

          {/* Marrow Shields inventory feedback */}
          <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5 leading-none">
                <Shield className="w-4 h-4 text-amber-500" />
                Marrow Shield Protectors:
              </span>
              <span className="text-amber-400 font-black">
                {streak.marrowShieldsActive} Active
              </span>
            </div>

            {/* Shield Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500">Shield Progress:</span>
                <span className="text-amber-500 font-bold">{streak.shieldProgressPercent ?? 0}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, streak.shieldProgressPercent ?? 0))}%` }}
                />
              </div>
            </div>

            {/* Description explaining shields */}
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              Marrow shields protect your streak from carb slippage and missed daily check-ins.
            </p>
          </div>
        </div>

        {/* SHIELD CHRONICLE (SHIELD LOG) */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-3.5">
          <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-500 animate-pulse" />
            Recent Shield Activity
          </h4>

          {shieldLogs.length === 0 ? (
            <p className="text-[10px] text-slate-600 font-mono italic text-center py-6">
              No shield activity recorded yet. Complete challenges or purchase protectors.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {shieldLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-900/45 pb-1.5 last:border-0 last:pb-0 font-mono">
                  <span className={`font-bold break-words leading-tight ${log.shieldChange > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {log.shieldChange > 0 ? `+${log.shieldChange}` : log.shieldChange} Shield — {log.reason}
                  </span>
                  <span className="text-[9px] text-slate-600 sm:shrink-0">
                    {new Date(log.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT HISTORIC EXPERIENCES (xp_transactions) */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-3.5">
          <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Pathfinder Chronicles (XP Log)
          </h4>

          {transactions.length === 0 ? (
            <p className="text-[10px] text-slate-600 font-mono italic text-center py-6">
              Pathfinder index empty. Ignite checking or fasting registers.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="text-[11px] flex justify-between items-start gap-2 font-mono">
                  <div className="space-y-0.5">
                    <span className="text-slate-300 block">{t.source}</span>
                    <span className="text-[9px] text-slate-500 block">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <span className="text-amber-500 font-bold shrink-0">
                    +{t.xpAmount} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GOLD POINTS INFORMATION MODAL */}
      {showGpModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <Coins className="w-12 h-12 text-amber-500 mx-auto animate-bounce mt-2" />
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-mono text-amber-300 uppercase tracking-widest">
                Gold Points (GP)
              </h3>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                Progression Currency & Streak Protection
              </p>
            </div>

            <div className="text-left space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-850/60 font-sans text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto">
              <div>
                <p className="font-bold text-amber-400 mb-1 font-mono uppercase tracking-wider text-[10px]">
                  GP is earned through:
                </p>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>Leveling Up</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>Completing Challenges</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>Unlocking Achievements</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>Major Progression Milestones</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-slate-900 pt-2.5">
                <p className="font-bold text-amber-400 mb-1 font-mono uppercase tracking-wider text-[10px]">
                  GP can be spent on:
                </p>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>Marrow Shield Protectors</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>Future Progression Rewards</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-slate-900 pt-2.5">
                <p className="font-bold text-amber-400 mb-1 font-mono uppercase tracking-wider text-[10px]">
                  Marrow Shield Cost:
                </p>
                <p className="text-slate-400 text-[11px] font-mono font-semibold">
                  80 GP per Shield
                </p>
              </div>

              <div className="border-t border-slate-900 pt-2.5">
                <p className="font-bold text-amber-400 mb-1 font-mono uppercase tracking-wider text-[10px]">
                  Marrow Shields protect streaks from:
                </p>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>Carb Slippage</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>Missed Daily Check-ins</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowGpModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono font-bold py-2.5 rounded-xl text-xs cursor-pointer tracking-wider border border-slate-700 transition"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
