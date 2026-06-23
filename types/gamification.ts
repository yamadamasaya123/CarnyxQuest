export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "fasting" | "nutrition" | "combat";
  xpReward: number;
  goldenPointsReward: number;
  targetMetric: string;
  targetValue: number;
}

export interface UserChallenge {
  id: string;
  profileId: string;
  challengeId: string;
  currentProgress: number;
  status: "active" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  challenge?: Challenge; // Joined challenge details
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  rarity: "common" | "uncommon" | "rare" | "mythic";
}

export interface UserBadge {
  id: string;
  profileId: string;
  badgeId: string;
  unlockedAt: string;
  badge?: Badge; // Joined badge details
}

export interface XPTransaction {
  id: string;
  profileId: string;
  amount: number;
  reason: string;
  createdAt: string;
}
