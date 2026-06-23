import React from "react";
import { MealLog } from "../../types/meals";
import { Heart, Activity, Flame, ShieldAlert } from "lucide-react";
import { formatDecimal } from "../../utils/formatters";
import { calculateKetoRatio } from "../../utils/calculations";

interface NutritionCardProps {
  meals: MealLog[];
}

export function NutritionCard({ meals }: NutritionCardProps) {
  // Sum everything up for active logged meals
  const totals = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.protein += meal.proteinG;
      acc.fat += meal.fatG;
      acc.carbs += meal.carbsG;
      if (meal.isCarnivorePure) acc.pureMeals += 1;
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, pureMeals: 0 }
  );

  const totalMacrosGrams = totals.protein + totals.fat + totals.carbs;
  const pPct = totalMacrosGrams > 0 ? (totals.protein / totalMacrosGrams) * 100 : 0;
  const fPct = totalMacrosGrams > 0 ? (totals.fat / totalMacrosGrams) * 100 : 0;
  const cPct = totalMacrosGrams > 0 ? (totals.carbs / totalMacrosGrams) * 100 : 0;

  const ketoRatio = calculateKetoRatio(totals.protein, totals.fat, totals.carbs);

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
      <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2">
        DAILY NUTRITIONAL DEPLOYMENT (CONCORDANCE METRICS)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Calories */}
        <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg text-center space-y-1">
          <span className="text-[9px] text-slate-500 font-bold font-mono tracking-wider uppercase block">DAILY CALORIES</span>
          <div className="text-sm font-black font-mono text-slate-100">{totals.calories} kcal</div>
          <span className="text-[8px] text-slate-600 font-mono italic block">Skeletal fuel density</span>
        </div>

        {/* Metric 2: Protein */}
        <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg text-center space-y-1">
          <span className="text-[9px] text-slate-500 font-bold font-mono tracking-wider uppercase block">TOTAL PROTEIN</span>
          <div className="text-sm font-black font-mono text-emerald-400">{totals.protein} g</div>
          <span className="text-[8px] text-slate-600 font-mono block">{formatDecimal(pPct, 0)}% of intake weight</span>
        </div>

        {/* Metric 3: Lipids (Fat) */}
        <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg text-center space-y-1">
          <span className="text-[9px] text-slate-500 font-bold font-mono tracking-wider uppercase block">TOTAL LIPIDS</span>
          <div className="text-sm font-black font-mono text-amber-500">{totals.fat} g</div>
          <span className="text-[8px] text-slate-600 font-mono block">{formatDecimal(fPct, 0)}% of intake weight</span>
        </div>

        {/* Metric 4: Ketone Generator Index (Keto Ratio) */}
        <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg text-center space-y-1">
          <span className="text-[9px] text-slate-500 font-bold font-mono tracking-wider uppercase block">METABOLIC ADAPT INDEX</span>
          <div className="text-sm font-black font-mono text-indigo-400">
            {ketoRatio > 0 ? `${ketoRatio} : 1` : "N/A"}
          </div>
          <span className="text-[8px] text-slate-600 font-mono block">
            {ketoRatio >= 1.5 ? "Deep Lipid Burn" : "Standard Adapt Level"}
          </span>
        </div>
      </div>

      {meals.length > 0 && (
        <div className="pt-2 text-[10px] font-mono text-slate-500 flex justify-between items-center bg-slate-900/10 p-2 border border-slate-900 border-dashed rounded-lg">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Pure Carnivore logs: <strong className="text-slate-300">{totals.pureMeals} of {meals.length} logs</strong>
          </span>
          <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold">
            {totals.carbs === 0 ? "STABLE PYRUVIC DEPRESSION" : "GLUCONEOGENESIS ACTIVE"}
          </span>
        </div>
      )}
    </div>
  );
}

export default NutritionCard;
