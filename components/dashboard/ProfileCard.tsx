import React from "react";
import { UserProfile } from "../../types/user";
import { Award, Zap, Shield, Sparkles } from "lucide-react";

interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const classBadges: Record<string, { label: string; bg: string; border: string; iconColor: string; description: string }> = {
    Chieftain: { 
      label: "CHIEFTAIN CLANSMAN", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/20", 
      iconColor: "text-amber-500",
      description: "Tribal leader. Guides metabolic schedules with deep spiritual strength." 
    },
    Hunter: { 
      label: "STEALTH HUNTER", 
      bg: "bg-emerald-500/10", 
      border: "border-emerald-500/20", 
      iconColor: "text-emerald-500",
      description: "Prey gatherer. High-efficiency physical hunter tracking down complete macro balances." 
    },
    gatherer: { 
      label: "PRIMAL GATHERER", 
      bg: "bg-sky-500/10", 
      border: "border-sky-500/20", 
      iconColor: "text-sky-500",
      description: "Resource conservator. Optimizes prolonged autophagy cycles and micro-recoveries."
    },
    Berserker: { 
      label: "RAGED BERSERKER", 
      bg: "bg-red-500/10", 
      border: "border-red-500/20", 
      iconColor: "text-red-500",
      description: "Combat powerhouse. Drives deep lipid-phase adaptations with fierce resistance." 
    },
    Shaman: { 
      label: "AUTOPHAGY SHAMAN", 
      bg: "bg-purple-500/10", 
      border: "border-purple-500/20", 
      iconColor: "text-purple-500",
      description: "Cellular wizard. Aligns intestinal stem cell regeneration periods flawlessly." 
    }
  };

  const badge = classBadges[profile.primalClass] || classBadges["Chieftain"];

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="flex items-center gap-4">
        {/* Primal Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow-inner">
          <Award className={`w-8 h-8 ${badge.iconColor}`} />
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">
            LVL {profile.level}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-white tracking-wide">{profile.displayName}</h3>
            <span className={`text-[9px] px-2 py-0.5 font-bold font-mono uppercase tracking-widest rounded border ${badge.bg} ${badge.border} ${badge.iconColor}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 capitalize max-w-sm font-sans">{badge.description}</p>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="flex items-center gap-4 border-t border-slate-900 pt-4 md:pt-0 md:border-0">
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 text-center space-y-0.5 min-w-[90px]">
          <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wider uppercase block">GOLD POINTS</span>
          <div className="text-lg font-black font-mono text-amber-500 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span>{profile.goldenPoints}</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 text-center space-y-0.5 min-w-[90px]">
          <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wider uppercase block">EXP LEVELS</span>
          <div className="text-lg font-black font-mono text-slate-200 flex items-center justify-center gap-1">
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500/25" />
            <span>{profile.xp} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProfileCard;
