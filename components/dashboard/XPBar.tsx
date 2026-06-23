import React from "react";
import { ProgressBar } from "../ui/ProgressBar";
import { calculateXpPercentage } from "../../utils/calculations";
import { getRequiredXpForLevel } from "../../lib/gamification";
import { Zap } from "lucide-react";

interface XPBarProps {
  xp: number;
  level: number;
}

export function XPBar({ xp, level }: XPBarProps) {
  const nextLevelXp = getRequiredXpForLevel(level);
  const percent = calculateXpPercentage(xp, level);
  const remaining = Math.max(0, nextLevelXp - xp);

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 md:p-5 space-y-3 shadow-md relative overflow-hidden">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold font-mono text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500/10" />
          Metabolic Ascent Threshold
        </span>
        <span className="font-mono text-[11px] text-amber-500 font-bold">
          {xp} / {nextLevelXp} XP ({percent}%)
        </span>
      </div>

      <ProgressBar percentage={percent} />

      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
        <span>Primal Tier: {level}</span>
        <span>Secure {remaining} raw XP coordinates to strike Tier {level + 1}</span>
      </div>
    </div>
  );
}

export default XPBar;
