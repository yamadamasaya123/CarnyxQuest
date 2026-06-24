import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 2. API: USDA FoodData Central Proxy (with local fallback if network or keys fail)
app.get("/api/usda-proxy", async (req, res) => {
  const query = (req.query.query as string) || "";
  const apiKey = process.env.USDA_API_KEY;

  if (!query) {
    return res.json({ foods: [] });
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

    res.json({ 
      foods: formattedFoods, 
      isDemoKey, 
      usingFallback: false 
    });
  } catch (err: any) {
    console.error("USDA API request failed:", err);
    // Graceful fallback and clear notice that the local carnivore database is used
    const rawHeuristic = getCarnivoreLocalSuggestions(query);
    res.json({ 
      foods: rawHeuristic, 
      isDemoKey, 
      usingFallback: true, 
      warning: "USDA search unavailable" 
    });
  }
});

// Helper to resolve category ID from Wger API text category
function parseCategory(category: any): number {
  if (typeof category === "number") return category;
  if (typeof category === "string") {
    const lower = category.toLowerCase();
    if (lower.includes("chest")) return 10;
    if (lower.includes("arm") || lower.includes("bicep") || lower.includes("tricep")) return 8;
    if (lower.includes("leg") || lower.includes("quad") || lower.includes("glute") || lower.includes("hamstring")) return 9;
    if (lower.includes("back") || lower.includes("pull") || lower.includes("lats")) return 12;
    if (lower.includes("shoulder") || lower.includes("deltoid")) return 11;
    if (lower.includes("calf") || lower.includes("calves")) return 14;
  }
  return 10; // Default Chest/Pushes
}

// In-memory cache for all fetched Wger exercises
let cachedWgerExercises: any[] = [];
let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // Cache for 1 hour

const QUERY_SYNONYMS: Record<string, string[]> = {
  "dumbbell curl": [
    "dumbbell curl",
    "bicep curl",
    "biceps curl",
    "dumbbell bicep curl",
    "alternating dumbbell curl"
  ],
  "bicep curl": [
    "dumbbell curl",
    "bicep curl",
    "biceps curl",
    "dumbbell bicep curl",
    "alternating dumbbell curl"
  ],
  "biceps curl": [
    "dumbbell curl",
    "bicep curl",
    "biceps curl",
    "dumbbell bicep curl",
    "alternating dumbbell curl"
  ],
  "leg extension": [
    "leg extension",
    "machine leg extension",
    "seated leg extension",
    "quadriceps extension"
  ],
  "shoulder press": [
    "shoulder press",
    "overhead press",
    "military press",
    "dumbbell shoulder press"
  ],
  "overhead press": [
    "shoulder press",
    "overhead press",
    "military press",
    "dumbbell shoulder press"
  ],
  "military press": [
    "shoulder press",
    "overhead press",
    "military press",
    "dumbbell shoulder press"
  ],
  "lat pulldown": [
    "lat pulldown",
    "lat pull down",
    "lat pull-down",
    "wide grip lat pulldown"
  ],
  "lat pull down": [
    "lat pulldown",
    "lat pull down",
    "lat pull-down",
    "wide grip lat pulldown"
  ],
  "lat pull-down": [
    "lat pulldown",
    "lat pull down",
    "lat pull-down",
    "wide grip lat pulldown"
  ]
};

function getSearchQueries(queryStr: string): string[] {
  const cleaned = queryStr.toLowerCase().replace(/[^a-zA-Z0-9\s-]/g, "").trim();
  const synonyms = QUERY_SYNONYMS[cleaned];
  if (synonyms && synonyms.length > 0) {
    return Array.from(new Set([cleaned, ...synonyms]));
  }
  return [cleaned];
}

