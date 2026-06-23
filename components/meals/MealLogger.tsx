import React, { useState } from "react";
import { PRIMAL_FOOD_CATALOG, createMealLog } from "../../lib/nutrition";
import { validateMealInput } from "../../lib/validation";
import Button from "../ui/Button";
import { PlusCircle, Search, HelpCircle, Star, AlertTriangle, Salad } from "lucide-react";

interface MealLoggerProps {
  profileId: string;
  onSuccess: (xp: number, levelUp: boolean) => void;
  onCancel?: () => void;
}

export function MealLogger({ profileId, onSuccess, onCancel }: MealLoggerProps) {
  const [name, setName] = useState<string>("");
  const [weightG, setWeightG] = useState<number>(300);
  const [isCarnivore, setIsCarnivore] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Manual nutrition inputs
  const [calories, setCalories] = useState<number>(650);
  const [protein, setProtein] = useState<number>(60);
  const [fat, setFat] = useState<number>(45);
  const [carbs, setCarbs] = useState<number>(0);

  // Handle Preset select
  const handleSelectPreset = (preset: typeof PRIMAL_FOOD_CATALOG[0]) => {
    setName(preset.name);
    setIsCarnivore(preset.pureCarnivore);
    // Scale macro values based on default 300g portion (preset is per 100g)
    const factor = weightG / 100;
    setCalories(Math.round(preset.calories * factor));
    setProtein(Math.round(preset.protein * factor));
    setFat(Math.round(preset.fat * factor));
    setCarbs(Math.round(preset.carbs * factor));
  };

  // Re-calculate macros when weight shifts
  const handleWeightShift = (newWeightStr: string) => {
    const freshW = parseInt(newWeightStr) || 0;
    setWeightG(freshW);

    // Look up if current name matches one of the presets to automatically adjust macros
    const preset = PRIMAL_FOOD_CATALOG.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (preset && freshW > 0) {
      const factor = freshW / 100;
      setCalories(Math.round(preset.calories * factor));
      setProtein(Math.round(preset.protein * factor));
      setFat(Math.round(preset.fat * factor));
      setCarbs(Math.round(preset.carbs * factor));
    }
  };

  const handlePrimalLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const validation = validateMealInput(name, weightG);
    if (!validation.isValid) {
      setLocalError(validation.error || "Invalid input parameters.");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await createMealLog(
        profileId,
        name,
        weightG,
        {
          calories,
          protein,
          fat,
          carbs,
          source: "Primal Catalog Lookup"
        },
        isCarnivore
      );

      if (resp) {
        onSuccess(resp.isCarnivorePure ? 30 : 20, false);
        // Reset state
        setName("");
        setWeightG(300);
      } else {
        setLocalError("Failed to register structural coordinates to Supabase.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Request timed out.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-6">
      <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase">
            LOG ACQUIRED PREY MEAL
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            Secure metabolic fuel parameters and calculate sirtuin ratios.
          </span>
        </div>
      </div>

      {localError && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-100 p-3 rounded-lg text-[11px] font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      {/* QUICK PRESETS */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wider uppercase block">
          TRIBAL PRESET COORDINATES (USDA VALUES PER 100G)
        </span>
        <div className="flex gap-2 flex-wrap max-h-36 overflow-y-auto pr-1">
          {PRIMAL_FOOD_CATALOG.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() => handleSelectPreset(f)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-1.5 transition"
            >
              <Star className="w-3 h-3 text-amber-500 shrink-0" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handlePrimalLog} className="space-y-4">
        {/* Input: Name */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-bold font-mono tracking-wider uppercase block">
            PREY MEAL DESCRIPTION/NAME
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grass-Fed Ribeye Slab, Salted Venison Jerky..."
              className="w-full bg-slate-900 border border-slate-850 focus:border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none placeholder-slate-600 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input: Portions Weight */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold font-mono tracking-wider uppercase block">
              ACQUIRED PORTION WEIGHT (GRAMS)
            </label>
            <input
              type="number"
              required
              min="1"
              value={weightG}
              onChange={(e) => handleWeightShift(e.target.value)}
              placeholder="300"
              className="w-full bg-slate-900 border border-slate-850 focus:border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 outline-none transition"
            />
          </div>

          {/* Toggle: pure carnivore */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold font-mono tracking-wider uppercase block">
              CARNIVORE ALIGNMENT INDEX
            </label>
            <button
              type="button"
              onClick={() => setIsCarnivore(!isCarnivore)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-mono transition ${
                isCarnivore
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-900/60 border-slate-850 text-slate-500"
              }`}
            >
              <span>{isCarnivore ? "100% Pure Carnivore (0g Carb)" : "Omnivore/Plant trace inclusion"}</span>
              <Salad className={`w-4 h-4 ${isCarnivore ? "text-emerald-500" : "text-slate-600"}`} />
            </button>
          </div>
        </div>

        {/* Nutritional coordinates breakdown preview */}
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900/80 space-y-3">
          <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wider uppercase block">
            CALORIC METRIC BALANCE
          </span>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-mono block">PROTEIN</span>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 rounded text-center py-1 text-xs text-slate-200 font-mono outline-none"
              />
              <span className="text-[9px] text-slate-600 font-mono block">g</span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-mono block">LIPIDS (FAT)</span>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 rounded text-center py-1 text-xs text-slate-200 font-mono outline-none"
              />
              <span className="text-[9px] text-slate-600 font-mono block">g</span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-mono block">CARBS</span>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 rounded text-center py-1 text-xs text-slate-200 font-mono outline-none"
              />
              <span className="text-[9px] text-slate-600 font-mono block">g</span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-mono block">CALORIES</span>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-900 rounded text-center py-1 text-xs text-slate-200 font-mono outline-none"
              />
              <span className="text-[9px] text-slate-600 font-mono block">kcal</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            variant="amber"
            disabled={submitting}
            className="flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? "SEALING METABOLIC ENTRY..." : "SECURE PREY TARGET"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default MealLogger;
