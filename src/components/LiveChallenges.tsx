import React, { useState, useEffect } from "react";
import { db, CHALLENGE_ID_MAP, CHALLENGE_ID_MAP_REV } from "../lib/db";
import { Trophy, Compass, CheckCircle2, Flame, Shield, Target, Lock, Crown, Info } from "lucide-react";

interface LiveChallengesProps {
  profileId: string;
  userLevel?: number;
  onEnrollSuccess?: () => void;
}

export default function LiveChallenges({ profileId, userLevel = 1, onEnrollSuccess }: LiveChallengesProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [dbChallenges, setDbChallenges] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [enrollingMap, setEnrollingMap] = useState<{[key: string]: boolean}>({});

  const fetchChallengesAndBadges = async () => {
    console.log(`[DEBUG] LiveChallenges - Fetching challenges & badges for profile: ${profileId}`);
    try {
      const liveChallenges = await db.getUserChallenges(profileId);
      setEnrollments(liveChallenges);

      const fetchedDbChallenges = await db.getAvailableChallenges();
      setDbChallenges(fetchedDbChallenges);

      const liveBadges = await db.getUserBadges(profileId);
      console.log(`[DEBUG] LiveChallenges - Loaded unlocked badges count: ${liveBadges.length}`, liveBadges);
      setBadges(liveBadges);
      setAllBadges(db.getAllTrophies());

      const txs = await db.getTransactions(profileId);
      setTransactions(txs);
    } catch (err) {
      console.error(`[DEBUG] LiveChallenges - Error fetching data:`, err);
    }
  };

  useEffect(() => {
    fetchChallengesAndBadges();

    const handleRefresh = () => {
      fetchChallengesAndBadges();
    };

    window.addEventListener("fasting_history_updated", handleRefresh);
    window.addEventListener("checkins_updated", handleRefresh);
    window.addEventListener("meals_updated", handleRefresh);
    window.addEventListener("weight_updated", handleRefresh);
    window.addEventListener("badge_unlocked", handleRefresh);

    return () => {
      window.removeEventListener("fasting_history_updated", handleRefresh);
      window.removeEventListener("checkins_updated", handleRefresh);
      window.removeEventListener("meals_updated", handleRefresh);
      window.removeEventListener("weight_updated", handleRefresh);
      window.removeEventListener("badge_unlocked", handleRefresh);
    };
  }, [profileId, userLevel]);

  const getMinLevel = (ch: any) => {
    if (ch.minimum_level !== undefined && ch.minimum_level !== null) return Number(ch.minimum_level);
    if (ch.min_level !== undefined && ch.min_level !== null) return Number(ch.min_level);
    if (ch.unlock_level !== undefined && ch.unlock_level !== null) return Number(ch.unlock_level);
    if (ch.level !== undefined && ch.level !== null) return Number(ch.level);

    // fallbacks based on original database mappings / seeds
    const standardId = CHALLENGE_ID_MAP_REV[ch.id] || ch.id;
    if (standardId === "c1") return 1;
    if (standardId === "c2") return 2;
    if (standardId === "c3") return 2;

    const titleLower = (ch.title || "").toLowerCase();
    if (titleLower.includes("mammoth") || titleLower.includes("starter") || titleLower.includes("beginner")) {
      return 1;
    }
    return 2;
  };

  const mapDbChallenge = (ch: any) => {
    return {
      id: ch.id,
      title: ch.title || "Active Dietary Objectives",
      description: ch.description || "Maintain proper fuel log constraints.",
      durationDays: ch.duration_days ?? ch.durationDays ?? 5,
      rewardXp: ch.reward_xp ?? ch.rewardXp ?? 100,
      minimumLevel: ch.minimum_level ?? ch.minimumLevel ?? 1,
      challengeKind: ch.challenge_kind ?? ch.challengeKind,
      targetValue: ch.target_value ?? ch.targetValue,
      unitLabel: ch.unit_label ?? ch.unitLabel,
      shieldRewardPercent: ch.shield_reward_percent ?? ch.shieldRewardPercent ?? 25,
    };
  };

  const handleEmbark = async (challengeId: string) => {
    setEnrollingMap((prev) => ({ ...prev, [challengeId]: true }));
    try {
      await db.enrollInChallenge(profileId, challengeId);
      if (onEnrollSuccess) {
        onEnrollSuccess();
      }
      await fetchChallengesAndBadges();
    } catch (err) {
      console.error("[DEBUG] Error enrolling in challenge:", err);
    } finally {
      setEnrollingMap((prev) => ({ ...prev, [challengeId]: false }));
    }
  };

  const mappedUserChallenges = enrollments.map(({ challenge, userEnrollment }) => {
    const dbCh = dbChallenges.find(
      (c) => c.id === userEnrollment.challengeId || CHALLENGE_ID_MAP[challenge.id] === c.id
    );
    return {
      challenge: dbCh ? mapDbChallenge(dbCh) : challenge,
      userEnrollment,
    };
  });

  const unenrolledDbChallenges = dbChallenges.filter((dbc) => {
    return !enrollments.some(
      (e) => e.userEnrollment.challengeId === dbc.id || CHALLENGE_ID_MAP[e.challenge.id] === dbc.id
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ACTIVE CHALLENGES */}
      <div className="lg:col-span-12 xl:col-span-7 bg-slate-950 text-slate-100 rounded-2xl p-5 md:p-6 border border-amber-950/40 relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
          <Target className="w-5 h-5 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-amber-400">
            Active Tribal Expeditions (Challenges)
          </h3>
        </div>

        {mappedUserChallenges.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 bg-slate-900/10 border border-slate-900/40 rounded-xl p-4">
            {userLevel < 2 ? (
              "No active quests. Reach level 2 to unlock advanced raids."
            ) : (
              "Choose an available quest to begin your expedition."
            )}
          </div>
        ) : (
          <div className="space-y-4">
             {mappedUserChallenges.map(({ challenge, userEnrollment }) => {
              const isCompleted = userEnrollment.status === "completed" || userEnrollment.status === "COMPLETED";
              const targetVal = challenge.targetValue || challenge.durationDays || 5;
              const progressPct = Math.min(100, Math.round((userEnrollment.progress / targetVal) * 100));

              return (
                <div
                  key={userEnrollment.id}
                  className={`p-4 bg-slate-900/30 border rounded-xl relative overflow-hidden space-y-3 transition-colors ${
                    isCompleted
                      ? "border-emerald-500/20 bg-emerald-950/5 text-emerald-100"
                      : "border-slate-850 hover:border-amber-500/10"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 text-left">
                      <span className="font-extrabold text-sm block tracking-wide">{challenge.title}</span>
                      <p className="text-xs text-slate-400 leading-relaxed">{challenge.description}</p>
                    </div>

                    <span className={`text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                    }`}>
                      {isCompleted ? "CLAIMED" : "ACTIVE QUEST"}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-left">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Expedition Progress</span>
                      <span>
                        {userEnrollment.progress} / {targetVal} {challenge.unitLabel || "Days / Action"}
                      </span>
                    </div>
                    {/* Tiny Progress bar */}
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div
                        style={{ width: `${progressPct}%` }}
                        className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${
                          isCompleted ? "from-emerald-600 to-teal-500" : "from-amber-600 to-orange-500"
                        }`}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[10px] font-mono">
                    <div className="flex gap-2">
                      <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold">
                        💎 +{challenge.rewardXp} XP (Unlocks at level {getMinLevel({ id: userEnrollment.challengeId, title: challenge.title })})
                      </span>
                      <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-400">
                        🛡️ {challenge.shieldRewardPercent ?? 25}% shielding
                      </span>
                    </div>

                    {isCompleted && (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Bonus Paid out
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WILDERNESS & NEW ADVANCED RAID SELECTION */}
        <div className="flex items-center gap-2 border-b border-slate-900 pb-3 pt-4">
          <Compass className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: "15s" }} />
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-amber-400">
            Available Wilderness Expeditions
          </h3>
        </div>

        {userLevel < 2 && (
          <div className="bg-slate-900/40 border border-slate-850/70 rounded-xl p-5 text-center relative overflow-hidden">
            <div className="mx-auto w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-850 text-slate-500 mb-2.5">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider font-mono">Advanced Expeditions Locked</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Reach <span className="text-amber-450 font-bold">Level 2</span> to automatically unlock the advanced Deep Autophagy Quest and consistency expeditions!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {unenrolledDbChallenges
            .filter((rawCh) => getMinLevel(rawCh) <= userLevel)
            .map((rawCh) => {
              const ch = mapDbChallenge(rawCh);
              const minLevel = getMinLevel(rawCh);
              const isLocked = userLevel < minLevel;

              const isEmbarking = !!enrollingMap[rawCh.id];

            return (
              <div
                key={ch.id}
                className={`p-4 rounded-xl border relative transition-all duration-300 ${
                  isLocked
                    ? "bg-slate-950/30 border-slate-900/60 opacity-60 select-none"
                    : "bg-slate-900/20 border-slate-850 hover:border-amber-500/20 hover:bg-slate-900/40"
                }`}
              >
                {/* Level badge */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 font-mono text-[9px] font-bold">
                  {isLocked ? (
                    <span className="bg-slate-950 text-slate-500 px-2 py-0.5 rounded border border-slate-850 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Required Lvl {minLevel}
                    </span>
                  ) : (
                    <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                      Lvl {minLevel} Quest
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1 pr-24 text-left">
                    <h4 className="text-xs font-extrabold tracking-wide text-amber-200 uppercase font-sans">
                      {ch.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{ch.description}</p>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-900/60">
                    <div className="flex gap-2 text-[10px] font-mono text-slate-400">
                      <span>⌛ duration: <span className="text-slate-200 font-bold">{ch.durationDays} days</span></span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">💎 +{ch.rewardXp} XP</span>
                      <span>•</span>
                      <span className="text-amber-500 font-bold flex items-center gap-1">🛡️ +{ch.shieldRewardPercent ?? 25}% Shield</span>
                    </div>

                    {!isLocked && (
                      <button
                        onClick={() => handleEmbark(rawCh.id)}
                        disabled={isEmbarking}
                        className="py-1 px-3 text-[10px] font-bold tracking-wider uppercase font-mono rounded bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 active:scale-95 duration-100 disabled:opacity-50"
                      >
                        {isEmbarking ? "Embarking..." : "Embark"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {userLevel >= 2 && unenrolledDbChallenges.filter(ch => getMinLevel(ch) <= userLevel).length === 0 && (
            <div className="text-center py-4 text-xs text-slate-500 italic">
              ⚔️ All discovered campaigns for your level have been active or completed.
            </div>
          )}
        </div>
      </div>

      {/* REWARDS & BADGES COMPANION */}
      <div className="lg:col-span-12 xl:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
          <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
          <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase">
            Hunter's Armory & Trophies
          </h4>
        </div>

        <p className="text-[10px] sm:text-[11px] text-slate-450 leading-relaxed">
          Unlock trophies through pure physical and fasting consistency. <span className="text-amber-400/90 font-semibold">Tapping a badge</span> reveals full unlocked details, criteria requirements, and XP logs.
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {allBadges.map((badge) => {
            const unlocked = badges.some((ub) => ub.id === badge.id);

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-3 sm:p-4 rounded-xl border-2 text-center flex flex-col items-center justify-between space-y-2 group relative overflow-hidden transition-all duration-300 w-full min-h-[145px] sm:min-h-[175px] cursor-pointer hover:border-amber-500/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] active:scale-95 duration-200 ${
                  unlocked
                    ? "bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-slate-900 border-amber-500 text-slate-100 shadow-[0_0_12px_rgba(245,158,11,0.25)] opacity-100 grayscale-0 filter-none"
                    : "bg-slate-950/40 border-slate-900/80 text-slate-400 grayscale opacity-80 hover:opacity-100"
                }`}
              >
                {!unlocked && (
                  <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 bg-slate-950 rounded-full p-0.5 border border-slate-800">
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                  </div>
                )}
                {unlocked && (
                  <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 bg-amber-400 rounded-full p-0.5 border border-amber-200 shadow-md animate-bounce" style={{ animationDuration: '3s' }}>
                    <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                )}

                <div className="relative">
                  <div className={`p-2 sm:p-2.5 rounded-full inline-block transition-transform duration-500 ${
                    unlocked ? "bg-amber-400 text-slate-950 scale-105 shadow-md shadow-amber-500/20" : "bg-slate-950 text-slate-500"
                  }`}>
                    {badge.id === "b_starter" ? (
                      <Flame className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${unlocked ? "fill-current text-red-600 animate-pulse" : "text-slate-500"}`} />
                    ) : badge.id === "b_first_checkin" ? (
                      <Target className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${unlocked ? "text-amber-600 animate-pulse" : "text-slate-500"}`} />
                    ) : badge.id === "b_streak_3" ? (
                      <Shield className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${unlocked ? "fill-current text-amber-550" : "text-slate-500"}`} />
                    ) : badge.id === "b_streak_7" ? (
                      <Crown className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${unlocked ? "fill-current text-amber-550" : "text-slate-500"}`} />
                    ) : badge.id === "b_fast_pioneer" ? (
                      <Compass className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${unlocked ? "text-amber-550 animate-spin" : "text-slate-500"}`} style={{ animationDuration: '10s' }} />
                    ) : badge.id === "b_level_5" ? (
                      <Trophy className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${unlocked ? "fill-current text-yellow-600" : "text-slate-500"}`} />
                    ) : (
                      <Trophy className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${unlocked ? "text-amber-500" : "text-slate-500"}`} />
                    )}
                  </div>
                </div>

                <div className="space-y-1 w-full">
                  <span className={`text-[11px] sm:text-[12px] font-extrabold block leading-tight ${unlocked ? "text-amber-300 tracking-wide font-sans drop-shadow-sm" : "text-slate-200"}`}>
                    {badge.name}
                  </span>
                  <p className={`text-[9px] sm:text-[9.5px] leading-snug line-clamp-2 ${unlocked ? "text-slate-200 font-semibold" : "text-slate-400 font-normal"}`}>
                    {badge.description}
                  </p>
                </div>

                <div className="pt-0.5 font-mono text-[8px] sm:text-[9px]">
                  <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-extrabold border transition-colors ${
                    unlocked 
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm" 
                      : "bg-slate-900 border-slate-800 text-slate-300"
                  }`}>
                    {unlocked ? "✓ UNLOCKED • " : ""}+{badge.rewardXp} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED BADGE DETAIL MODAL OVERLAY */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm transition-opacity duration-300" 
          id="badge-detail-modal"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-sm p-5 sm:p-6 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.25)] text-left space-y-5 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full pointer-events-none"></div>
            
            {/* Close Button */}
            <button 
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-100 transition-colors p-1.5 rounded-full hover:bg-slate-800"
              onClick={() => setSelectedBadge(null)}
              id="close-badge-modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Badge Badge/Header */}
            <div className="flex items-center gap-3.5">
              <div className={`p-3.5 rounded-full ${
                badges.some(b => b.id === selectedBadge.id)
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/40"
                  : "bg-slate-950 text-slate-500 border border-slate-800"
              }`}>
                {selectedBadge.id === "b_starter" ? (
                  <Flame className="w-7 h-7 fill-current" />
                ) : selectedBadge.id === "b_first_checkin" ? (
                  <Target className="w-7 h-7" />
                ) : selectedBadge.id === "b_streak_3" ? (
                  <Shield className="w-7 h-7 fill-current" />
                ) : selectedBadge.id === "b_streak_7" ? (
                  <Crown className="w-7 h-7 fill-current" />
                ) : selectedBadge.id === "b_fast_pioneer" ? (
                  <Compass className="w-7 h-7 animate-spin" style={{ animationDuration: '10s' }} />
                ) : selectedBadge.id === "b_level_5" ? (
                  <Trophy className="w-7 h-7 fill-current" />
                ) : (
                  <Trophy className="w-7 h-7" />
                )}
              </div>

              <div>
                <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold block ${
                  badges.some(b => b.id === selectedBadge.id) ? "text-amber-400 animate-pulse" : "text-slate-500"
                }`}>
                  {badges.some(b => b.id === selectedBadge.id) ? "🏺 Unlocked Trophy" : "🔒 Locked In Armory"}
                </span>
                <h3 className="text-lg font-black text-slate-100 tracking-wide font-sans">{selectedBadge.name}</h3>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-800/80 pt-4 text-xs">
              {/* Description without truncation */}
              <div className="space-y-1 bg-slate-950/30 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] uppercase font-mono text-slate-500 tracking-widest block">Trophy Legend</span>
                <p className="text-slate-200 leading-relaxed font-semibold transition-colors">
                  {selectedBadge.description}
                </p>
              </div>

              {/* Reward */}
              <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-mono text-slate-500 tracking-widest block">Tribal Reward</span>
                  <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                    💎 +{selectedBadge.rewardXp} XP Points
                  </span>
                </div>
                
                {/* Status indicator style */}
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono text-slate-500 tracking-widest block">Primal Status</span>
                  <span className={`text-[11px] font-black uppercase ${
                    badges.some(b => b.id === selectedBadge.id) ? "text-emerald-400" : "text-slate-400"
                  }`}>
                    {badges.some(b => b.id === selectedBadge.id) ? "Earmarked ✓" : "Undiscovered"}
                  </span>
                </div>
              </div>

              {/* Extra real-world proof: unlock date if available */}
              {badges.some(b => b.id === selectedBadge.id) && (
                <div className="text-[10px] text-slate-400 font-mono bg-slate-950/30 p-2.5 rounded-lg border border-slate-900/60 flex items-center justify-between">
                  <span>🗓️ Unlocked epoch date:</span>
                  <span className="text-amber-300 font-bold">
                    {(() => {
                      const tx = transactions.find(t => t.source === `Unlocked Trophy: ${selectedBadge.name}`);
                      return tx ? new Date(tx.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "Recently Earned";
                    })()}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 px-4 rounded-xl font-bold tracking-wider text-[10px] uppercase bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all text-center border border-slate-700/50"
                id="dismiss-badge-modal"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
