"use client";

import React, { useState, useEffect } from "react";
import LayoutWrapper from "../../components/ui/LayoutWrapper";
import MealLogger from "../../components/meals/MealLogger";
import NutritionCard from "../../components/meals/NutritionCard";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { fetchUserMeals } from "../../lib/nutrition";
import { MealLog } from "../../types/meals";
import { formatDate } from "../../utils/formatters";
import { Sparkles, Soup, Heart, ShieldAlert, BookOpen } from "lucide-react";

export default function MealsPage() {
  const { user } = useAuth();
  const { refreshProfile } = useProfile(user?.id);
  
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  const loadMealsRecords = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const list = await fetchUserMeals(user.id);
      setMeals(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
       loadMealsRecords();
    }
  }, [user?.id]);

  const handleMealLoggedSuccess = async (earnedXp: number) => {
    triggerToast(`Prey target added successfully to ledger! Gained +${earnedXp} XP coordinates.`);
    await loadMealsRecords();
    await refreshProfile();
  };

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest animate-pulse">
          Retrieving Meat Provisions...
        </span>
      </div>
    );
  }

  return (
    <LayoutWrapper activeNav="meals">
      
      {/* TOAST PANEL */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/40 text-emerald-100 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slideIn max-w-sm">
          <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-xs font-mono font-medium leading-relaxed">{notification}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* ROW 1: CALORIC SUMMARIES BAR */}
        <NutritionCard meals={meals} />

        {/* ROW 2: DETAILED FORM FOR ACQUISITION MEALS */}
        {user?.id && (
          <MealLogger 
            profileId={user.id} 
            onSuccess={handleMealLoggedSuccess} 
          />
        )}

        {/* ROW 3: DETAILED MEAL LOG HISTORY ITEMS */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-4 font-mono text-xs">
          <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            INDIVIDUAL MEAL LEDGER
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meals.length > 0 ? (
              meals.map((m) => (
                <div 
                  key={m.id}
                  className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3 hover:border-slate-800 transition"
                >
                  <div className="flex justify-between items-start gap-2 border-b border-slate-900 pb-2">
                    <div className="space-y-0.5">
                      <span className="text-slate-200 font-extrabold block truncate max-w-[180px]">{m.name}</span>
                      <span className="text-[10px] text-slate-555 block">{formatDate(m.createdAt)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-amber-500 font-bold block">{m.weightG}g Portion</span>
                      <span className="text-[9px] text-slate-500 font-semibold">{m.calories} kcal</span>
                    </div>
                  </div>

                  {/* Macros breakdown tags */}
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex gap-2.5">
                      <span>P: <strong className="text-emerald-400">{m.proteinG}g</strong></span>
                      <span>F: <strong className="text-amber-500">{m.fatG}g</strong></span>
                      <span>C: <strong className="text-white">{m.carbsG}g</strong></span>
                    </div>

                    {m.isCarnivorePure && (
                      <span className="bg-emerald-550/10 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/25 flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        <span>PURE PREY</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-12 space-y-2 font-mono">
                <Soup className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-slate-500 text-xs">No food records completed inside the current Supabase tables.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </LayoutWrapper>
  );
}
export { MealsPage };
