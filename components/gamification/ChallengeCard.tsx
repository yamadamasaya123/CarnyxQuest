import React from "react";
import { UserChallenge } from "../../types/gamification";
import { Trophy, HelpCircle, Star, ArrowRight, CheckCircle } from "lucide-react";
import ProgressBar from "../ui/ProgressBar";

interface ChallengeCardProps {
  challenge: UserChallenge;
  onClaimReward?: () => void;
}

export function ChallengeCard({ challenge, onClaimReward }: ChallengeCardProps) {
  const isCompleted = challenge.status === "completed";
  const progressRatio = Math.min(100, Math.round((challenge.currentProgress / (challenge.challenge?.targetValue || 1)) * 100));

  return (
    <div className={`border rounded-xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all ${
      isCompleted
        ? "bg-amber-500/5 border-amber-500/20 shadow-md"
        : "bg-slate-950 border-slate-900"
    }`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h4 className={`text-xs font-black font-mono tracking-wide uppercase ${isCompleted ? "text-amber-500" : "text-slate-200"}`}>
              {challenge.challenge?.title || "Primal Quest"}
            </h4>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              {challenge.challenge?.description}
            </p>
          </div>

          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
            isCompleted
              ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
              : "bg-slate-900 border-slate-800 text-slate-500"
          }`}>
            <Trophy className="w-4 h-4" />
          </div>
        </div>

        {/* Quest Rewards */}
        <div className="flex gap-3 flex-wrap text-[9px] font-mono">
          <span className="bg-amber-600/10 text-amber-400 border border-amber-600/20 px-2 py-0.5 rounded font-bold uppercase">
            +{challenge.challenge?.xpReward} XP Coordinates
          </span>
          <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-bold uppercase">
            +{challenge.challenge?.goldenPointsReward} Golden Points
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-900/60 text-xs">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-500">
            Target parameter: <strong className="text-slate-400 font-bold capitalize">{challenge.challenge?.targetMetric}</strong>
          </span>
          <span className={isCompleted ? "text-amber-500 font-bold" : "text-slate-400 font-bold"}>
            {challenge.currentProgress} / {challenge.challenge?.targetValue} ({progressRatio}%)
          </span>
        </div>

        <ProgressBar 
          percentage={progressRatio} 
          color={isCompleted ? "from-amber-500 to-amber-600 animate-pulse" : "from-slate-700 to-slate-500"} 
        />

        {isCompleted && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-500 font-bold text-right justify-end pt-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>COMMITTED COVENANT COMPLETED</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChallengeCard;
