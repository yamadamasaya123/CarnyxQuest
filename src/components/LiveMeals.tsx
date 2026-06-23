import React, { useState, useEffect } from "react";
import { KetoRatio } from "../types";
import { db } from "../lib/db";
import {
  Flame,
  Search,
  CheckCircle2,
  TrendingUp,
  Scale,
  ChevronDown,
  Beef,
  Plus,
  Compass,
  Loader2,
} from "lucide-react";

interface LiveMealsProps {
  profileId: string;
  onLoggedSuccess: (xpEarned: number, leveledUp: boolean) => void;
  onSuccessNotification?: (message: string) => void;
}

export default function LiveMeals({ profileId, onLoggedSuccess, onSuccessNotification }: LiveMealsProps) {
  // Input fields
  const [foodNameInput, setFoodNameInput] = useState<string>(""); // USDA or Custom name
  const [weightGramsInput, setWeightGramsInput] = useState<string>("100");
  const weightGrams = parseInt(weightGramsInput, 10) || 0;
  const [notes, setNotes] = useState<string>("");
  const [ketoRatio, setKetoRatio] = useState<KetoRatio>(KetoRatio.Medium);
  const [isCarbZero, setIsCarbZero] = useState<boolean>(true);

  // Nutritional values derived or entered
  const [calories, setCalories] = useState<number>(291);
  const [proteinGrams, setProteinGrams] = useState<number>(24);
  const [fatGrams, setFatGrams] = useState<number>(22);

  // Search states
  const [usdaSearchQuery, setUsdaSearchQuery] = useState<string>("");
  const [usdaSuggestions, setUsdaSuggestions] = useState<any[]>([]);
  const [usdaLoading, setUsdaLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [usdaSearchWarning, setUsdaSearchWarning] = useState<string | null>(null);

  // History list
  const [mealsHistory, setMealsHistory] = useState<any[]>([]);

  const loadMeals = async () => {
    const list = await db.getMeals(profileId);
    setMealsHistory(list);
  };

  useEffect(() => {
    loadMeals();
  }, [profileId]);

  // Handle USDA Live Search Change
  const handleUsdaQueryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsdaSearchQuery(val);

    if (val.trim().length < 3) {
      setUsdaSuggestions([]);
      setUsdaSearchWarning(null);
      return;
    }

    setUsdaLoading(true);
    setUsdaSearchWarning(null);
    try {
      const response = await fetch(`/api/usda-proxy?query=${encodeURIComponent(val)}`);
      if (response.ok) {
        const data = await response.json();
        setUsdaSuggestions(data.foods || []);
        if (data.usingFallback) {
          setUsdaSearchWarning(data.warning || "USDA search unavailable");
        } else {
          setUsdaSearchWarning(null);
        }
      } else {
        setUsdaSearchWarning("USDA search unavailable");
      }
    } catch (err) {
      console.error("USDA live search fails:", err);
      setUsdaSearchWarning("USDA search unavailable");
    } finally {
      setUsdaLoading(false);
    }
  };

  // Autocomplete select suggestion
  const selectUsdaSuggestion = (item: any) => {
    setFoodNameInput(item.foodName);
    setCalories(item.calories);
    setProteinGrams(item.proteinGrams);
    setFatGrams(item.fatGrams);

    // Is carb zero?
    const nameLower = item.foodName.toLowerCase();
    const hasCarb = nameLower.includes("honey") || nameLower.includes("berry") || nameLower.includes("carbohydrate");
    setIsCarbZero(!hasCarb);

    setUsdaSuggestions([]);
    setUsdaSearchQuery("");
  };

  // Handle final save meal log
  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (weightGrams <= 0) {
      alert("Please enter a valid portion size greater than 0 grams.");
      return;
    }

    const finalItemName = foodNameInput.trim() || `${weightGrams}g Carnivore Meal`;

    setIsSubmitting(true);
    try {
      const res = await db.logMeal(profileId, {
        cutType: finalItemName,
        weightGrams,
        notes,
        calories,
        proteinGrams,
        fatGrams,
        isCarbZero,
        ketoRatio,
      });

      onLoggedSuccess(res.xpEarned, res.leveledUp);
      
      if (res.shieldActivated) {
        if (onSuccessNotification) {
          onSuccessNotification("Marrow Shield activated. Your streak has been protected.");
        }
      } else if (res.streakBroken) {
        if (onSuccessNotification) {
          onSuccessNotification("No active Marrow Shields. Streak broken.");
        }
      }

      await loadMeals();
      window.dispatchEvent(new Event("meals_updated"));

      // Reset some states
      setFoodNameInput("");
      setNotes("");
      setWeightGramsInput("100");
    } catch (err: any) {
      alert("Error logging meal resources: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleMealsUpdated = () => {
      loadMeals();
    };
    window.addEventListener("meals_updated", handleMealsUpdated);
    return () => {
      window.removeEventListener("meals_updated", handleMealsUpdated);
    };
  }, [profileId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* MEAL LOGGER FORM: Left hand column */}
      <div className="lg:col-span-7 bg-slate-950 text-slate-100 rounded-2xl p-5 md:p-6 border border-amber-950/40 relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
          <Beef className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-amber-400">
            Commence Meat Log
          </h3>
        </div>

        {/* SECTION 1: LIVE USDA SEARCH */}
        <div className="space-y-2 relative">
          <label className="block text-[11px] uppercase tracking-wider font-bold text-amber-400/80 font-mono flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />
            Live Search USDA FoodData Database
          </label>
          <div className="relative">
            <input
              type="text"
              value={usdaSearchQuery}
              onChange={handleUsdaQueryChange}
              placeholder="Query ribeye, salmon, chicken, beef liver..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs placeholder:text-slate-650 text-slate-100 focus:outline-none focus:border-amber-500"
            />
            {usdaLoading && (
              <div className="absolute right-3.5 top-2.5 w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          {usdaLoading && (
            <div className="text-[11px] text-amber-500 font-mono flex items-center gap-2 mt-1 animate-pulse" id="usda-searching-indicator">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching USDA Food Database...</span>
            </div>
          )}

          {usdaSearchWarning && (
            <div className="bg-red-950/40 border border-red-500/20 text-red-400 text-[11px] font-mono p-3 rounded-xl flex items-start gap-2 mt-1 sm:items-center" id="usda-warning-indicator">
              <div className="leading-tight">{usdaSearchWarning}</div>
            </div>
          )}

          {/* USDA Suggestion Dropdown */}
          {usdaSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden text-xs max-h-48 overflow-y-auto divide-y divide-slate-800">
              {usdaSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectUsdaSuggestion(item)}
                  className="w-full text-left px-3 py-2 hover:bg-amber-950/20 text-slate-200 hover:text-amber-300 transition-colors block"
                >
                  <div className="font-semibold">{item.foodName}</div>
                  <div className="text-[10px] text-slate-400 flex gap-2 mt-0.5 font-mono">
                    <span>{item.calories} kCal</span>
                    <span>•</span>
                    <span>P: {item.proteinGrams}g</span>
                    <span>•</span>
                    <span>F: {item.fatGrams}g</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: EXACT LOGGING FORM */}
        <form onSubmit={handleSaveMeal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-slate-400 font-mono">
                Meat Nom (Food Name Label)
              </label>
              <input
                type="text"
                value={foodNameInput}
                onChange={(e) => setFoodNameInput(e.target.value)}
                placeholder="e.g., Grass-fed NZ Ribeye Cut"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-slate-400 font-mono">
                Portion Devoured (Grams)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={weightGramsInput}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                    if (cleanVal === "") {
                      setWeightGramsInput("");
                    } else {
                      // Parse as int to strip any leading zeros, then stringify
                      setWeightGramsInput(parseInt(cleanVal, 10).toString());
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <Scale className="absolute right-3.5 top-2 w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          {/* DYNAMIC NUTRITION FIELDS */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-3 font-mono">
              Estimated Nutritional Telemetry (Per Selected Portion)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-md md:text-xl font-mono font-extrabold text-amber-500">
                  {Math.round((calories * weightGrams) / 100)}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono">
                  Calories (kCal)
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-md md:text-xl font-mono font-extrabold text-red-400">
                  {Math.round((proteinGrams * weightGrams) / 100)}g
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono">
                  Prot Protein
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-md md:text-xl font-mono font-extrabold text-orange-400">
                  {Math.round((fatGrams * weightGrams) / 100)}g
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono">
                  Fat Lipid
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 flex items-center">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isCarbZero}
                onChange={(e) => setIsCarbZero(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 checked:bg-amber-500 text-amber-500 focus:ring-0 focus:outline-none w-4 h-4 cursor-pointer"
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                Completely Zero Carb (Carnivore Checklist)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-slate-400 font-mono">
              Log Chronicles (Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Broke my OMAD fast with grass-fed prime rib. Feeling high cognitive sharpness."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:border-slate-800 text-white font-bold font-mono uppercase tracking-wider text-xs py-3 h-11 cursor-pointer rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/30 active:scale-[0.99] shadow-lg shadow-amber-950/20 disabled:opacity-55 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>TRANSMITTING HUNT RECORD...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Secure Log in meals_log (+5 XP)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* RECENT MEALS HISTORY: Right hand column */}
      <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
        <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2">
          Your Recent Meals Log Chronicle ({mealsHistory.length})
        </h4>

        {mealsHistory.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Beef className="w-10 h-10 mx-auto opacity-10 text-slate-400" />
            <p>Your hunt journal is vacant. Secure your first prey meal above to earn experience.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {mealsHistory.map((m) => {
              const dateObj = new Date(m.loggedAt);
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={m.id}
                  className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 hover:border-amber-500/20 transition-all"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-xs text-amber-100 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {m.cutType}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
                    </div>
                    {m.isCarbZero && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                        ZERO CARB
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="bg-slate-950 px-2 py-0.5 rounded block">⚖️ {m.weightGrams}g</span>
                  </div>

                  {m.notes && (
                    <p className="text-[10px] italic text-slate-400 border-l border-slate-800 pl-2 leading-relaxed">
                      "{m.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
