import React from "react";
import { WATER_MILESTONES, MilestoneInfo } from "../../lib/fasting";
import { HeartCrack, ShieldCheck, Flame, Cpu, ToggleLeft, Activity, Trophy } from "lucide-react";

interface MilestoneTrackerProps {
  elapsedSeconds: number;
}

export function MilestoneTracker({ elapsedSeconds }: MilestoneTrackerProps) {
  const elapsedHours = elapsedSeconds / 3600;

  const milestoneIcons: Record<number, React.ReactNode> = {
    4: <Activity className="w-4 h-4 text-emerald-500" />,
    8: <Cpu className="w-4 h-4 text-sky-500" />,
    12: <Cpu className="w-4 h-4 text-sky-500" />,
    16: <Flame className="w-4 h-4 text-amber-500" />,
    24: <ShieldCheck className="w-4 h-4 text-purple-500" />,
    30: <Trophy className="w-4 h-4 text-rose-500" />,
    36: <Trophy className="w-4 h-4 text-rose-500" />
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 shadow-lg">
      <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2">
        METABOLIC MILESTONES (WATER RECONNAISSANCE)
      </h3>

      <div className="space-y-3 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-900 before:pointer-events-none">
        {WATER_MILESTONES.map((milestone) => {
          const isReached = elapsedHours >= milestone.hoursReached;
          return (
            <div 
              key={milestone.hoursReached}
              className={`flex items-start gap-4 p-2 rounded-lg transition-colors relative z-10 ${
                isReached ? "bg-slate-900/40" : "opacity-40"
              }`}
            >
              {/* Node Circle */}
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border text-xs font-black font-mono ${
                isReached
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {milestone.hoursReached}h
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black font-mono tracking-wide ${isReached ? "text-slate-200" : "text-slate-500"}`}>
                    {milestone.milestoneName}
                  </span>
                  {isReached && (
                    <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 font-bold font-mono rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-sans max-w-md">
                  {milestone.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MilestoneTracker;
