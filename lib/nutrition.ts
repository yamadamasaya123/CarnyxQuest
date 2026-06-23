import { getSupabase, isSupabaseConfigured } from "./supabase";
import { MealLog, NutritionData } from "../types/meals";
import { addXp, advanceChallengeProgress, unlockBadge } from "./gamification";
import { db } from "../src/lib/db";

// USDA style carnivore pre-sourced nutrition profiles (per 100g)
export const PRIMAL_FOOD_CATALOG = [
  { name: "Skinside Ribeye Steak", calories: 291, protein: 24, fat: 21.8, carbs: 0, pureCarnivore: true },
  { name: "Pemmican Fat Patties", calories: 550, protein: 18, fat: 52, carbs: 0, pureCarnivore: true },
  { name: "Smoked Atlantic Salmon", calories: 200, protein: 22, fat: 12, carbs: 0, pureCarnivore: true },
  { name: "Salted Venison Jerky", calories: 260, protein: 48, fat: 5, carbs: 0.5, pureCarnivore: true },
  { name: "Sacred Bone Marrow", calories: 786, protein: 7, fat: 84, carbs: 0, pureCarnivore: true },
  { name: "Free-Range Pasture Eggs", calories: 155, protein: 12.6, fat: 10.6, carbs: 0.6, pureCarnivore: true },
  { name: "Crispy Sliced Bacon Slabs", calories: 541, protein: 37, fat: 42, carbs: 1.4, pureCarnivore: true },
  { name: "Slow Cooked Bone Broth", calories: 36, protein: 8, fat: 0.2, carbs: 0.4, pureCarnivore: true },
  { name: "Primal Ground Bison (80/20)", calories: 272, protein: 25.4, fat: 18.5, carbs: 0, pureCarnivore: true },
  { name: "Wild Captured Oysters Shucked", calories: 81, protein: 9, fat: 2.5, carbs: 5, pureCarnivore: true }
];

export async function createMealLog(
  profileId: string, 
  name: string, 
  weightG: number, 
  nutrition: Omit<NutritionData, "id">,
  isCarnivore: boolean
): Promise<MealLog | null> {
  
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      
      // Step A: Insert nutrition record
      const { data: nutRow, error: nutErr } = await supabase
        .from("nutrition_data")
        .insert({
          calories: Math.round(nutrition.calories),
          protein: Math.round(nutrition.protein),
          fat: Math.round(nutrition.fat),
          carbs: Math.round(nutrition.carbs),
          source: nutrition.source || "User Custom Entry"
        })
        .select()
        .single();
        
      if (nutErr || !nutRow) throw nutErr || new Error("Failed to register nutrition coordinates");

      // Step B: Insert meal log referential record
      const mealLogItem = {
        profile_id: profileId,
        name,
        weight_g: weightG,
        calories: Math.round(nutrition.calories),
        protein_g: Math.round(nutrition.protein),
        fat_g: Math.round(nutrition.fat),
        carbs_g: Math.round(nutrition.carbs),
        is_carnivore_pure: isCarnivore,
        nutrition_data_id: nutRow.id
      };

      const { data: mealRow, error: mealErr } = await supabase
        .from("meals_log")
        .insert(mealLogItem)
        .select()
        .single();

      if (mealErr || !mealRow) throw mealErr || new Error("Failed to log primal meal record");

      // Step C: Award experience (20 XP for standard logs, +10 XP bonus if 100% carnivore pure)
      const baseEarnedXp = 20;
      const totalXp = isCarnivore ? baseEarnedXp + 10 : baseEarnedXp;
      
      await addXp(profileId, totalXp, `Logged primal meal: ${name}`);

      // Step D: Advance related challenges and badges
      await advanceChallengeProgress(profileId, "meals", 1);
      
      if (isCarnivore) {
        await unlockBadge(profileId, "b_starter");
      }

      return {
        id: mealRow.id,
        profileId: mealRow.profile_id,
        name: mealRow.name,
        weightG: mealRow.weight_g,
        calories: mealRow.calories,
        proteinG: mealRow.protein_g,
        fatG: mealRow.fat_g,
        carbsG: mealRow.carbs_g,
        isCarnivorePure: mealRow.is_carnivore_pure,
        nutritionDataId: mealRow.nutrition_data_id || undefined,
        createdAt: mealRow.created_at
      };
    } catch (e) {
      console.error("Supabase Meal Log Creation error", e);
      return null;
    }
  } else {
    // Local fallback
    const res = db.logMeal(profileId, {
      cutType: name,
      weightGrams: weightG,
      notes: "Primal Feast",
      calories: Math.round(nutrition.calories || weightG * 2.5),
      proteinGrams: Math.round(nutrition.protein || weightG * 0.25),
      fatGrams: Math.round(nutrition.fat || weightG * 0.18),
      isCarbZero: isCarnivore,
      ketoRatio: "Medium" as any
    });
    
    const newest = res.meal as any;
    
    return {
      id: newest?.id || Math.random().toString(),
      profileId,
      name: newest?.cutType || name,
      weightG: newest?.weightGrams || weightG,
      calories: Math.round(nutrition.calories || weightG * 2.5),
      proteinG: Math.round(nutrition.protein || weightG * 0.25),
      fatG: Math.round(nutrition.fat || weightG * 0.18),
      carbsG: Math.round(nutrition.carbs || 0),
      isCarnivorePure: newest?.isCarbZero || isCarnivore,
      createdAt: newest?.loggedAt || new Date().toISOString()
    };
  }
}

export async function fetchUserMeals(profileId: string): Promise<MealLog[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("meals_log")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error || !data) return [];

      return data.map(item => ({
        id: item.id,
        profileId: item.profile_id,
        name: item.name,
        weightG: item.weight_g,
        calories: item.calories,
        proteinG: item.protein_g,
        fatG: item.fat_g,
        carbsG: item.carbs_g,
        isCarnivorePure: item.is_carnivore_pure,
        nutritionDataId: item.nutrition_data_id || undefined,
        createdAt: item.created_at
      }));
    } catch {
      return [];
    }
  } else {
    const list = db.getMeals(profileId);
    return list.map(l => {
      const act = l as any;
      const w = act.weightGrams || 200;
      return {
        id: act.id,
        profileId: act.profileId,
        name: act.cutType || "Chieftain Ribeye",
        weightG: w,
        calories: act.calories || Math.round(w * 2.5),
        proteinG: act.proteinG || Math.round(w * 0.25),
        fatG: act.fatG || Math.round(w * 0.18),
        carbsG: act.carbsG || 0,
        isCarnivorePure: act.isCarbZero || false,
        createdAt: act.loggedAt || new Date().toISOString()
      };
    });
  }
}
