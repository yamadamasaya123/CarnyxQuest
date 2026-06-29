import { supabase } from "./supabase";
import {
  UserProfile,
  PrimalClass,
  MealLog,
  Streak,
  DailyCheckIn,
  Challenge,
  UserChallenge,
  Badge,
  UserBadge,
  ProgressRecord,
  XpTransaction,
  FastingProtocol,
  FastingSession,
  FastingMilestone,
  ChallengeStatus,
  KetoRatio,
  WorkoutLog,
  ShieldLog,
} from "../types";

// Seed/Static configurations in code
export const DEFAULT_PROTOCOLS: FastingProtocol[] = [
  {
    id: "b301c380-60f3-4d44-be1f-f1f4b8cf6b41",
    name: "16:8",
    targetHours: 16,
    description: "Beginner fasting protocol with 16 hours fasting period and 8 hours eating window.",
  },
  {
    id: "b301c380-60f3-4d44-be1f-f1f4b8cf6b42",
    name: "18:6",
    targetHours: 18,
    description: "Advanced Window protocol, boosting cellular cleansing, ketosis activation, and fat burn.",
  },
  {
    id: "b301c380-60f3-4d44-be1f-f1f4b8cf6b43",
    name: "OMAD",
    targetHours: 24,
    description: "One Meal A Day. Ultra high efficiency protocol for deep cognitive focus and metabolic flexibility.",
  },
  {
    id: "b301c380-60f3-4d44-be1f-f1f4b8cf6b44",
    name: "24H",
    targetHours: 24,
    description: "Full daily gut reset on spring water or premium bone broth.",
  },
  {
    id: "b301c380-60f3-4d44-be1f-f1f4b8cf6b45",
    name: "36H",
    targetHours: 36,
    description: "Extended Hunter Fast for structural autophagy, cellular clean up, and immune cell regeneration.",
  },
];

