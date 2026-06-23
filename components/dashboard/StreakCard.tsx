import React from "react";
import { Flame, Medal, Award } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg relative overflow-hidden flex items-center justify-between">
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-600/5 blur-xl rounded-full"></div>

      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
          currentStreak > 0 
            ? "bg-orange-600/10 border border-orange-500/25 text-orange-500 animate-pulse" 
            : "bg-slate-900 border border-slate-800 text-slate-500"
        }`}>
          <Flame className="w-6 h-6 fill-current" />
        </div>
        
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wider uppercase block">METABOLIC FIRE STREAK</span>
          <div className="text-xl font-black font-mono text-slate-100 flex items-center gap-1.5">
            <span>{currentStreak} Consec. Days</span>
            {currentStreak >= 3 && (
              <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded uppercase font-bold font-mono">
                STABLE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right space-y-0.5">
        <span className="text-[10px] text-slate-500 font-bold font-mono uppercase block">SECURED PEAK</span>
        <div className="text-sm font-bold font-mono text-amber-500 flex items-center justify-end gap-1">
          <Award className="w-3.5 h-3.5" />
          <span>{longestStreak} Days</span>
        </div>
      </div>
    </div>
  );
}

export default StreakCard;
