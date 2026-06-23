import React from "react";
import { Badge } from "../../types/gamification";
import { ShieldCheck, Flame, Award, Heart, Skull, Milestone } from "lucide-react";
import { formatDate } from "../../utils/formatters";

interface BadgeCardProps {
  badge: Badge;
  unlockedAt?: string;
}

export function BadgeCard({ badge, unlockedAt }: BadgeCardProps) {
  const isUnlocked = !!unlockedAt;

  const rarityStyles: Record<string, { ring: string; text: string; bg: string; border: string }> = {
    common: { 
      ring: "group-hover:ring-slate-800", 
      text: "text-slate-400", 
      bg: "bg-slate-900/40", 
      border: "border-slate-800"
    },
    uncommon: { 
      ring: "group-hover:ring-teal-800", 
      text: "text-teal-400", 
      bg: "bg-teal-950/10", 
      border: "border-teal-900/20"
    },
    rare: { 
      ring: "group-hover:ring-sky-800", 
      text: "text-sky-400", 
      bg: "bg-sky-950/10", 
      border: "border-sky-950"
    },
    mythic: { 
      ring: "group-hover:ring-amber-500/40", 
      text: "text-amber-500", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/15"
    }
  };

  const currentStyles = rarityStyles[badge.rarity] || rarityStyles["common"];

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "first_meal_logged":
        return <Award className="w-5 h-5" />;
      case "streak_3":
        return <Flame className="w-5 h-5 fill-current" />;
      case "streak_7":
        return <Skull className="w-5 h-5" />;
      case "first_fast_completed":
        return <Milestone className="w-5 h-5" />;
      default:
        return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className={`group border rounded-xl p-4 flex gap-4 transition-all duration-300 relative overflow-hidden ${
      isUnlocked 
        ? `${currentStyles.bg} ${currentStyles.border} shadow-md` 
        : "bg-slate-950/40 border-slate-900 opacity-50"
    }`}>
      {/* Badge Icon Frame */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
        isUnlocked 
          ? `${currentStyles.border} ${currentStyles.text} bg-slate-900/80` 
          : "border-slate-850 text-slate-600 bg-slate-900/20"
      }`}>
        {getBadgeIcon(badge.iconName)}
      </div>

      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2.5">
          <span className={`text-[11px] font-black font-mono tracking-wider uppercase block truncate ${
            isUnlocked ? "text-slate-100" : "text-slate-500"
          }`}>
            {badge.name}
          </span>
          <span className={`text-[8px] font-bold font-mono uppercase px-1.5 py-0.5 rounded border leading-none ${currentStyles.text} ${currentStyles.border}`}>
            {badge.rarity}
          </span>
        </div>

        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
          {badge.description}
        </p>

        {isUnlocked && unlockedAt && (
          <span className="text-[9px] font-mono text-slate-650 block pt-1">
            Unlocked {formatDate(unlockedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

export default BadgeCard;