function scoreCandidate(name: string, description: string, queryTerms: string[]): { score: number; tier: number } {
  let highestScore = 0;
  let highestTier = 5;

  const candidateName = name.toLowerCase().trim();
  const candidateDesc = description.toLowerCase().trim();

  for (const term of queryTerms) {
    const t = term.trim();
    if (!t) continue;

    const tWords = t.split(/\s+/).filter(Boolean);
    let currentScore = 0;
    let currentTier = 5;

    const wordsMatcher = (wordA: string, wordB: string) => {
      if (wordA === wordB) return true;
      if (wordA.includes(wordB)) return true;
      if (wordB.includes(wordA) && wordA.length >= 4) return true;
      // common plurals
      if (wordA.endsWith("s") && wordA.slice(0, -1) === wordB) return true;
      if (wordB.endsWith("s") && wordB.slice(0, -1) === wordA) return true;
      return false;
    };

    const hasAllWordsInName = tWords.every(qWord =>
      candidateName.split(/\s+/).some(cWord => wordsMatcher(cWord, qWord))
    );

    const hasSomeWordsInName = tWords.filter(qWord =>
      candidateName.split(/\s+/).some(cWord => wordsMatcher(cWord, qWord))
    );

    const hasAllWordsInDescOrName = tWords.every(qWord =>
      candidateName.split(/\s+/).some(cWord => wordsMatcher(cWord, qWord)) ||
      candidateDesc.split(/\s+/).some(cWord => wordsMatcher(cWord, qWord))
    );

    // Tier 1: Exact Match
    if (candidateName === t) {
      currentTier = 1;
      currentScore = 10000;
    }
    // Tier 2: Starts with term
    else if (candidateName.startsWith(t)) {
      currentTier = 2;
      currentScore = 5000;
    }
    // Tier 3: Contains full phrase
    else if (candidateName.includes(t)) {
      currentTier = 3;
      currentScore = 3000;
    }
    // Tier 4: Contains all words in name
    else if (hasAllWordsInName) {
      currentTier = 4;
      currentScore = 1000;
    }
    // Tier 5: Description match / weak synonym
    else if (hasAllWordsInDescOrName) {
      currentTier = 5;
      currentScore = 500;
    }
    else if (hasSomeWordsInName.length > 0) {
      currentTier = 5;
      currentScore = 100 + Math.round((hasSomeWordsInName.length / tWords.length) * 300);
    }

    if (currentScore > 0) {
      const lenDiff = Math.abs(candidateName.length - t.length);
      const closenessBonus = Math.max(0, 100 - lenDiff);
      currentScore += closenessBonus;
    }

    if (currentScore > highestScore) {
      highestScore = currentScore;
      highestTier = currentTier;
    }
  }

  return { score: highestScore, tier: highestTier };
}

function searchAndRankExercises(pool: any[], rawQuery: string): any[] {
  if (!rawQuery.trim()) return [];

  const queryTerms = getSearchQueries(rawQuery);
  const matched: { id: number; name: string; description: string; category: number; score: number; tier: number }[] = [];

  for (const item of pool) {
    const englishTrans = item.translations?.find((t: any) => t.language === 2);
    const name = englishTrans?.name || item.name || "";
    const description = englishTrans?.description || item.description || "";

    if (!name) continue;

    const { score, tier } = scoreCandidate(name, description, queryTerms);
    if (score > 0) {
      matched.push({
        id: item.id,
        name,
        description,
        category: parseCategory(item.category),
        score,
        tier
      });
    }
  }

  // Task 4: Remove bad matches. Filter out Tier 5 (scores < 1000) if we have strong Tier 1-4 matches (scores >= 1000)
  const hasStrongMatches = matched.some(m => m.score >= 1000);
  let finalMatches = matched;
  if (hasStrongMatches) {
    finalMatches = matched.filter(m => m.score >= 1000);
  }

  // Sort candidates descending by match score
  finalMatches.sort((a, b) => b.score - a.score);

  return finalMatches.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    category: m.category
  }));
}

