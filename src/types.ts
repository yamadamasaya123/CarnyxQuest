export enum PrimalClass {
  Chieftain = "Chieftain",
  Reaver = "Reaver",
  Slayer = "Slayer",
}

export enum KetoRatio {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

export enum ChallengeStatus {
  Active = "active",
  Completed = "completed",
  Failed = "failed",
}

export interface UserProfile {
  id: string;
  displayName: string;
  primalClass: PrimalClass;
  level: number;
  experience: number;
  goldPoints: number;
  createdAt: string;
}

export interface NutritionData {
  id: string;
  foodName: string;
  usdaFoodId: string;
  servingSize: number; // reference size (e.g., 100g)
  calories: number;
  proteinGrams: number;
  fatGrams: number;
}

export interface MealLog {
  id: string;
  profileId: string;
  nutritionId?: string;
  cutType: string;
  ketoRatio: KetoRatio;
  weightGrams: number;
  isCarbZero: boolean;
  notes?: string;
  loggedAt: string;
}

export interface Streak {
  id: string;
  profileId: string;
  currentStreak: number;
  longestStreak: number;
  marrowShieldsActive: number;
  lastLoggedDate?: string;
  updatedAt: string;
  shieldProgressPercent?: number;
}

export interface DailyCheckIn {
  id: string;
  profileId: string;
  checkInDate: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  rewardXp: number;
  minimumLevel?: number;
  challengeKind?: string;
  targetValue?: number;
  unitLabel?: string;
  shieldRewardPercent?: number;
}

export interface UserChallenge {
  id: string;
  profileId: string;
  challengeId: string;
  progress: number; // days completed
  status: ChallengeStatus;
  joinedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string; // e.g. 'streak_7', 'meat_logged'
  rewardXp: number;
}

export interface UserBadge {
  id: string;
  profileId: string;
  badgeId: string;
  unlockedAt: string;
}

export interface ProgressRecord {
  id: string;
  profileId: string;
  weight: number;
  bodyMeasurement?: string;
  recordDate: string; // YYYY-MM-DD
}

export interface XpTransaction {
  id: string;
  profileId: string;
  source: string; // 'Daily Check-in', 'Food Logging', 'Challenge Completion', 'Badge Unlock' etc.
  xpAmount: number;
  createdAt: string;
}

export interface FastingProtocol {
  id: string;
  name: string;
  targetHours: number;
  description: string;
}

export interface FastingSession {
  id: string;
  profileId: string;
  protocolId: string;
  startTime: string; // ISO String
  endTime?: string; // ISO String
  status: "active" | "paused" | "completed" | "stopped";
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FastingMilestone {
  id: string;
  protocolId: string;
  milestoneHour: number;
  rewardXp: number;
  label: string;
}

export interface WorkoutLog {
  id: string;
  profileId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg: number;
  durationMinutes: number;
  notes?: string;
  wgerExerciseId?: number;
  workoutDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface ShieldLog {
  id: string;
  profileId: string;
  actionType: string; // 'gain' | 'use'
  shieldChange: number; // e.g. 1 or -1
  reason: string;
  createdAt: string;
}
