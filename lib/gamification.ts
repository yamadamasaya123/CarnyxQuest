import { getSupabase, isSupabaseConfigured } from "./supabase";
import { Badge, Challenge, UserChallenge } from "../types/gamification";
import { UserProfile } from "../types/user";
import { db, addXpToProfile } from "../src/lib/db";

// Calculate required XP for a level (Level * 100 + (Level - 1) * 150)
export function getRequiredXpForLevel(level: number): number {
  return level * 100 + (level - 1) * 150;
}

export async function addXp(profileId: string, amount: number, reason: string): Promise<{ success: boolean; leveledUp: boolean; newXp: number; newLevel: number; earnedPoints: number }> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      
      // Get current profile
      const { data: profile, error: fetchErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();
        
      if (fetchErr || !profile) throw new Error("Profile not found");

      let currentXp = profile.xp + amount;
      let currentLevel = profile.level;
      let leveledUp = false;
      let goldenPointsEarned = 0;

      while (true) {
        const xpNeeded = getRequiredXpForLevel(currentLevel);
        if (currentXp >= xpNeeded) {
          currentXp -= xpNeeded;
          currentLevel += 1;
          leveledUp = true;
          goldenPointsEarned += 25; // level up bonus points
        } else {
          break;
        }
      }

      const totalGoldenPoints = profile.golden_points + goldenPointsEarned;

      // Update in database
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          xp: currentXp,
          level: currentLevel,
          golden_points: totalGoldenPoints,
          updated_at: new Date().toISOString()
        })
        .eq("id", profileId);

      if (updateErr) throw updateErr;

      // Log XP transaction
      await supabase
        .from("xp_transactions")
        .insert({
          profile_id: profileId,
          amount,
          reason
        });

      // Check level-5 badge automatically if they reached level 5
      if (currentLevel >= 5) {
        await unlockBadge(profileId, "b_level_5");
      }

      return {
        success: true,
        leveledUp,
        newXp: currentXp,
        newLevel: currentLevel,
        earnedPoints: goldenPointsEarned
      };
    } catch (err) {
      console.error("Failed to add XP in Supabase:", err);
      return { success: false, leveledUp: false, newXp: 0, newLevel: 1, earnedPoints: 0 };
    }
  } else {
    // Local fallback
    const res = db.getActiveUserAndProfile();
    if (res.profile && res.profile.id === profileId) {
      const p = res.profile as any;
      const originalLevel = p.level;
      const oldPoints = p.goldPoints || p.goldenPoints || 100;
      
      const updateResult = addXpToProfile(res.profile, amount, reason);
      const levelDiff = updateResult.profile.level - originalLevel;
      const bonusGained = (updateResult.profile as any).goldPoints - oldPoints;
      
      return {
        success: true,
        leveledUp: levelDiff > 0,
        newXp: updateResult.profile.experience,
        newLevel: updateResult.profile.level,
        earnedPoints: bonusGained
      };
    }
    return { success: false, leveledUp: false, newXp: 0, newLevel: 1, earnedPoints: 0 };
  }
}

export async function unlockBadge(profileId: string, badgeId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      
      // Check if already unlocked
      const { data: existing } = await supabase
        .from("user_badges")
        .select("*")
        .eq("profile_id", profileId)
        .eq("badge_id", badgeId)
        .maybeSingle();

      if (existing) return false;

      // Insert new unlock record
      const { error } = await supabase
        .from("user_badges")
        .insert({
          profile_id: profileId,
          badge_id: badgeId
        });

      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  } else {
    // Local fallback
    // Badge awarding is automatically handled in local storage triggers
    return true;
  }
}

export async function fetchChallenges(profileId: string): Promise<UserChallenge[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      
      // Fetch all system challenges
      const { data: challenges, error: chalErr } = await supabase
        .from("challenges")
        .select("*");
        
      if (chalErr || !challenges) return [];

      // Fetch user challenges
      const { data: userChalls, error: userChallErr } = await supabase
        .from("user_challenges")
        .select("*")
        .eq("profile_id", profileId);

      if (userChallErr) return [];

      // Link them together
      return challenges.map(c => {
        const uc = userChalls?.find(item => item.challenge_id === c.id);
        const challengeObj: Challenge = {
          id: c.id,
          title: c.title,
          description: c.description,
          type: c.type,
          xpReward: c.xp_reward,
          goldenPointsReward: c.golden_points_reward,
          targetMetric: c.target_metric,
          targetValue: c.target_value
        };

        return {
          id: uc?.id || `temp-${c.id}`,
          profileId,
          challengeId: c.id,
          currentProgress: uc?.current_progress || 0,
          status: uc?.status || "active",
          startedAt: uc?.started_at || new Date().toISOString(),
          completedAt: uc?.completed_at,
          challenge: challengeObj
        };
      });
    } catch {
      return [];
    }
  } else {
    // Local fallback
    const lcs = db.getUserChallenges(profileId);
    return lcs.map(item => {
      const l = item.userEnrollment as any;
      const originalChal = item.challenge;
      const challengeObj: Challenge = {
        id: originalChal?.id || "",
        title: originalChal?.title || "",
        description: originalChal?.description || "",
        type: "nutrition",
        xpReward: originalChal?.rewardXp || 100,
        goldenPointsReward: 15,
        targetMetric: "meals",
        targetValue: originalChal?.durationDays || 3
      };
      
      return {
        id: l.id,
        profileId: l.profileId,
        challengeId: l.challengeId,
        currentProgress: l.progress || 0,
        status: l.status as any,
        startedAt: l.joinedAt,
        completedAt: undefined,
        challenge: challengeObj
      };
    });
  }
}

export async function advanceChallengeProgress(profileId: string, targetMetric: string, increment: number): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      const currentChallenges = await fetchChallenges(profileId);
      
      for (const uc of currentChallenges) {
        if (uc.status === "active" && uc.challenge?.targetMetric === targetMetric) {
          const nextProgress = uc.currentProgress + increment;
          const limit = uc.challenge.targetValue;
          const completed = nextProgress >= limit;
          
          if (uc.id.startsWith("temp-")) {
            // First time inserting user challenge record
            await supabase
              .from("user_challenges")
              .insert({
                profile_id: profileId,
                challenge_id: uc.challengeId,
                current_progress: nextProgress > limit ? limit : nextProgress,
                status: completed ? "completed" : "active",
                completed_at: completed ? new Date().toISOString() : undefined
              });
          } else {
            // Updating active record
            await supabase
              .from("user_challenges")
              .update({
                current_progress: nextProgress > limit ? limit : nextProgress,
                status: completed ? "completed" : "active",
                completed_at: completed ? new Date().toISOString() : undefined
              })
              .eq("id", uc.id);
          }

          if (completed) {
            // Award XP & Points!
            await addXp(profileId, uc.challenge.xpReward, `Completed challenge: ${uc.challenge.title}`);
          }
        }
      }
    } catch (e) {
      console.error("Error advancing challenge in Supabase:", e);
    }
  } else {
    // Local fallback - challenge progress is incremented inside existing save methods
  }
}