// 3. API: Wger Exercise API Proxy (with robust caching, mapping, and offline capability)
app.get("/api/wger-proxy", async (req, res) => {
  const query = (req.query.query as string) || "";
  const apiKey = process.env.WGER_API_KEY;
  const isDemoKey = !apiKey;

  if (!query) {
    return res.json({ exercises: [] });
  }

  const headers: Record<string, string> = {
    "Accept": "application/json"
  };

  if (apiKey) {
    headers["Authorization"] = `Token ${apiKey}`;
  }

  const now = Date.now();
  let usingCache = true;

  if (cachedWgerExercises.length === 0 || (now - lastCacheFetchTime > CACHE_TTL_MS)) {
    usingCache = false;
    try {
      console.log("Pre-fetching/Caching broad Wger catalogue with limit=999...");
      const url = "https://wger.de/api/v2/exerciseinfo/?language=2&limit=999";
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        cachedWgerExercises = data.results || [];
        lastCacheFetchTime = Date.now();
        console.log(`Cached ${cachedWgerExercises.length} live exercises.`);
      } else {
        console.warn(`Wger broad fetch returned error status ${response.status}`);
      }
    } catch (err: any) {
      console.error("Wger cache query failed:", err.message);
    }
  }

  if (cachedWgerExercises.length > 0) {
    const formatted = searchAndRankExercises(cachedWgerExercises, query);
    res.json({
      exercises: formatted.slice(0, 15),
      isDemoKey,
      usingFallback: false,
      usingCache
    });
  } else {
    console.warn("Wger live cache empty. Performing local offline fallback...");
    const fallbackPool = getLocalWgerCatalogPool();
    const formatted = searchAndRankExercises(fallbackPool, query);
    res.json({
      exercises: formatted.slice(0, 15),
      isDemoKey,
      usingFallback: true,
      warning: "⚠ Wger live search unavailable. Showing rich local catalog."
    });
  }
});

function getLocalWgerCatalogPool(): any[] {
  return [
    {
      id: 369,
      category: 9,
      translations: [{ language: 2, name: "Leg Extension", description: "<p>The leg extension is a resistance weight training exercise that targets the quadriceps muscles.</p>" }]
    },
    {
      id: 851,
      category: 9,
      translations: [{ language: 2, name: "Leg Extension", description: "<p>Is an isolation exercise focused on the quadriceps.</p>" }]
    },
    {
      id: 909,
      category: 9,
      translations: [{ language: 2, name: "Reverse Nordic Curl", description: "<p>Natural Leg Extension is alternative to Leg Extension machines targeting hip flexors and rectus femoris.</p>" }]
    },
    {
      id: 1289,
      category: 8,
      translations: [{ language: 2, name: "Seated Dumbbell Curls", description: "<p>Effective bicep isolation curls dumbbells alternates arms.</p>" }]
    },
    {
      id: 1530,
      category: 8,
      translations: [{ language: 2, name: "Lying Dumbbell Curls", description: "<p>Isolation curl movement performed backwards on an incline or flat bench.</p>" }]
    },
    {
      id: 106,
      category: 8,
      translations: [{ language: 2, name: "Barbell Bicep Curl", description: "<p>Isolation workout using a straight biceps bar for hypertrophy.</p>" }]
    },
    {
      id: 1968,
      category: 11,
      translations: [{ language: 2, name: "Single-arm dumbbell shoulder press", description: "<p>Press the dumbbell vertically overhead to target front and side delts.</p>" }]
    },
    {
      id: 105,
      category: 11,
      translations: [{ language: 2, name: "Overhead Barbell Press", description: "<p>Shoulder pressing compound movement targeting anterior deltoids and triceps.</p>" }]
    },
    {
      id: 1972,
      category: 12,
      translations: [{ language: 2, name: "Single-Arm Lat Pulldown", description: "<p>Vertical pulling machine compound exercise isolating one side latissimus dorsi.</p>" }]
    },
    {
      id: 1124,
      category: 12,
      translations: [{ language: 2, name: "Wide-grip lat pulldown", description: "<p>Classic bodybuilding vertical pull down exercise targeting outer lats.</p>" }]
    },
    {
      id: 9,
      category: 9,
      translations: [{ language: 2, name: "Squats", description: "Lower body barbell work for quadriceps and glutes." }]
    },
    {
      id: 103,
      category: 10,
      translations: [{ language: 2, name: "Bench Press", description: "Chest pushes using a horizontal bench pressing bar." }]
    },
    {
      id: 104,
      category: 12,
      translations: [{ language: 2, name: "Pull-ups", description: "Vertical pulling bodyweight exercise." }]
    },
    {
      id: 107,
      category: 10,
      translations: [{ language: 2, name: "Push-ups", description: "Bodyweight pressing workout for chests and triceps." }]
    }
  ];
}

// HEURISTICS FOR OFFLINE OR NO-KEY OPERATION
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

async function start() {
  // Vite integration in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CarnyxQuest Express server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
});
