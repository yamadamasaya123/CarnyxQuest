import type { VercelRequest, VercelResponse } from "@vercel/node";

function getCarnivoreLocalSuggestions(query: string) {
  const norm = query.toLowerCase();
  const baseSuggestions = [
    { foodName: "Ribeye Steak (Beef)", calories: 291, proteinGrams: 24, fatGrams: 22, usdaFoodId: "1231" },
    { foodName: "Beef Liver", calories: 135, proteinGrams: 20, fatGrams: 3.6, usdaFoodId: "1232" },
    { foodName: "Ground Beef 80/20", calories: 254, proteinGrams: 17, fatGrams: 20, usdaFoodId: "1233" },
    { foodName: "Bacon (Crispy Pork)", calories: 541, proteinGrams: 37, fatGrams: 42, usdaFoodId: "1234" },
    { foodName: "Pork Belly", calories: 518, proteinGrams: 9, fatGrams: 53, usdaFoodId: "1235" },
    { foodName: "Salmon Fillet", calories: 208, proteinGrams: 20, fatGrams: 13, usdaFoodId: "1236" },
    { foodName: "Chicken Breast (Skinless)", calories: 165, proteinGrams: 31, fatGrams: 3.6, usdaFoodId: "1237" },
    { foodName: "Whole Egg (Large)", calories: 143, proteinGrams: 13, fatGrams: 10, usdaFoodId: "1238" },
    { foodName: "Bone Marrow", calories: 786, proteinGrams: 7, fatGrams: 84, usdaFoodId: "1239" },
    { foodName: "T-Bone Steak", calories: 247, proteinGrams: 24, fatGrams: 17, usdaFoodId: "1240" },
  ];

  const matches = baseSuggestions.filter((item) =>
    item.foodName.toLowerCase().includes(norm)
  );

  return matches.length > 0 ? matches : baseSuggestions.slice(0, 3);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const query = (req.query.query as string) || "";
  const apiKey = process.env.USDA_API_KEY;

  if (!query) {
    return res.status(200).json({ foods: [] });
  }

  // If a real USDA_API_KEY exists, always use the real key. If not, use "DEMO_KEY" as dev fallback.
  const activeKey = apiKey || "DEMO_KEY";
  const isDemoKey = !apiKey;

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
      query
    )}&pageSize=8&api_key=${activeKey}`;
    const usdaResponse = await fetch(url);
    
    if (!usdaResponse.ok) {
      throw new Error(`USDA API returned status ${usdaResponse.status}`);
    }

    const data = await usdaResponse.json();
    const formattedFoods = (data.foods || []).map((f: any) => {
      // Find vital nutrients
      const caloriesNutrient = f.foodNutrients?.find((n: any) => n.nutrientId === 1008 || n.nutrientName?.toLowerCase().includes("energy"));
      const proteinNutrient = f.foodNutrients?.find((n: any) => n.nutrientId === 1003 || n.nutrientName?.toLowerCase().includes("protein"));
      const fatNutrient = f.foodNutrients?.find((n: any) => n.nutrientId === 1004 || n.nutrientName?.toLowerCase().includes("lipid") || n.nutrientName?.toLowerCase().includes("fat"));

      return {
        usdaFoodId: f.fdcId?.toString() || Math.random().toString(),
        foodName: f.description || "",
        calories: caloriesNutrient?.value ?? 0,
        proteinGrams: proteinNutrient?.value ?? 0,
        fatGrams: fatNutrient?.value ?? 0,
        servingSize: 100, // typical standard USDA serving size
      };
    });

    res.status(200).json({ 
      foods: formattedFoods, 
      isDemoKey, 
      usingFallback: false 
    });
  } catch (err: any) {
    console.error("USDA API request failed:", err);
    // Graceful fallback and clear notice that the local carnivore database is used
    const rawHeuristic = getCarnivoreLocalSuggestions(query);
    res.status(200).json({ 
      foods: rawHeuristic, 
      isDemoKey, 
      usingFallback: true, 
      warning: "USDA search unavailable" 
    });
  }
}
