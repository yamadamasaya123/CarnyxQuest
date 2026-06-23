import { getRequiredXpForLevel } from "../lib/gamification";

/**
 * Calculates current XP progress as a percentage towards leveling up.
 */
export function calculateXpPercentage(xp: number, level: number): number {
  const needed = getRequiredXpForLevel(level);
  if (needed <= 0) return 0;
  return Math.min(100, Math.round((xp / needed) * 100));
}

/**
 * Calculates total calories from macros (Keto standard yields: P:4, F:9, C:4)
 */
export function calculateCaloriesFromMacros(proteinG: number, fatG: number, carbsG: number): number {
  return (proteinG * 4) + (fatG * 9) + (carbsG * 4);
}

/**
 * Calculates keto ratio: (Fat) / (Protein + Carbs). Excellent for pure metabolic keto checks.
 */
export function calculateKetoRatio(proteinG: number, fatG: number, carbsG: number): number {
  const base = proteinG + carbsG;
  if (base === 0) return 0;
  return parseFloat((fatG / base).toFixed(2));
}

/**
 * Calculates dynamic weight changes. Fits positive or negative weights nicely.
 */
export function calculateWeightDifferential(current: number, baseline: number): { diff: string; status: "loss" | "gain" | "neutral" } {
  const delta = current - baseline;
  const formatted = Math.abs(delta).toFixed(1);
  if (delta < 0) {
    return { diff: `-${formatted} kg`, status: "loss" };
  } else if (delta > 0) {
    return { diff: `+${formatted} kg`, status: "gain" };
  }
  return { diff: "0.0 kg", status: "neutral" };
}
