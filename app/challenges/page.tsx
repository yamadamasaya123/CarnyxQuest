"use client";

import React, { useState, useEffect } from "react";
import LayoutWrapper from "../../components/ui/LayoutWrapper";
import { useAuth } from "../../hooks/useAuth";
import ChallengeCard from "../../components/gamification/ChallengeCard";
import BadgeCard from "../../components/gamification/BadgeCard";
import { Sparkles, Trophy, ShieldAlert } from "lucide-react";

export default function ChallengesPage() {
  const { user } = useAuth();
  
  const [challenges, setChallenges] = useState<any[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  const loadGamificationData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/gamification?profileId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setChallenges(data.challenges);
        setUnlockedBadges(data.badges);

        // Standard badges list for completeness (renders locked state otherwise)
        const badgesRef = [
          {
            id: "badge_first_meal",
            name: "Marrow Defender i",
            description: "Aquired and logged one secure zero-carb primal prey meal log.",
            iconName: "first_meal_logged",
            rarity: "common"
          },
          {
            id: "badge_streak_3",
            name: "Hearth Tender iii",
            description: "Maintained sirtuin activation checks for 3 days consecutively.",
            iconName: "streak_3",
            rarity: "uncommon"
          },
          {
            id: "badge_streak_7",
            name: "Wilderness Chieftain vii",
            description: "Secured daily survival checks for 7 days consecutively without failure.",
            iconName: "streak_7",
            rarity: "rare"
          },
          {
            id: "badge_first_fast",
            name: "Autophagy Master",
            description: "Finished one complete scheduled fasting protocol session successfully.",
            iconName: "first_fast_completed",
            rarity: "mythic"
          }
        ];
        setAllBadges(badgesRef);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
       loadGamificationData();
    }
  }, [user?.id]);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-amber-500 uppercase tracking-widest animate-pulse">
          Polishing Armor & Trophies...
        </span>
      </div>
    );
  }

  return (
    <LayoutWrapper activeNav="challenges">
      
      {/* TOAST PANEL */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-amber-500/40 text-amber-100 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slideIn max-w-sm">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="text-xs font-mono font-medium leading-relaxed">{notification}</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* SECTION A: QUEST ACTIONS */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            ACTIVE SURVIVAL QUESTS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.length > 0 ? (
              challenges.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c} 
                  onClaimReward={() => triggerToast("Reward claimed! Gold added to reserve chests.")}
                />
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-10 space-y-2 font-mono">
                <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-slate-555 text-xs">No active survival quests found on server records.</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION B: UNLOCKED BADGES */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            UNLOCKED ANCESTRAL HONORS (LEGION BADGES)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allBadges.map((badge) => {
              // Check if unlocked state exists in user's profile
              const match = unlockedBadges.find(ub => 
                ub.badge_id === badge.id || ub.badgeId === badge.id || ub.badge?.icon_name === badge.iconName
              );

              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  unlockedAt={match ? match.unlocked_at || match.unlockedAt || new Date().toISOString() : undefined}
                />
              );
            })}
          </div>
        </div>

      </div>

    </LayoutWrapper>
  );
}
export { ChallengesPage };
