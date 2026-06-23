import React from "react";
import { ShieldAlert, Medal, Trophy } from "lucide-react";

interface LevelDisplayProps {
  level: number;
}

export function LevelDisplay({ level }: LevelDisplayProps) {
  // Primal Tier title based on level increments
  const getTierTitle = (lvl: number) => {
    if (lvl >= 15) return "Marrow Overlord xv";
    if (lvl >= 10) return "Sovereign Berserker x";
    if (lvl >= 5) return "Elder Pathfinder v";
    return "Fledgling Tribesman i";
  };

  const getTierProgressIcon = (lvl: number) => {
    if (lvl >= 10) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (lvl >= 5) return <Medal className="w-5 h-5 text-indigo-400" />;
    return <ShieldAlert className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 md:p-5 flex items-center justify-between shadow-md relative overflow-hidden">
      <div className="space-y-1">
        <span className="text-[10px] text-slate-500 font-bold font-mono tracking-widest block uppercase">CURRENT LEVEL RANK</span>
        <div className="flex items-center gap-2">
          {getTierProgressIcon(level)}
          <span className="text-sm font-black text-slate-200 tracking-wide font-mono uppercase">{getTierTitle(level)}</span>
        </div>
      </div>

      <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/25 rounded-xl flex items-center justify-center font-black text-lg text-amber-500 font-mono shadow-inner">
        {level}
      </div>
    </div>
  );
}

export default LevelDisplay;
