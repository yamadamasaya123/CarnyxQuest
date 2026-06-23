export type PrimalClass = "Chieftain" | "Hunter" | "gatherer" | "Berserker" | "Shaman";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  primalClass: PrimalClass;
  level: number;
  xp: number;
  goldenPoints: number;
  createdAt: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
}