export const DEFAULT_MILESTONES: FastingMilestone[] = [
  // 16:8
  { id: "m1", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b41", milestoneHour: 4, rewardXp: 15, label: "Fat Adaptation Started" },
  { id: "m2", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b41", milestoneHour: 8, rewardXp: 25, label: "Halfway Ascent" },
  { id: "m3", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b41", milestoneHour: 12, rewardXp: 35, label: "Deep Lipid Phase" },
  { id: "m4", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b41", milestoneHour: 16, rewardXp: 50, label: "Fast Completed" },
  // 18:6
  { id: "m5", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b42", milestoneHour: 6, rewardXp: 20, label: "Blood Glucose Drop" },
  { id: "m6", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b42", milestoneHour: 12, rewardXp: 35, label: "Ketosis Active" },
  { id: "m7", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b42", milestoneHour: 18, rewardXp: 60, label: "Growth Hormone Peak" },
  // OMAD
  { id: "m8", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b43", milestoneHour: 6, rewardXp: 20, label: "Glycogen Depleted" },
  { id: "m9", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b43", milestoneHour: 12, rewardXp: 40, label: "Deep Ketosis" },
  { id: "m10", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b43", milestoneHour: 18, rewardXp: 60, label: "Autophagy Surge" },
  { id: "m11", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b43", milestoneHour: 24, rewardXp: 100, label: "Stem Cell Influx" },
  // 24H
  { id: "m12", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b44", milestoneHour: 6, rewardXp: 20, label: "Liver Depletion" },
  { id: "m13", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b44", milestoneHour: 12, rewardXp: 40, label: "Fat-Burn Mode" },
  { id: "m14", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b44", milestoneHour: 18, rewardXp: 60, label: "Autophagy Shock" },
  { id: "m15", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b44", milestoneHour: 24, rewardXp: 100, label: "Intestinal Reset" },
  // 36H
  { id: "m16", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b45", milestoneHour: 12, rewardXp: 40, label: "Full Depletion" },
  { id: "m17", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b45", milestoneHour: 24, rewardXp: 80, label: "Autophagy Peak" },
  { id: "m18", protocolId: "b301c380-60f3-4d44-be1f-f1f4b8cf6b45", milestoneHour: 36, rewardXp: 150, label: "Inflammation Cleanse" },
];

export const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "The Mammoth Raid",
    description: "Successfully log your meals for 5 unique days to lock down the primal herd's meat stores.",
    durationDays: 5,
    rewardXp: 200,
  },
  {
    id: "c2",
    title: "Deep Autophagy Quest",
    description: "Complete a full 18-hour (or longer) fasting session to unlock standard cellular recycling.",
    durationDays: 1,
    rewardXp: 300,
  },
  {
    id: "c3",
    title: "Ancestral Consistency",
    description: "Maintain a 3-day daily review check-in streak to coordinate the tribal defensive lines.",
    durationDays: 3,
    rewardXp: 150,
  },
];

export const DEFAULT_BADGES: Badge[] = [
  {
    id: "b_starter",
    name: "First Hunt Tribute",
    description: "Log your very first 100% pure carb-zero meal log.",
    requirement: "first_zero_carb_meal",
    rewardXp: 50,
  },
  {
    id: "b_first_checkin",
    name: "Primal Check-In",
    description: "Log your very first daily primal check-in.",
    requirement: "first_checkin",
    rewardXp: 50,
  },
  {
    id: "b_streak_3",
    name: "Marrow Defender III",
    description: "Reach a consecutive 3-day primal eating check-in streak.",
    requirement: "streak_3",
    rewardXp: 100,
  },
  {
    id: "b_streak_7",
    name: "Carnivore Consistency",
    description: "Reach a consecutive 7-day primal eating check-in streak.",
    requirement: "streak_7",
    rewardXp: 200,
  },
  {
    id: "b_fast_pioneer",
    name: "Autophagy Initiate",
    description: "Complete a scheduled metabolic custom fasting protocol.",
    requirement: "first_fast_completion",
    rewardXp: 100,
  },
  {
    id: "b_level_5",
    name: "Apex Predator",
    description: "Reach level 5 through pure dietary and metabolic discipline.",
    requirement: "level_5",
    rewardXp: 250,
  },
  {
    id: "b_first_workout",
    name: "Commence Your First Workout",
    description: "Successfully log your first active routine on the carnyx quest.",
    requirement: "first_workout",
    rewardXp: 120,
  },
];

// Helper to determine XP needed for level (e.g. lvl 1->2 needs 100 XP, level 2->3 needs 250 XP, etc.)
export function getRequiredXpForLevel(level: number): number {
  return level * 100 + (level - 1) * 150;
}

// Early Level XP Boost Helpers
export function isXpBoostActive(profile: { level: number } | null | undefined): boolean {
  if (!profile) return false;
  return profile.level < 5;
}

export function calculateXpReward(
  activityType: "checkin" | "meal" | "workout" | "fasting" | "challenge" | "badge" | string,
  profile: { level: number } | null | undefined,
  extraData?: {
    elapsedHours?: number;
    challengeId?: string;
    badgeId?: string;
    rewardXp?: number;
  }
): number {
  switch (activityType) {
    case "checkin":
    case "daily_checkin":
      return isXpBoostActive(profile) ? 60 : 10;
    case "meal":
    case "meal_log":
      return isXpBoostActive(profile) ? 30 : 5;
    case "workout":
    case "workout_log":
      return isXpBoostActive(profile) ? 100 : 60;
    case "fasting":
    case "fasting_session": {
      const elapsedHours = extraData?.elapsedHours ?? 0;
      return Math.min(100, Math.max(15, Math.round(elapsedHours * 4))) + 50;
    }
    case "challenge":
    case "challenge_completed": {
      if (extraData?.challengeId) {
        const defaultChall = DEFAULT_CHALLENGES.find(c => c.id === extraData.challengeId);
        if (defaultChall) {
          return defaultChall.rewardXp;
        }
      }
      return extraData?.rewardXp ?? 100;
    }
    case "badge":
    case "achievement":
    case "badge_unlocked": {
      if (extraData?.badgeId) {
        const defaultBadge = DEFAULT_BADGES.find(b => b.id === extraData.badgeId || b.requirement === extraData.badgeId);
        if (defaultBadge) {
          return defaultBadge.rewardXp;
        }
      }
      return extraData?.rewardXp ?? 50;
    }
    default:
      return extraData?.rewardXp ?? 0;
  }
}

export function getCheckInXp(profile: { level: number } | null | undefined): number {
  return calculateXpReward("checkin", profile);
}

export function getMealXp(profile: { level: number } | null | undefined): number {
  return calculateXpReward("meal", profile);
}

export function getWorkoutXp(profile: { level: number } | null | undefined): number {
  return calculateXpReward("workout", profile);
}

// Check state and level up returning true if leveled up
export function addXpToProfile(profile: UserProfile, xp: number, txSource: string): { profile: UserProfile; transaction: XpTransaction; leveledUp: boolean } {
  let experience = profile.experience + xp;
  let level = profile.level;
  let leveledUp = false;
  let goldPoints = profile.goldPoints;
  
  while (true) {
    const requiredXp = getRequiredXpForLevel(level);
    if (experience >= requiredXp) {
      experience -= requiredXp;
      level += 1;
      goldPoints += level * 25; // reward gold points on level up
      leveledUp = true;
    } else {
      break;
    }
  }

  const updatedProfile: UserProfile = {
    ...profile,
    level,
    experience,
    goldPoints,
  };

  const transaction: XpTransaction = {
    id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    profileId: profile.id,
    source: txSource,
    xpAmount: xp,
    createdAt: new Date().toISOString(),
  };

  return { profile: updatedProfile, transaction, leveledUp };
}

// Bidirectional String-to-UUID mappings to satisfy PostgreSQL constraints for Challenges & Badges
export const CHALLENGE_ID_MAP: { [key: string]: string } = {
  "c1": "c1110000-0000-0000-0000-000000000001",
  "c2": "c2225500-0000-0000-0000-000000000002",
  "c3": "c3330000-0000-0000-0000-000000000003",
};
export const CHALLENGE_ID_MAP_REV = Object.entries(CHALLENGE_ID_MAP).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {} as any);

export const BADGE_ID_MAP: { [key: string]: string } = {
  "b_starter": "b1110000-0000-0000-0000-000000000001",
  "b_first_checkin": "b1110000-0000-0000-0000-000000000002",
  "b_streak_3": "b1110000-0000-0000-0000-000000000003",
  "b_streak_7": "b1110000-0000-0000-0000-000000000007",
  "b_fast_pioneer": "b1110000-0000-0000-0000-000000000010",
  "b_level_5": "b1110000-0000-0000-0000-000000000050",
  "b_first_workout": "b1110000-0000-0000-0000-000000000060"
};
export const BADGE_ID_MAP_REV = Object.entries(BADGE_ID_MAP).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {} as any);

function getLocalFastingSessions(): FastingSession[] {
  try {
    const raw = localStorage.getItem("carnyx_local_fasting_sessions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFastingSessions(sessions: FastingSession[]) {
  try {
    localStorage.setItem("carnyx_local_fasting_sessions", JSON.stringify(sessions));
  } catch (e) {
    console.error(e);
  }
}

// UI MAPPING HELPERS
function mapProfile(p: any): UserProfile {
  if (!p) {
    return {
      id: "",
      displayName: "Unknown Hunter",
      primalClass: PrimalClass.Chieftain,
      level: 1,
      experience: 0,
      goldPoints: 50,
      createdAt: new Date().toISOString()
    };
  }

  // Purely dynamic class evolution driven by level
  let evolvedClass = PrimalClass.Chieftain;
  const userLevel = p.level || 1;
  if (userLevel >= 40) {
    evolvedClass = PrimalClass.Slayer;
  } else if (userLevel >= 20) {
    evolvedClass = PrimalClass.Reaver;
  }

  return {
    id: p.id,
    displayName: p.display_name,
    primalClass: evolvedClass,
    level: userLevel,
    experience: p.experience || 0,
    goldPoints: p.gold_points || 50,
    createdAt: p.created_at,
    preferredLanguage: p.preferred_language || "en",
  };
}

function mapMeal(m: any): MealLog {
  if (!m) {
    return {
      id: "",
      profileId: "",
      cutType: "Unknown Cut",
      ketoRatio: KetoRatio.Medium,
      weightGrams: 200,
      isCarbZero: true,
      loggedAt: new Date().toISOString()
    };
  }
  return {
    id: m.id,
    profileId: m.profile_id,
    nutritionId: m.nutrition_id || undefined,
    cutType: m.cut_type,
    ketoRatio: m.keto_ratio,
    weightGrams: m.weight_grams,
    isCarbZero: m.is_carb_zero,
    notes: m.notes || undefined,
    loggedAt: m.logged_at,
  };
}

function mapWorkoutLog(w: any): WorkoutLog {
  if (!w) {
    return {
      id: "",
      profileId: "",
      exerciseName: "Squats",
      sets: 3,
      reps: 10,
      weightKg: 80,
      durationMinutes: 15,
      workoutDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };
  }
  return {
    id: w.id,
    profileId: w.profile_id,
    exerciseName: w.exercise_name,
    sets: Number(w.sets),
    reps: Number(w.reps),
    weightKg: Number(w.weight_kg),
    durationMinutes: Number(w.duration_minutes),
    notes: w.notes || undefined,
    wgerExerciseId: w.wger_id || w.wger_exercise_id || undefined,
    workoutDate: w.workout_date,
    createdAt: w.created_at,
  };
}

function mapStreak(s: any): Streak {
  if (!s) {
    return {
      id: "",
      profileId: "",
      currentStreak: 0,
      longestStreak: 0,
      marrowShieldsActive: 1,
      shieldProgressPercent: 0,
      updatedAt: new Date().toISOString()
    };
  }
  return {
    id: s.id,
    profileId: s.profile_id,
    currentStreak: s.current_streak,
    longestStreak: s.longest_streak,
    marrowShieldsActive: s.marrow_shields_active,
    shieldProgressPercent: s.shield_progress_percent ?? 0,
    lastLoggedDate: s.last_logged_date || undefined,
    updatedAt: s.updated_at,
  };
}

function mapCheckin(c: any): DailyCheckIn {
  if (!c) {
    return {
      id: "",
      profileId: "",
      checkInDate: new Date().toISOString().split("T")[0],
      completed: true,
      createdAt: new Date().toISOString()
    };
  }
  return {
    id: c.id,
    profileId: c.profile_id,
    checkInDate: c.check_in_date,
    completed: c.completed,
    notes: c.notes || undefined,
    createdAt: c.created_at,
  };
}

function mapShieldLog(s: any): ShieldLog {
  if (!s) {
    return {
      id: "",
      profileId: "",
      actionType: "",
      shieldChange: 0,
      reason: "",
      createdAt: new Date().toISOString()
    };
  }
  return {
    id: s.id,
    profileId: s.profile_id,
    actionType: s.action_type || 'gain',
    shieldChange: Number(s.shield_change ?? 0),
    reason: s.reason || "",
    createdAt: s.created_at || s.logged_at || new Date().toISOString(),
  };
}

function mapProgress(p: any): ProgressRecord {
  if (!p) {
    return {
      id: "",
      profileId: "",
      weight: 70,
      recordDate: new Date().toISOString().split("T")[0],
    };
  }
  return {
    id: p.id,
    profileId: p.profile_id,
    weight: Number(p.weight),
    bodyMeasurement: p.body_measurement || undefined,
    recordDate: p.record_date,
  };
}

function mapTransaction(t: any): XpTransaction {
  if (!t) {
    return {
      id: "",
      profileId: "",
      source: "Ritual Coordination",
      xpAmount: 0,
      createdAt: new Date().toISOString(),
    };
  }
  let cleanSource = t.source || "";
  cleanSource = cleanSource.replace(/\s*\(Session:\s*[^)]+\)/gi, "").trim();
  return {
    id: t.id,
    profileId: t.profile_id,
    source: cleanSource,
    xpAmount: t.xp_amount,
    createdAt: t.created_at,
  };
}

function mapFastingSession(s: any): FastingSession {
  if (!s) {
    return {
      id: "",
      profileId: "",
      protocolId: "16-8",
      startTime: new Date().toISOString(),
      status: "stopped",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  return {
    id: s.id,
    profileId: s.profile_id,
    protocolId: s.protocol_id,
    startTime: s.start_time,
    endTime: s.end_time || undefined,
    status: s.status,
    completed: s.completed,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
}

function mapUserChallenge(uc: any): UserChallenge {
  if (!uc) {
    return {
      id: "",
      profileId: "",
      challengeId: "",
      progress: 0,
      status: ChallengeStatus.Active,
      joinedAt: new Date().toISOString()
    };
  }
  return {
    id: uc.id,
    profileId: uc.profile_id,
    challengeId: CHALLENGE_ID_MAP_REV[uc.challenge_id] || uc.challenge_id,
    progress: uc.progress,
    status: uc.status,
    joinedAt: uc.joined_at,
  };
}

function mapUserBadge(ub: any): UserBadge {
  if (!ub) {
    return {
      id: "",
      profileId: "",
      badgeId: "",
      unlockedAt: new Date().toISOString()
    };
  }
  return {
    id: ub.id,
    profileId: ub.profile_id,
    badgeId: BADGE_ID_MAP_REV[ub.badge_id] || ub.badge_id,
    unlockedAt: ub.unlocked_at,
  };
}

// Developer utility to seed challenges and badges if missing.
// This is NOT executed automatically to avoid RLS permission denied errors in production.
export async function runCarnyxSeeder(verbose = true) {
  try {
    if (verbose) console.log("[DEVELOPER SEEDER] Running robust seedHelperTables...");
    
    // 1. Seed Challenges
    const { data: dbChallenges, error: chErr } = await supabase.from('challenges').select('*');
    if (chErr) {
      if (verbose) console.error("[DEVELOPER SEEDER] Error querying challenges for seeding:", chErr);
      return;
    }
    
    for (const c of DEFAULT_CHALLENGES) {
      const mappedId = CHALLENGE_ID_MAP[c.id];
      const exists = dbChallenges?.some(dbc => dbc.id === mappedId || dbc.title.toLowerCase() === c.title.toLowerCase());
      if (!exists) {
        if (verbose) console.log(`[DEVELOPER SEEDER] Challenge '${c.title}' is missing. Seeding...`);
        const { error: chInsErr } = await supabase.from('challenges').insert({
          id: mappedId,
          title: c.title,
          description: c.description,
          duration_days: c.durationDays,
          reward_xp: c.rewardXp
        });
        if (chInsErr && verbose) {
          console.error(`[DEVELOPER SEEDER] Failed to seed challenge '${c.title}':`, chInsErr);
        }
      }
    }

    // 2. Seed Badges
    const { data: dbBadges, error: bdErr } = await supabase.from('badges').select('*');
    if (bdErr) {
      if (verbose) console.error("[DEVELOPER SEEDER] Error querying badges for seeding:", bdErr);
      return;
    }

    for (const b of DEFAULT_BADGES) {
      const mappedId = BADGE_ID_MAP[b.id];
      const exists = dbBadges?.some(db_b => db_b.id === mappedId || db_b.name.toLowerCase() === b.name.toLowerCase());
      if (!exists) {
        if (verbose) console.log(`[DEVELOPER SEEDER] Badge '${b.name}' is missing. Seeding...`);
        const { error: bdInsErr } = await supabase.from('badges').insert({
          id: mappedId,
          name: b.name,
          description: b.description,
          requirement: b.requirement,
          reward_xp: b.rewardXp
        });
        if (bdInsErr && verbose) {
          console.error(`[DEVELOPER SEEDER] Failed to seed badge '${b.name}':`, bdInsErr);
        }
      }
    }
    if (verbose) console.log("[DEVELOPER SEEDER] Robust seedHelperTables completed successfully.");
  } catch (err) {
    if (verbose) console.warn("[DEVELOPER SEEDER] Seeding auxiliary tables issue:", err);
  }
}

if (typeof window !== "undefined") {
  (window as any).runCarnyxSeeder = runCarnyxSeeder;
}

// Supabase DB client driver implementing same signatures asynchronously
class SupabaseDB {
  constructor() {
    // Seeding is now a manual developer utility to prevent production console permission errors
  }

  public async getDbBadgeId(localBadgeId: string): Promise<string | null> {
    try {
      const localBadge = DEFAULT_BADGES.find(b => b.id === localBadgeId);
      const searchRequirement = localBadge ? localBadge.requirement : localBadgeId;

      const { data: dbBadges, error } = await supabase.from('badges').select('*');
      if (error) {
        console.warn("[DEBUG] Error fetching badges from DB:", error);
      }
      
      console.log(`[DEBUG] Comparing badge criteria: ${localBadgeId}, searchRequirement: ${searchRequirement}. db_badges count:`, dbBadges?.length || 0);

      if (dbBadges && dbBadges.length > 0) {
        // Find by requirement column first
        let match = dbBadges.find(dbb => dbb.requirement === searchRequirement);
        
        // Backward compatibility translations
        if (!match) {
          let mappedReq = searchRequirement;
          if (searchRequirement === "b_starter") mappedReq = "first_zero_carb_meal";
          else if (searchRequirement === "b_fast_pioneer") mappedReq = "first_fast_completion";
          else if (searchRequirement === "b_streak_7") mappedReq = "streak_7";
          else if (searchRequirement === "b_level_5") mappedReq = "level_5";
          else if (searchRequirement === "b_streak_3") mappedReq = "streak_3";
          
          match = dbBadges.find(dbb => dbb.requirement === mappedReq);
        }

        if (!match && localBadge) {
          // Find by name
          match = dbBadges.find(dbb => dbb.name.toLowerCase() === localBadge.name.toLowerCase());
        }

        if (!match) {
          // Find by UUID
          const uuidToCheck = BADGE_ID_MAP[localBadgeId] || localBadgeId;
          match = dbBadges.find(dbb => dbb.id === uuidToCheck);
        }

        if (match) {
          console.log(`[DEBUG] Resolved DB Badge ID for '${localBadgeId}' to UUID: '${match.id}'`);
          return match.id;
        }
      }

      // If we still can't find it and we have a localBadge, we fall back to mapped ID
      if (localBadge) {
        const mappedId = BADGE_ID_MAP[localBadgeId];
        return mappedId || null;
      }

      return BADGE_ID_MAP[localBadgeId] || null;
    } catch (e) {
      console.error("[DEBUG] Exception resolving DB Badge ID:", e);
      return BADGE_ID_MAP[localBadgeId] || null;
    }
  }

  public async grantBadge(profileId: string, criteria: string, conditionSatisfied: boolean = true): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userUid = user?.id || "N/A";

      console.log(`[DEBUG] [VERIFICATION START - grantBadge]
        Authenticated Auth User ID: ${userUid}
        Target Profile ID: ${profileId}
        Badge Criteria/Requirement: ${criteria}
        Condition Satisfied: ${conditionSatisfied}`);

      // 1. Verify User is Authenticated
      if (!user) {
        console.warn(`[DEBUG] Verification FAIL: No authenticated session user found.`);
        return false;
      }

      // 2. Verify Profile Exists
      const profile = await this.getProfile(profileId);
      if (!profile) {
        console.warn(`[DEBUG] Verification FAIL: Athlete profile '${profileId}' does not exist.`);
        return false;
      }

      // 3. Verify Condition is Truly Satisfied
      if (!conditionSatisfied) {
        console.warn(`[DEBUG] Verification FAIL: Achievement conditions not satisfied for '${criteria}'.`);
        return false;
      }

      // 4. Resolve DB Badge row directly from public.badges
      const { data: dbBadges, error: errQuery } = await supabase.from('badges').select('*');
      if (errQuery) {
        console.warn("[DEBUG] Error querying public.badges:", errQuery);
      }

      let dbBadge = null;
      if (dbBadges && dbBadges.length > 0) {
        // 4.1 First match exact requirement field
        dbBadge = dbBadges.find(b => b.requirement === criteria);

        // 4.2 Legacy hardcoded IDs mapping translation (e.g. if 'b_starter' was requested)
        if (!dbBadge) {
          let mappedReq = criteria;
          if (criteria === "b_starter") mappedReq = "first_zero_carb_meal";
          else if (criteria === "b_fast_pioneer") mappedReq = "first_fast_completion";
          else if (criteria === "b_streak_7") mappedReq = "streak_7";
          else if (criteria === "b_level_5") mappedReq = "level_5";
          else if (criteria === "b_streak_3") mappedReq = "streak_3";
          
          dbBadge = dbBadges.find(b => b.requirement === mappedReq);
        }

        // 4.3 Match by name
        if (!dbBadge) {
          dbBadge = dbBadges.find(b => b.name.toLowerCase() === criteria.toLowerCase());
        }

        // 4.4 Match by static mapping UUID
        if (!dbBadge) {
          const uuidToCheck = BADGE_ID_MAP[criteria] || criteria;
          dbBadge = dbBadges.find(b => b.id === uuidToCheck);
        }
      }

      // If we don't have this badge in public.badges, let's look at DEFAULT_BADGES
      if (!dbBadge) {
        // Check if there is a local badge definition to fall back to
        const localBadge = DEFAULT_BADGES.find(b => b.id === criteria || b.requirement === criteria);
        if (localBadge) {
          const mappedId = BADGE_ID_MAP[localBadge.id] || BADGE_ID_MAP[criteria] || "b1110000-0000-0000-0000-000000000099";
          dbBadge = {
            id: mappedId,
            name: localBadge.name,
            description: localBadge.description,
            requirement: localBadge.requirement,
            reward_xp: localBadge.rewardXp
          };
        }
      }

      if (!dbBadge) {
        console.warn(`[DEBUG] Verification FAIL: Could not find badge record in public.badges matching '${criteria}'`);
        return false;
      }

      const badgeId = dbBadge.id;
      const badgeName = dbBadge.name;
      const badgeRewardXp = calculateXpReward("badge", profile, { badgeId: criteria, rewardXp: dbBadge.reward_xp });

      console.log(`[DEBUG] Resolved Dynamic Badge: Requirement=${dbBadge.requirement}, ID=${badgeId}, Name=${badgeName}, RewardXP=${badgeRewardXp}`);

      // 5. Verify the Badge is Not Already Unlocked by checking public.user_badges
      const { data: hasBadge, error: errSelect } = await supabase
        .from("user_badges")
        .select("*")
        .eq("profile_id", profileId)
        .eq("badge_id", badgeId)
        .maybeSingle();

      if (errSelect) {
        console.warn(`[DEBUG] Note: Supabase error checking badge presence:`, errSelect);
      }

      if (hasBadge) {
        console.log(`[DEBUG] Verification FAIL: Badge '${badgeName}' is already unlocked in user_badges Table.`);
        return false;
      }

      // 6. Verify the XP Transaction does not already exist
      const txSource = `Unlocked Trophy: ${badgeName}`;
      const { data: hasTx, error: errTxSelect } = await supabase
        .from("xp_transactions")
        .select("*")
        .eq("profile_id", profileId)
        .eq("source", txSource)
        .maybeSingle();

      if (errTxSelect) {
        console.warn(`[DEBUG] Note: Supabase error checking XP transaction presence:`, errTxSelect);
      }

      // 7. Perform Insert into public.user_badges
      const payload = { profile_id: profileId, badge_id: badgeId };
      const { data: inserted, error: errInsert } = await supabase
        .from("user_badges")
        .insert(payload)
        .select();

      if (errInsert) {
        console.error(`[DEBUG] Fail: Persisting badge in database user_badges table:`, errInsert);
        return false;
      }

      console.log(`[DEBUG] Success: user_badges Insert Result:`, inserted);

      // 8. Award XP transaction if not already tracked
      if (!hasTx) {
        const { profile: updatedWithBadge } = addXpToProfile(profile, badgeRewardXp, txSource);
        await this.updateProfile(updatedWithBadge);
        
        const { data: txInserted, error: errTxInsert } = await supabase.from("xp_transactions").insert({
          profile_id: profileId,
          source: txSource,
          xp_amount: badgeRewardXp
        }).select();

        if (errTxInsert) {
          console.error(`[DEBUG] Fail: Inserting tracking XP transaction in DB:`, errTxInsert);
        } else {
          console.log(`[DEBUG] Success: XP transaction Insert Result:`, txInserted);
        }
      } else {
        console.log(`[DEBUG] XP transaction already exist for '${txSource}' in DB. Skipping duplicate payout.`);
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("meals_updated"));
        window.dispatchEvent(new Event("fasting_history_updated"));
        window.dispatchEvent(new Event("checkins_updated"));
        window.dispatchEvent(new Event("badge_unlocked"));
      }, 100);

      return true;
    } catch (e) {
      console.error(`[DEBUG] Exception in grantBadge for '${criteria}':`, e);
      return false;
    }
  }

  // --- Auth & Session ---
  public async getActiveUserAndProfile(): Promise<{ user: any | null; profile: UserProfile | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profile) {
        localStorage.setItem("carnyx_active_user_id", user.id);
        localStorage.setItem("carnyx_active_user_email", user.email || "");
        return { user, profile: mapProfile(profile) };
      }
      return { user, profile: null };
    }

    // Fallback for email-confirmation-pending users or localhost session mock
    const fallbackUserId = localStorage.getItem("carnyx_active_user_id");
    const fallbackEmail = localStorage.getItem("carnyx_active_user_email");
    if (fallbackUserId) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', fallbackUserId).maybeSingle();
      if (profile) {
        return { 
          user: { id: fallbackUserId, email: fallbackEmail }, 
          profile: mapProfile(profile) 
        };
      }
    }
    return { user: null, profile: null };
  }

  public async register(email: string, displayName: string, kClass: PrimalClass, password?: string): Promise<{ profile: UserProfile | null; success: boolean; error?: string }> {
    const { data: existing } = await supabase.from('profiles').select('display_name').eq('display_name', displayName).maybeSingle();
    if (existing) {
      return { profile: null, success: false, error: "Username already taken by another tribe member." };
    }

    const normalizedEmail = email.toLowerCase().trim();
    // Default password for prototype seamlessness or we could let user enter password
    const finalPassword = password || "tribalpassword123";

    // Helper to detect rate limit errors
    const isRateLimit = (msg: string): boolean => {
      const norm = (msg || "").toLowerCase();
      return norm.includes("rate limit") || norm.includes("rate_limit") || norm.includes("too many requests") || (norm.includes("exceeded") && norm.includes("email"));
    };

    // Before creating a new account, check whether the email already exists in Supabase Auth.
    // If the account already exists, we will fail with a special code "ACCOUNT_EXISTS" so the UI can redirect the user to Login.
    try {
      const { data: signInCheck, error: signInCheckError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: finalPassword,
      });

      if (!signInCheckError && signInCheck?.user) {
        // High confidence this client exists in auth! Exit registration immediately & switch to login.
        return { profile: null, success: false, error: "ACCOUNT_EXISTS" };
      }

      if (signInCheckError) {
        const msg = signInCheckError.message;
        if (isRateLimit(msg)) {
          return {
            profile: null,
            success: false,
            error: "Registration is temporarily rate-limited. Please log in with your existing account or try again later."
          };
        }
      }
    } catch (e: any) {
      console.warn("Exist validation error:", e);
    }

    // Now call signUp since we verified user does not exist or we couldn't log in
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: finalPassword,
    });

    if (error) {
      if (isRateLimit(error.message)) {
        return {
          profile: null,
          success: false,
          error: "Registration is temporarily rate-limited. Please log in with your existing account or try again later."
        };
      }
      if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("email already taken") || error.message.toLowerCase().includes("already exists")) {
        return { profile: null, success: false, error: "ACCOUNT_EXISTS" };
      }
      return { profile: null, success: false, error: error.message };
    }

    if (!data.user) {
      return { profile: null, success: false, error: "Failed to establish registration coordinates." };
    }

    if (data.user.identities && data.user.identities.length === 0) {
      return { profile: null, success: false, error: "ACCOUNT_EXISTS" };
    }

    // Ensure we have a valid authenticated session before inserting into the profiles database
    let activeSession = data.session;
    if (!activeSession) {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: finalPassword,
      });
      if (signInData && signInData.session) {
        activeSession = signInData.session;
      }
    }

    if (!activeSession) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData && sessionData.session) {
        activeSession = sessionData.session;
      }
    }

    if (!activeSession) {
      return {
        profile: null,
        success: false,
        error: "Authenticated session could not be established. Please try logging in with your credentials."
      };
    }

    // Checking if profile already exists for this unique user.id just in case
    const { data: pCheck } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
    if (pCheck) {
      // Profile already exists! Fetch and return it directly (satisfies Task 7)
      const { data: realProfile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      if (realProfile) {
        localStorage.setItem("carnyx_active_user_id", data.user.id);
        localStorage.setItem("carnyx_active_user_email", normalizedEmail);
        return { profile: mapProfile(realProfile), success: true };
      }
    }

    const newProfile: UserProfile = {
      id: data.user.id,
      displayName,
      primalClass: PrimalClass.Chieftain, // Default starter class is always Chieftain
      level: 1,
      experience: 0,
      goldPoints: 50, // Keep 50 as default
      createdAt: new Date().toISOString(),
    };

    const { error: insertErr } = await supabase.from('profiles').insert({
      id: newProfile.id,
      display_name: newProfile.displayName,
      primal_class: 'Chieftain', // Safely write valid DB enum
      level: newProfile.level,
      experience: newProfile.experience,
      gold_points: newProfile.goldPoints,
    });

    if (insertErr) {
      // If it exists already, don't worry, map details
      if (insertErr.code === "23505") { // Unique key / primary key violation
        const { data: existingP } = await supabase.from('profiles').select('*').eq('id', newProfile.id).maybeSingle();
        if (existingP) {
          localStorage.setItem("carnyx_active_user_id", newProfile.id);
          localStorage.setItem("carnyx_active_user_email", normalizedEmail);
          return { profile: mapProfile(existingP), success: true };
        }
      }
      return { profile: null, success: false, error: insertErr.message };
    }

    // Streaks setup in Supabase
    const { data: existingStr } = await supabase.from('streaks').select('*').eq('profile_id', newProfile.id).maybeSingle();
    if (!existingStr) {
      await supabase.from('streaks').insert({
        profile_id: newProfile.id,
        current_streak: 0,
        longest_streak: 0,
        marrow_shields_active: 1
      });
    }

    // Enroll in introductory challenge (prevent duplicates)
    const mappedC1 = CHALLENGE_ID_MAP["c1"];
    const { data: existingChallenge } = await supabase.from('user_challenges').select('*').eq('profile_id', newProfile.id).eq('challenge_id', mappedC1).maybeSingle();
    if (!existingChallenge) {
      await supabase.from('user_challenges').insert({
        profile_id: newProfile.id,
        challenge_id: mappedC1,
        progress: 0,
        status: ChallengeStatus.Active
      });
    }

    localStorage.setItem("carnyx_active_user_id", newProfile.id);
    localStorage.setItem("carnyx_active_user_email", normalizedEmail);

    return { profile: newProfile, success: true };
  }

  public async login(email: string, password?: string, username?: string): Promise<{ profile: UserProfile | null; success: boolean; error?: string }> {
    let loginEmail = email.toLowerCase().trim();
    const finalPass = password || "tribalpassword123";

    if (username && username.trim() !== "") {
      const { data: userProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('display_name', username.trim())
        .maybeSingle();

      if (profileErr || !userProfile) {
        return { profile: null, success: false, error: "Invalid login credentials" };
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: finalPass
      });

      if (authError) {
        const isRateLimit = (msg: string): boolean => {
          const norm = (msg || "").toLowerCase();
          return norm.includes("rate limit") || norm.includes("rate_limit") || norm.includes("too many requests") || (norm.includes("exceeded") && norm.includes("email"));
        };
        if (isRateLimit(authError.message)) {
          return {
            profile: null,
            success: false,
            error: "Login is temporarily rate-limited. Please try again later."
          };
        }
        return { profile: null, success: false, error: "Invalid login credentials" };
      }

      if (authData.user) {
        if (authData.user.id !== userProfile.id) {
          await supabase.auth.signOut();
          return { profile: null, success: false, error: "Invalid login credentials" };
        }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).maybeSingle();
        if (profile) {
          localStorage.setItem("carnyx_active_user_id", authData.user.id);
          localStorage.setItem("carnyx_active_user_email", authData.user.email || "");
          return { profile: mapProfile(profile), success: true };
        } else {
          const fallbackProfile: UserProfile = {
            id: authData.user.id,
            displayName: username.trim(),
            primalClass: PrimalClass.Chieftain,
            level: 1,
            experience: 0,
            goldPoints: 100,
            createdAt: new Date().toISOString(),
          };

          await supabase.from('profiles').insert({
            id: fallbackProfile.id,
            display_name: fallbackProfile.displayName,
            primal_class: fallbackProfile.primalClass,
            level: fallbackProfile.level,
            experience: fallbackProfile.experience,
            gold_points: fallbackProfile.goldPoints,
          });

          const { data: str } = await supabase.from('streaks').select('*').eq('profile_id', fallbackProfile.id).maybeSingle();
          if (!str) {
            await supabase.from('streaks').insert({
              profile_id: fallbackProfile.id,
              current_streak: 0,
              longest_streak: 0,
              marrow_shields_active: 1
            });
          }

          localStorage.setItem("carnyx_active_user_id", fallbackProfile.id);
          localStorage.setItem("carnyx_active_user_email", authData.user.email || "");
          return { profile: mapProfile(fallbackProfile), success: true };
        }
      }
      return { profile: null, success: false, error: "Invalid login credentials" };
    }

    if (!email.includes("@")) {
      const { data: userProfile } = await supabase.from('profiles').select('*').eq('display_name', email).maybeSingle();
      if (!userProfile) {
        return { profile: null, success: false, error: "No profile matching that moniker was found." };
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: finalPass
    });

    if (authError) {
      const isRateLimit = (msg: string): boolean => {
        const norm = (msg || "").toLowerCase();
        return norm.includes("rate limit") || norm.includes("rate_limit") || norm.includes("too many requests") || (norm.includes("exceeded") && norm.includes("email"));
      };
      if (isRateLimit(authError.message)) {
        return {
          profile: null,
          success: false,
          error: "Login is temporarily rate-limited. Please try again later."
        };
      }
      return { profile: null, success: false, error: authError.message };
    }

    if (authData.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).maybeSingle();
      if (profile) {
        localStorage.setItem("carnyx_active_user_id", authData.user.id);
        localStorage.setItem("carnyx_active_user_email", authData.user.email || "");
        return { profile: mapProfile(profile), success: true };
      } else {
        const fallbackProfile: UserProfile = {
          id: authData.user.id,
          displayName: loginEmail.split("@")[0] || "TribeMember",
          primalClass: PrimalClass.Chieftain,
          level: 1,
          experience: 0,
          goldPoints: 100,
          createdAt: new Date().toISOString(),
        };

        await supabase.from('profiles').insert({
          id: fallbackProfile.id,
          display_name: fallbackProfile.displayName,
          primal_class: fallbackProfile.primalClass,
          level: fallbackProfile.level,
          experience: fallbackProfile.experience,
          gold_points: fallbackProfile.goldPoints,
        });

        const { data: str } = await supabase.from('streaks').select('*').eq('profile_id', fallbackProfile.id).maybeSingle();
        if (!str) {
          await supabase.from('streaks').insert({
            profile_id: fallbackProfile.id,
            current_streak: 0,
            longest_streak: 0,
            marrow_shields_active: 1
          });
        }

        localStorage.setItem("carnyx_active_user_id", fallbackProfile.id);
        localStorage.setItem("carnyx_active_user_email", authData.user.email || "");
        return { profile: mapProfile(fallbackProfile), success: true };
      }
    }

    return { profile: null, success: false, error: "Tribe boundaries unverified." };
  }

  public async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem("carnyx_active_user_id");
    localStorage.removeItem("carnyx_active_user_email");
  }

  // --- Profiles & Currency ---
  public async getProfile(profileId: string): Promise<UserProfile | null> {
    const { data } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle();
    return data ? mapProfile(data) : null;
  }

  public async updateProfile(profile: UserProfile): Promise<UserProfile> {
    const payload: any = {
      display_name: profile.displayName,
      primal_class: 'Chieftain', // Safely store the starting enum value to avoid invalid DB enum errors
      level: profile.level,
      experience: profile.experience,
      gold_points: profile.goldPoints
    };
    if (profile.preferredLanguage) {
      payload.preferred_language = profile.preferredLanguage;
    }

    await supabase.from('profiles').update(payload).eq('id', profile.id);

    // Automatic Achievement Check: Level 5 badge check (Apex Predator - level_5)
    if (profile.level >= 5) {
      this.grantBadge(profile.id, "level_5").catch(e => console.warn("Failed automatic level 5 badge assertion:", e));
    }

    return profile;
  }

  public async updatePreferredLanguage(profileId: string, lang: 'en' | 'id'): Promise<void> {
    await supabase.from('profiles').update({
      preferred_language: lang
    }).eq('id', profileId);
  }

  public async buyShield(profileId: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    const profile = await this.getProfile(profileId);
    if (!profile) return { success: false, error: "Profile not found." };
    if (profile.goldPoints < 80) return { success: false, error: "Insufficient Gold Points. Earn more by logging or completing objectives." };

    profile.goldPoints -= 80;
    await this.updateProfile(profile);

    const { data: str } = await supabase.from('streaks').select('*').eq('profile_id', profileId).maybeSingle();
    if (str) {
      await supabase.from('streaks').update({
        marrow_shields_active: str.marrow_shields_active + 1,
        updated_at: new Date().toISOString()
      }).eq('profile_id', profileId);
      
      await this.addShieldLog(profileId, 1, "Purchased with Gold Points", "shield_gained");
    }

    return { success: true, profile };
  }

  // --- Workout Logging ---
  public async getWorkoutLogs(profileId: string): Promise<WorkoutLog[]> {
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('profile_id', profileId)
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false });
    return data ? data.map(mapWorkoutLog) : [];
  }

  public async saveWorkoutLog(
    profileId: string,
    log: {
      exerciseName: string;
      sets: number;
      reps: number;
      weightKg: number;
      durationMinutes: number;
      notes?: string;
      wgerExerciseId?: number;
      workoutDate: string;
    }
  ): Promise<{ success: boolean; leveledUp: boolean; xpEarned: number }> {
    const workoutRow = {
      profile_id: profileId,
      wger_id: log.wgerExerciseId || null,
      exercise_name: log.exerciseName,
      sets: log.sets,
      reps: log.reps,
      weight_kg: log.weightKg,
      duration_minutes: log.durationMinutes,
      notes: log.notes || null,
      workout_date: log.workoutDate,
    };

    const { data: inserted, error } = await supabase
      .from('workout_logs')
      .insert(workoutRow)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert workout log: ${error.message}`);
    }

    let totalXpEarned = 0;
    let combinedLeveledUp = false;

    // 1. Award base XP for the workout (Boosted or Normal)
    const profile = await this.getProfile(profileId);
    if (profile) {
      const baseWorkoutXp = getWorkoutXp(profile);
      const initialLevel = profile.level;
      const txSource = `Logged Workout: ${log.exerciseName}`;
      const { profile: updatedProfile, leveledUp: lvlCheck } = addXpToProfile(
        profile,
        baseWorkoutXp,
        txSource
      );
      combinedLeveledUp = lvlCheck;
      await this.updateProfile(updatedProfile);

      // Write XP transaction
      await supabase.from('xp_transactions').insert({
        profile_id: profileId,
        source: txSource,
        xp_amount: baseWorkoutXp,
      });
      totalXpEarned += baseWorkoutXp;
    }

    // 2. Grant dynamic badge check for "Commence Your First Workout"
    try {
      console.log(`[DEBUG] Checking first_workout badge triggers...`);
      const isGranted = await this.grantBadge(profileId, "first_workout", true);
      if (isGranted) {
        const badgeXp = calculateXpReward("badge", profile, { badgeId: "first_workout", rewardXp: 120 });
        console.log(`[DEBUG] first_workout badge successfully granted! ${badgeXp} XP awarded.`);
        totalXpEarned += badgeXp;
        const newestPf = await this.getProfile(profileId);
        if (newestPf && profile) {
          combinedLeveledUp = newestPf.level > profile.level;
        }
      }
    } catch (badgeErr) {
      console.warn("Failed to award first_workout badge:", badgeErr);
    }

    // 3. Increment challenge progress for active workout challenges
    try {
      const lvl2Result = await this.evaluateLevel2Challenges(profileId, 'workout');
      totalXpEarned += lvl2Result.xpEarned;
      if (lvl2Result.leveledUp) {
        combinedLeveledUp = true;
      }
    } catch (challErr) {
      console.warn("Failed to progress level 2 workout challenge:", challErr);
    }

    // Dispatch update events for frontend listening
    setTimeout(() => {
      window.dispatchEvent(new Event("workouts_updated"));
    }, 100);

    return { success: true, leveledUp: combinedLeveledUp, xpEarned: totalXpEarned };
  }

  // --- Meals Logging ---
  public async getMeals(profileId: string): Promise<MealLog[]> {
    const { data } = await supabase.from('meals_log').select('*').eq('profile_id', profileId).order('logged_at', { ascending: false });
    return data ? data.map(mapMeal) : [];
  }

  public async logMeal(profileId: string, item: { cutType: string; weightGrams: number; notes?: string; calories: number; proteinGrams: number; fatGrams: number; isCarbZero: boolean; ketoRatio: KetoRatio }): Promise<{ meal: MealLog; leveledUp: boolean; xpEarned: number; shieldActivated?: boolean; streakBroken?: boolean }> {
    const newMealData = {
      profile_id: profileId,
      cut_type: item.cutType,
      weight_grams: item.weightGrams,
      is_carb_zero: item.isCarbZero,
      keto_ratio: item.ketoRatio,
      notes: item.notes,
      logged_at: new Date().toISOString()
    };

    const { data: insertedMeal, error } = await supabase.from('meals_log').insert(newMealData).select().single();
    if (error) {
      throw new Error(error.message);
    }

    const meal = mapMeal(insertedMeal);

    // Gamification check: awards XP (Boosted or Normal)
    const profile = await this.getProfile(profileId);
    if (!profile) {
      return { meal, leveledUp: false, xpEarned: 0 };
    }

    const initialLevel = profile.level;
    const mealXp = getMealXp(profile);
    let totalXpEarned = mealXp;

    const { profile: updatedProfile, transaction, leveledUp: stdLeveledUp } = addXpToProfile(profile, mealXp, `Logged meal: ${item.cutType}`);
    await this.updateProfile(updatedProfile);

    // Write XP transactions
    await supabase.from('xp_transactions').insert({
      profile_id: profileId,
      source: transaction.source,
      xp_amount: mealXp,
    });

    let combinedLeveledUp = stdLeveledUp;

    // Badge Check: First Hunt Tribute (first_zero_carb_meal)
    if (item.isCarbZero) {
      console.log(`[DEBUG] Checking first_zero_carb_meal zero-carb badge criteria...`);
      const isGranted = await this.grantBadge(profileId, "first_zero_carb_meal", true);
      if (isGranted) {
        const badgeXp = calculateXpReward("badge", profile, { badgeId: "first_zero_carb_meal", rewardXp: 50 });
        console.log(`[DEBUG] first_zero_carb_meal successfully granted! ${badgeXp} XP awarded.`);
        totalXpEarned += badgeXp;
        const newestPf = await this.getProfile(profileId);
        if (newestPf) {
          combinedLeveledUp = newestPf.level > initialLevel;
        }
      }
    }

    // Progress enrollment for Challenge: Mammoth Raid (c1)
    const { data: challengeEnr } = await supabase.from('user_challenges').select('*').eq('profile_id', profileId).eq('challenge_id', CHALLENGE_ID_MAP["c1"]).eq('status', ChallengeStatus.Active).maybeSingle();
    if (challengeEnr) {
      const nextProgress = challengeEnr.progress + 1;
      let nextStatus = challengeEnr.status;

      if (nextProgress >= 5) {
        nextStatus = ChallengeStatus.Completed;
        const currentProf = await this.getProfile(profileId);
        if (currentProf) {
          const chXp = calculateXpReward("challenge", currentProf, { challengeId: "c1", rewardXp: 200 });
          const { profile: updatedWithChall, transaction: challTx } = addXpToProfile(currentProf, chXp, "Completed Challenge: The Mammoth Raid");
          await this.updateProfile(updatedWithChall);
          await supabase.from('xp_transactions').insert({
            profile_id: profileId,
            source: challTx.source,
            xp_amount: chXp,
          });
          totalXpEarned += chXp;
          const newestPf = await this.getProfile(profileId);
          if (newestPf) {
            combinedLeveledUp = newestPf.level > initialLevel;
          }
        }
      }

      await supabase.from('user_challenges').update({
        progress: nextProgress,
        status: nextStatus
      }).eq('id', challengeEnr.id);
    }

    // Evaluate Level 2 challenges
    const lvl2Result = await this.evaluateLevel2Challenges(profileId, 'meal', { isCarbZero: item.isCarbZero });
    totalXpEarned += lvl2Result.xpEarned;
    if (lvl2Result.leveledUp) {
      combinedLeveledUp = true;
    }

    // Streak Protection / Break for Carb Slippage
    let shieldActivated = false;
    let streakBroken = false;
    if (!item.isCarbZero) {
      const userStreak = await this.getStreak(profileId);
      let newStreakValue = userStreak.currentStreak;
      let marrowShields = userStreak.marrowShieldsActive;

      if (marrowShields > 0) {
        marrowShields -= 1;
        shieldActivated = true;
        // do NOT break the streak
        console.log(`[DEBUG] Shield absorbed carb slippage! Current streak preserved: ${newStreakValue}`);
        await this.addShieldLog(profileId, -1, "Carb Slippage Protection", "shield_used");
      } else {
        newStreakValue = 0; // break the streak
        streakBroken = true;
        console.log(`[DEBUG] No active shields. Carb slippage broke the streak! Current streak reset to 0.`);
      }

      await supabase.from('streaks').update({
        current_streak: newStreakValue,
        marrow_shields_active: marrowShields,
        updated_at: new Date().toISOString()
      }).eq('profile_id', profileId);
    }

    return { meal, leveledUp: combinedLeveledUp, xpEarned: totalXpEarned, shieldActivated, streakBroken };
  }

  public async incrementShieldProgress(profileId: string, amountPercent: number): Promise<void> {
    const { data: str } = await supabase.from('streaks').select('*').eq('profile_id', profileId).maybeSingle();
    if (str) {
      // current values
      let currentPercent = str.shield_progress_percent ?? 0;
      let activeShields = str.marrow_shields_active ?? 0;
      const oldShields = activeShields;

      // add percent
      currentPercent += amountPercent;

      // check overflow
      while (currentPercent >= 100) {
        activeShields += 1;
        currentPercent -= 100;
      }

      const shieldsGained = activeShields - oldShields;
      if (shieldsGained > 0) {
        await this.addShieldLog(profileId, shieldsGained, "Challenge Completion", "shield_gained");
      }

      // update standard streaks table
      await supabase.from('streaks').update({
        shield_progress_percent: currentPercent,
        marrow_shields_active: activeShields,
        updated_at: new Date().toISOString()
      }).eq('profile_id', profileId);

      console.log(`[DEBUG] Updated shield progress for ${profileId}: ${currentPercent}%, active shields: ${activeShields}`);
    }
  }

  public async evaluateLevel2Challenges(
    profileId: string,
    triggerType: 'meal' | 'fast' | 'checkin' | 'workout',
    details?: { isCarbZero?: boolean; meetsTarget?: boolean }
  ): Promise<{ leveledUp: boolean; xpEarned: number }> {
    try {
      // 1. Fetch active enrollments for Level 2 or higher database challenges
      const { data: activeEnrollments, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('profile_id', profileId)
        .eq('status', ChallengeStatus.Active);
        
      if (error || !activeEnrollments || activeEnrollments.length === 0) {
        return { leveledUp: false, xpEarned: 0 };
      }

      let leveledUp = false;
      let totalXpEarned = 0;

      for (const uc of activeEnrollments) {
        // Fetch the corresponding challenge metadata from challenges table
        const { data: challenge } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', uc.challenge_id)
          .maybeSingle();

        if (!challenge) continue;

        const title = challenge.title;
        let shouldIncrement = false;
        let targetProgress = challenge.target_value ?? challenge.duration_days ?? 1;

        if (title === "Fasting Vanguard" && triggerType === "fast") {
          if (details?.meetsTarget) {
            shouldIncrement = true;
          }
        } else if (title === "Advanced Raid I" && triggerType === "checkin") {
          shouldIncrement = true;
        } else if (title === "Iron Hunt" && triggerType === "meal") {
          if (details?.isCarbZero) {
            shouldIncrement = true;
          }
        } else if (title === "Primal Momentum" && triggerType === "checkin") {
          shouldIncrement = true;
        } else if ((challenge.challenge_kind === "workout" || title === "Forge Five Workouts") && triggerType === "workout") {
          shouldIncrement = true;
        }

        if (shouldIncrement) {
          const nextProgress = uc.progress + 1;
          let nextStatus = uc.status;

          if (nextProgress >= targetProgress) {
            nextStatus = ChallengeStatus.Completed;
            
            // Award Challenge Completion Reward XP
            const currentProf = await this.getProfile(profileId);
            if (currentProf) {
              const chXp = calculateXpReward("challenge", currentProf, { challengeId: challenge.id, rewardXp: challenge.reward_xp ?? 100 });
              const challengeTxSource = `Completed Challenge: ${title}`;
              
              // Double check to prevent duplicate reward payouts
              const { data: existingTx } = await supabase
                .from('xp_transactions')
                .select('*')
                .eq('profile_id', profileId)
                .eq('source', challengeTxSource)
                .maybeSingle();

              if (!existingTx) {
                const { profile: updatedWithChall, leveledUp: lvlUp } = addXpToProfile(currentProf, chXp, challengeTxSource);
                if (lvlUp) {
                  leveledUp = true;
                }
                await this.updateProfile(updatedWithChall);
                await supabase.from('xp_transactions').insert({
                  profile_id: profileId,
                  source: challengeTxSource,
                  xp_amount: chXp,
                });
                totalXpEarned += chXp;

                // Award shield progress reward! Each completed quest should add shield progress percent
                await this.incrementShieldProgress(profileId, challenge.shield_reward_percent ?? 25);
              }
            }
          }

          // Update user challenge progress in DB
          await supabase.from('user_challenges').update({
            progress: Math.min(targetProgress, nextProgress),
            status: nextStatus
          }).eq('id', uc.id);
        }
      }

      return { leveledUp, xpEarned: totalXpEarned };
    } catch (e) {
      console.error("[DEBUG] Error evaluating Level 2 challenges:", e);
      return { leveledUp: false, xpEarned: 0 };
    }
  }

  // --- Daily Check-ins & Streaks ---
  public async getStreak(profileId: string): Promise<Streak> {
    const { data } = await supabase.from('streaks').select('*').eq('profile_id', profileId).maybeSingle();
    if (!data) {
      const { data: inserted } = await supabase.from('streaks').insert({
        profile_id: profileId,
        current_streak: 0,
        longest_streak: 0,
        marrow_shields_active: 1
      }).select().single();
      return mapStreak(inserted);
    }
    return mapStreak(data);
  }

  public async getCheckIns(profileId: string): Promise<DailyCheckIn[]> {
    const { data } = await supabase.from('daily_checkins').select('*').eq('profile_id', profileId);
    return data ? data.map(mapCheckin) : [];
  }

  public async completeDailyCheckIn(profileId: string, notes?: string): Promise<{ checkin: DailyCheckIn; streak: Streak; leveledUp: boolean; xpEarned: number; error?: string; shieldActivated?: boolean }> {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const { data: checkedForToday } = await supabase.from('daily_checkins').select('*').eq('profile_id', profileId).eq('check_in_date', todayStr).maybeSingle();
    if (checkedForToday) {
      const activeStreak = await this.getStreak(profileId);
      return { error: "Already completed daily communion for today. Keep hunting!", checkin: mapCheckin(checkedForToday), streak: activeStreak, leveledUp: false, xpEarned: 0 };
    }

    const { data: inserted, error } = await supabase.from('daily_checkins').insert({
      profile_id: profileId,
      check_in_date: todayStr,
      completed: true,
      notes: notes
    }).select().single();

    if (error) {
      throw new Error(error.message);
    }

    const checkin = mapCheckin(inserted);

    // Update Streak
    const userStreak = await this.getStreak(profileId);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreakValue = 1;
    let marrowShields = userStreak.marrowShieldsActive;
    let shieldActivated = false;

    if (!userStreak.lastLoggedDate) {
      // Very first daily check-in: start tracking, do NOT consume shields, do NOT trigger shield protection logs
      newStreakValue = 1;
    } else if (userStreak.lastLoggedDate === yesterdayStr) {
      newStreakValue = userStreak.currentStreak + 1;
    } else if (userStreak.lastLoggedDate === todayStr) {
      newStreakValue = userStreak.currentStreak;
    } else {
      if (userStreak.marrowShieldsActive > 0) {
        marrowShields -= 1;
        newStreakValue = userStreak.currentStreak + 1; // Preserved & incremented
        shieldActivated = true;
        await this.addShieldLog(profileId, -1, "Missed Daily Check-in Protection", "shield_used");
      } else {
        newStreakValue = 1;
      }
    }

    const longest = Math.max(newStreakValue, userStreak.longestStreak);

    const { data: updatedStreak } = await supabase.from('streaks').update({
      current_streak: newStreakValue,
      longest_streak: longest,
      last_logged_date: todayStr,
      marrow_shields_active: marrowShields,
      updated_at: new Date().toISOString()
    }).eq('profile_id', profileId).select().single();

    const streak = mapStreak(updatedStreak);

    // XP transactional log (Boosted or Normal)
    const profile = await this.getProfile(profileId);
    let leveledUp = false;
    let xpEarnings = getCheckInXp(profile);

    if (profile) {
      const { profile: updatedProfile, transaction, leveledUp: lvlCheck } = addXpToProfile(profile, xpEarnings, "Primal Daily Check-in");
      leveledUp = lvlCheck;
      await this.updateProfile(updatedProfile);

      await supabase.from('xp_transactions').insert({
        profile_id: profileId,
        source: transaction.source,
        xp_amount: xpEarnings,
      });
    }

    // Dynamic Badge triggers: first_checkin, streak_3, and streak_7
    await this.grantBadge(profileId, "first_checkin").catch(e => console.error("Primal Check-In badge error:", e));

    if (newStreakValue >= 3) {
      await this.grantBadge(profileId, "streak_3").catch(e => console.error("Marrow Defender III badge error:", e));
    }
    if (newStreakValue >= 7) {
      await this.grantBadge(profileId, "streak_7").catch(e => console.error("Carnivore Consistency badge error:", e));
    }

    // Challenge 3 (Ancestral Consistency) progress
    const { data: c3Challenge } = await supabase.from('user_challenges').select('*').eq('profile_id', profileId).eq('challenge_id', CHALLENGE_ID_MAP["c3"]).eq('status', ChallengeStatus.Active).maybeSingle();
    if (c3Challenge) {
      let status = c3Challenge.status;
      if (newStreakValue >= 3) {
        status = ChallengeStatus.Completed;
        const currentProf = await this.getProfile(profileId);
        if (currentProf) {
          const chXp = calculateXpReward("challenge", currentProf, { challengeId: "c3", rewardXp: 150 });
          const { profile: upCh, transaction: chTx } = addXpToProfile(currentProf, chXp, "Completed Challenge: Ancestral Consistency");
          await this.updateProfile(upCh);
          await supabase.from('xp_transactions').insert({ profile_id: profileId, source: chTx.source, xp_amount: chXp });
        }
      }
      await supabase.from('user_challenges').update({
        progress: newStreakValue,
        status: status
      }).eq('id', c3Challenge.id);
    }

    // Evaluate Level 2 challenges
    const lvl2Result = await this.evaluateLevel2Challenges(profileId, 'checkin');
    xpEarnings += lvl2Result.xpEarned;
    if (lvl2Result.leveledUp) {
      leveledUp = true;
    }

    return { checkin, streak, leveledUp, xpEarned: xpEarnings, shieldActivated };
  }

  // --- Fasting System ---
  public async getFastingProtocols(): Promise<FastingProtocol[]> {
    const { data } = await supabase.from('fasting_protocols').select('*');
    if (data && data.length > 0) {
      return data.map(p => ({
        id: p.id,
        name: p.name,
        targetHours: p.target_hours,
        description: p.description
      }));
    }
    return DEFAULT_PROTOCOLS;
  }

  public async getFastingMilestones(protocolId: string): Promise<FastingMilestone[]> {
    const { data } = await supabase.from('fasting_milestones').select('*').eq('protocol_id', protocolId);
    if (data && data.length > 0) {
      return data.map(m => ({
        id: m.id,
        protocolId: m.protocol_id,
        milestoneHour: m.milestone_hour,
        rewardXp: m.reward_xp || 0,
        label: m.label || ""
      }));
    }
    return DEFAULT_MILESTONES.filter((m) => m.protocolId === protocolId);
  }

  public async getActiveFastingSession(profileId: string): Promise<FastingSession | null> {
    try {
      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('profile_id', profileId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Fasting sessions DB error:", error);
        return null;
      }
      return data ? mapFastingSession(data) : null;
    } catch (err) {
      console.error("Fasting sessions exception:", err);
      return null;
    }
  }

  public async getFastingHistory(profileId: string): Promise<FastingSession[]> {
    try {
      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_time', { ascending: false });
      if (error) {
        console.error("Fasting sessions DB error:", error);
        return [];
      }
      return data ? data.map(mapFastingSession) : [];
    } catch (err) {
      console.error("Fasting sessions exception:", err);
      return [];
    }
  }

  public async startFast(profileId: string, protocolIdOrName: string): Promise<FastingSession> {
    if (!profileId) {
      throw new Error("Validation Failed: Athlete identification (profileId) is required.");
    }
    const profile = await this.getProfile(profileId);
    if (!profile) {
      throw new Error("Validation Failed: Athlete profile does not exist in critical database records.");
    }

    // Resolve protocolIdOrName to a valid database UUID
    let protocolId = protocolIdOrName;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(protocolIdOrName);
    let dbProtocol: any = null;

    if (isUuid) {
      const { data } = await supabase.from('fasting_protocols').select('id, name').eq('id', protocolIdOrName).maybeSingle();
      if (data) {
        dbProtocol = data;
        protocolId = data.id;
      }
    }

    if (!dbProtocol) {
      const nameSearching = protocolIdOrName.replace("-", ":");
      const { data } = await supabase
        .from('fasting_protocols')
        .select('id, name')
        .or(`name.eq."${protocolIdOrName}",name.eq."${nameSearching}"`)
        .maybeSingle();
      if (data) {
        dbProtocol = data;
        protocolId = data.id;
      }
    }

    if (!dbProtocol) {
      const staticProto = DEFAULT_PROTOCOLS.find(p => p.id === protocolIdOrName || p.name === protocolIdOrName || p.name === protocolIdOrName.replace("-", ":"));
      if (staticProto) {
        const { data } = await supabase.from('fasting_protocols').select('id').eq('name', staticProto.name).maybeSingle();
        if (data) {
          protocolId = data.id;
          dbProtocol = data;
        }
      }
    }

    if (!dbProtocol) {
      throw new Error(`Validation Failed: The selected fasting protocol "${protocolIdOrName}" is invalid or does not exist in public.fasting_protocols.`);
    }

    // Ensure we don't have multiple active fasts.
    // Conclude/stop existing active fasting sessions first before creating exactly one.
    const active = await this.getActiveFastingSession(profileId);
    if (active) {
      if (active.protocolId === protocolId) {
        // Reuse current active session to prevent duplicates and keep stable state
        return active;
      }
      // Conclude if there is an active session of a different protocol
      await supabase.from('fasting_sessions').update({
        status: 'stopped',
        end_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', active.id);
    }

    // Insert exactly one active fasting session into Supabase
    const { data, error } = await supabase.from('fasting_sessions').insert({
      profile_id: profileId,
      protocol_id: protocolId,
      start_time: new Date().toISOString(),
      status: 'active',
      completed: false,
    }).select().single();

    if (error) {
      throw new Error(`Database Error starting fast: ${error.message}`);
    }

    return mapFastingSession(data);
  }

  public async stopFast(profileId: string, sessionId: string, action: "pause" | "complete" | "stop", simulatedHours?: number): Promise<{ session: FastingSession; leveledUp: boolean; xpEarned: number }> {
    if (!profileId || !sessionId) {
      throw new Error("Validation Failed: Athlete profileId and sessionId are required.");
    }

    const { data: currentSession, error: fetchErr } = await supabase.from('fasting_sessions').select('*').eq('id', sessionId).single();
    if (fetchErr || !currentSession) {
      throw new Error("No active fasting session detected in database matching coordinates.");
    }

    // Check if session is already completed or stopped to prevent duplicate payouts
    if (currentSession.status === "completed" || currentSession.status === "stopped") {
      throw new Error("This fasting session has already been concluded.");
    }

    const nowStr = new Date().toISOString();
    let startTime = currentSession.start_time;

    // Get target hours
    const protocols = await this.getFastingProtocols();
    const targetSession = mapFastingSession(currentSession);
    const protocol = protocols.find(p => p.id === targetSession.protocolId);
    const targetHours = protocol ? protocol.targetHours : 16;

    // Fetch and calculate elapsed hours
    let elapsedHours = 0;
    if (typeof simulatedHours === "number") {
      elapsedHours = simulatedHours;
      const start = new Date();
      start.setMinutes(start.getMinutes() - Math.round(simulatedHours * 60));
      startTime = start.toISOString();
    } else {
      const diffMs = Date.now() - new Date(startTime).getTime();
      elapsedHours = diffMs / (1000 * 60 * 60);
    }

    // Completion rules
    const meetsTarget = elapsedHours >= targetHours;
    let completed = false;
    let status: "completed" | "stopped" | "active" | "paused" = "stopped";

    if (action === "complete" && meetsTarget) {
      completed = true;
      status = "completed";
    } else {
      completed = false;
      status = "stopped";
    }

    const { data: updatedSession, error: updateErr } = await supabase.from('fasting_sessions').update({
      status,
      completed,
      start_time: startTime,
      end_time: nowStr,
      updated_at: nowStr
    }).eq('id', sessionId).select().single();

    if (updateErr || !updatedSession) {
      throw new Error(`Database Error ending fast: ${updateErr?.message || 'Update failed'}`);
    }

    const session = mapFastingSession(updatedSession);
    let xpEarned = 0;
    let leveledUp = false;
    const initialPf = await this.getProfile(profileId);
    const initialLevel = initialPf ? initialPf.level : 1;

    // Only grant completion reward if action === "complete" AND meetsTarget
    if (action === "complete" && meetsTarget) {
      xpEarned = calculateXpReward("fasting", initialPf, { elapsedHours });

      const txSource = `Completed Fasting: ${protocol?.name || "Target"} (Session: ${sessionId})`;
      
      // double check if this XP transaction already exists for this session
      const { data: existingTx } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('profile_id', profileId)
        .eq('source', txSource)
        .maybeSingle();

      if (!existingTx) {
        const profile = await this.getProfile(profileId);
        if (profile) {
          const { profile: updatedWithXp, leveledUp: lvlUp } = addXpToProfile(profile, xpEarned, txSource);
          leveledUp = lvlUp;
          await this.updateProfile(updatedWithXp);

          try {
            await supabase.from('xp_transactions').insert({
              profile_id: profileId,
              source: txSource,
              xp_amount: xpEarned,
            });
          } catch (e) {
            console.warn("Failed to insert xp transaction:", e);
          }
        }
      }

      // Badge Check: Fast Pioneer / Autophagy Initiate (first_fast_completion) - strictly one-time
      try {
        console.log(`[DEBUG] Checking first_fast_completion fast completed badge criteria...`);
        const isGranted = await this.grantBadge(profileId, "first_fast_completion", meetsTarget);
        if (isGranted) {
          const badgeXp = calculateXpReward("badge", initialPf, { badgeId: "first_fast_completion", rewardXp: 100 });
          console.log(`[DEBUG] first_fast_completion successfully granted! ${badgeXp} XP awarded.`);
          xpEarned += badgeXp;
          const newestProfile = await this.getProfile(profileId);
          if (newestProfile) {
            leveledUp = newestProfile.level > initialLevel;
          }
        } else {
          console.log(`[DEBUG] first_fast_completion was not granted (either already unlocked or not qualified)`);
        }
      } catch (e) {
        console.warn("Failed to check/insert fasting badges:", e);
      }

      // Deep Autophagy Quest Challenge trigger (c2)
      try {
        const { data: c2Challenge } = await supabase.from('user_challenges').select('*').eq('profile_id', profileId).eq('challenge_id', CHALLENGE_ID_MAP["c2"]).eq('status', ChallengeStatus.Active).maybeSingle();
        if (c2Challenge && elapsedHours >= 18) {
          const pf2 = await this.getProfile(profileId);
          if (pf2) {
            const challengeTxSource = "Completed Challenge: Deep Autophagy Quest";
            const { data: hasChallengeTx } = await supabase.from('xp_transactions').select('*').eq('profile_id', profileId).eq('source', challengeTxSource).maybeSingle();

            if (!hasChallengeTx) {
              const chXp = calculateXpReward("challenge", pf2, { challengeId: "c2", rewardXp: 300 });
              const { profile: upPf, leveledUp: chLvlUp } = addXpToProfile(pf2, chXp, challengeTxSource);
              if (chLvlUp) {
                leveledUp = true;
              }
              await this.updateProfile(upPf);
              await supabase.from('xp_transactions').insert({
                profile_id: profileId,
                source: challengeTxSource,
                xp_amount: chXp
              });
              xpEarned += chXp;
            }
          }
          await supabase.from('user_challenges').update({
            progress: 1,
            status: ChallengeStatus.Completed
          }).eq('id', c2Challenge.id);
        }
      } catch (e) {
        console.warn("Failed to check/insert user challenges:", e);
      }

      // Evaluate Level 2 fasting challenges
      try {
        const lvl2Result = await this.evaluateLevel2Challenges(profileId, 'fast', { meetsTarget });
        xpEarned += lvl2Result.xpEarned;
        if (lvl2Result.leveledUp) {
          leveledUp = true;
        }
      } catch (err) {
        console.warn("Failed to evaluate Level 2 fasting challenges:", err);
      }
    }

    return { session, leveledUp, xpEarned };
  }

  // --- Weight Records ---
  public async getWeightLogs(profileId: string): Promise<ProgressRecord[]> {
    const { data } = await supabase.from('progress_records').select('*').eq('profile_id', profileId).order('record_date', { ascending: true });
    return data ? data.map(mapProgress) : [];
  }

  public async logWeight(profileId: string, weight: number, measurement?: string): Promise<ProgressRecord> {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const { data: existingRecord } = await supabase.from('progress_records').select('*').eq('profile_id', profileId).eq('record_date', todayStr).maybeSingle();

    let insertedRow;

    if (existingRecord) {
      const { data, error } = await supabase.from('progress_records').update({
        weight,
        body_measurement: measurement
      }).eq('id', existingRecord.id).select().single();
      if (error) throw new Error(error.message);
      insertedRow = data;
    } else {
      const { data, error } = await supabase.from('progress_records').insert({
        profile_id: profileId,
        weight,
        body_measurement: measurement,
        record_date: todayStr
      }).select().single();
      if (error) throw new Error(error.message);
      insertedRow = data;
    }

    return mapProgress(insertedRow);
  }

  public async deleteWeightRecord(id: string): Promise<void> {
    await supabase.from('progress_records').delete().eq('id', id);
  }

  // --- Challenges ---
  public async getAvailableChallenges(): Promise<any[]> {
    const { data, error } = await supabase.from('challenges').select('*');
    if (error) {
      console.warn("[DEBUG] Error fetching challenges from DB:", error);
      return [];
    }
    return data || [];
  }

  public async getUserChallenges(profileId: string): Promise<{ challenge: Challenge; userEnrollment: UserChallenge }[]> {
    const { data } = await supabase.from('user_challenges').select('*').eq('profile_id', profileId);
    if (!data) return [];

    return data.map((uc: any) => {
      const standardId = CHALLENGE_ID_MAP_REV[uc.challenge_id] || uc.challenge_id;
      const staticChallenge = DEFAULT_CHALLENGES.find((c) => c.id === standardId) || {
        id: standardId,
        title: "Active Dietary Objectives",
        description: "Maintain proper fuel log constraints.",
        durationDays: 5,
        rewardXp: 100,
      };

      return {
        challenge: staticChallenge,
        userEnrollment: mapUserChallenge(uc),
      };
    });
  }

  public async enrollInChallenge(profileId: string, challengeId: string): Promise<UserChallenge> {
    const mappedId = CHALLENGE_ID_MAP[challengeId] || challengeId;
    const { data, error } = await supabase.from('user_challenges').insert({
      profile_id: profileId,
      challenge_id: mappedId,
      progress: 0,
      status: ChallengeStatus.Active
    }).select().single();

    if (error) {
      throw new Error(error.message);
    }

    return mapUserChallenge(data);
  }

  // --- Badges & Achievements ---
  public async getUserBadges(profileId: string): Promise<Badge[]> {
    try {
      const { data: ubData, error: ubError } = await supabase.from('user_badges').select('*').eq('profile_id', profileId);
      if (ubError) {
        console.warn("[DEBUG] Error loading user badges:", ubError);
        return [];
      }
      if (!ubData || ubData.length === 0) return [];

      const { data: dbBadges } = await supabase.from('badges').select('*');
      
      const unlockedLocalIds = new Set<string>();

      for (const ub of ubData) {
        const dbBadgeId = ub.badge_id;
        
        // 1. Direct reverse-map fallback check (highest priority, immune to DB anomalies)
        const directLocalId = BADGE_ID_MAP_REV[dbBadgeId];
        if (directLocalId) {
          unlockedLocalIds.add(directLocalId);
          continue;
        }

        // 2. Query name-matching fallback from DB if it uses an auto-generated UUID
        const dbBadge = dbBadges?.find(b => b.id === dbBadgeId);
        
        if (dbBadge) {
          const dbbName = (dbBadge.name || "").toLowerCase();
          const matchedLocal = DEFAULT_BADGES.find(lb => {
            const lbName = (lb.name || "").toLowerCase();
            if (lbName === dbbName) return true;
            if (lb.requirement && lb.requirement === dbBadge.requirement) return true;
            if (BADGE_ID_MAP[lb.id] === dbBadgeId) return true;

            if (lb.id === "b_starter") {
              if (dbbName.includes("hunt") || dbbName.includes("zero-carb") || dbbName.includes("carb-zero")) return true;
            }
            if (lb.id === "b_fast_pioneer") {
              if (dbbName.includes("autophagy") || dbbName.includes("pioneer") || dbbName.includes("fast")) return true;
            }
            return false;
          });

          if (matchedLocal) {
            unlockedLocalIds.add(matchedLocal.id);
          }
        } else {
          const reverseMapped = BADGE_ID_MAP_REV[dbBadgeId] || dbBadgeId;
          const matchFromDefault = DEFAULT_BADGES.find(b => b.id === reverseMapped);
          if (matchFromDefault) {
            unlockedLocalIds.add(matchFromDefault.id);
          }
        }
      }

      console.log(`[DEBUG] Loaded unlocked local badge IDs for profile ${profileId}:`, Array.from(unlockedLocalIds));
      return DEFAULT_BADGES.filter((b) => unlockedLocalIds.has(b.id));
    } catch (err) {
      console.warn("[DEBUG] Exception in getUserBadges:", err);
      return [];
    }
  }

  public getAllTrophies(): Badge[] {
    return DEFAULT_BADGES;
  }

  public async getTransactions(profileId: string): Promise<XpTransaction[]> {
    const { data } = await supabase.from('xp_transactions').select('*').eq('profile_id', profileId).order('created_at', { ascending: false });
    return data ? data.map(mapTransaction) : [];
  }

  public async addShieldLog(
    profileId: string,
    change: number,
    reason: string,
    actionType: string
  ): Promise<ShieldLog> {
    const logData = {
      profile_id: profileId,
      shield_change: change,
      reason: reason,
      action_type: actionType,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('shield_logs')
        .insert(logData)
        .select()
        .single();
      if (!error && data) {
        console.log("[DEBUG] Successfully saved shield log to Supabase:", data);
        return mapShieldLog(data);
      } else {
        console.warn("[DEBUG] Error writing shield log to Supabase, falling back to localStorage:", error);
      }
    } catch (e) {
      console.warn("[DEBUG] Exception writing shield log to Supabase, falling back to localStorage:", e);
    }

    // LocalStorage Fallback
    const localLogsStr = localStorage.getItem(`carnyxquest_shield_logs_${profileId}`) || "[]";
    const localLogs = JSON.parse(localLogsStr);
    const mockId = "mock-" + Math.random().toString(36).substr(2, 9);
    const fallbackLog: ShieldLog = {
      id: mockId,
      profileId,
      actionType,
      shieldChange: change,
      reason,
      createdAt: logData.created_at,
    };
    localLogs.unshift(fallbackLog); // new logs first
    localStorage.setItem(`carnyxquest_shield_logs_${profileId}`, JSON.stringify(localLogs));
    return fallbackLog;
  }

  public async getShieldLogs(profileId: string): Promise<ShieldLog[]> {
    try {
      const { data, error } = await supabase
        .from('shield_logs')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(mapShieldLog);
      } else {
        console.warn("[DEBUG] Error reading shield logs from Supabase, returning localStorage fallback:", error);
      }
    } catch (e) {
      console.warn("[DEBUG] Exception reading shield logs from Supabase, returning localStorage fallback:", e);
    }

    // LocalStorage Fallback
    const localLogsStr = localStorage.getItem(`carnyxquest_shield_logs_${profileId}`) || "[]";
    return JSON.parse(localLogsStr);
  }
}

export const db = new SupabaseDB();
