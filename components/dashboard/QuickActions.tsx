import React from "react";
import { Flame, Clock, PlusSquare, Scale, CalendarCheck } from "lucide-react";
import Button from "../ui/Button";

interface QuickActionsProps {
  onCheckIn: () => void;
  onQuickMealLog: () => void;
  onFastingShortcut: () => void;
  onUpdateWeightLog: () => void;
  isCheckInCompleted: boolean;
}

export function QuickActions({
  onCheckIn,
  onQuickMealLog,
  onFastingShortcut,
  onUpdateWeightLog,
  isCheckInCompleted
}: QuickActionsProps) {
  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 shadow-lg">
      <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2">
        SURVIVOR SHORTCUTS
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CHECK-IN */}
        <button
          onClick={onCheckIn}
          disabled={isCheckInCompleted}
          className={`flex items-center gap-3 p-3 rounded-xl border transition text-left cursor-pointer ${
            isCheckInCompleted
              ? "bg-slate-900/40 border-slate-900 text-slate-500 cursor-not-allowed"
              : "bg-amber-600/5 hover:bg-amber-600/10 border-amber-500/25 text-amber-400"
          }`}
        >
          <CalendarCheck className="w-5 h-5 shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-black font-mono tracking-wider block">DAILY COVENANT</span>
            <span className="text-[10px] text-slate-500 truncate block">
              {isCheckInCompleted ? "Ascribed Secured" : "Log Mood & Earn +20 XP"}
            </span>
          </div>
        </button>

        {/* QUICK RIBEYE */}
        <button
          onClick={onQuickMealLog}
          className="flex items-center gap-3 p-3 rounded-xl border bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 text-left cursor-pointer"
        >
          <PlusSquare className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-black font-mono tracking-wider block">ACQUIRE PREY MEAL</span>
            <span className="text-[10px] text-slate-500 truncate block">Log 300g Ribeye instantly</span>
          </div>
        </button>

        {/* FASTING SHORTCUT */}
        <button
          onClick={onFastingShortcut}
          className="flex items-center gap-3 p-3 rounded-xl border bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 text-left cursor-pointer"
        >
          <Clock className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-black font-mono tracking-wider block">AUTOPHAGY SHIFT</span>
            <span className="text-[10px] text-slate-500 truncate block">Tune or review protocols</span>
          </div>
        </button>

        {/* METRICS / WEIGHT */}
        <button
          onClick={onUpdateWeightLog}
          className="flex items-center gap-3 p-3 rounded-xl border bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 text-left cursor-pointer"
        >
          <Scale className="w-5 h-5 text-sky-500 shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-black font-mono tracking-wider block">LOG BODY WEIGHT</span>
            <span className="text-[10px] text-slate-500 truncate block">Refine current progress stats</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default QuickActions;
