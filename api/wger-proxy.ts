import type { VercelRequest, VercelResponse } from "@vercel/node";

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

// In-memory cache for all fetched Wger exercises (persists as long as Vercel container is warm)
let cachedWgerExercises: any[] | null = null;
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

  const hasStrongMatches = matched.some(m => m.score >= 1000);
  let finalMatches = matched;
  if (hasStrongMatches) {
    finalMatches = matched.filter(m => m.score >= 1000);
  }

  finalMatches.sort((a, b) => b.score - a.score);

  return finalMatches.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    category: m.category
  }));
}

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const query = (req.query.query as string) || "";
  const apiKey = process.env.WGER_API_KEY;
  const isDemoKey = !apiKey;

  if (!query) {
    return res.status(200).json({ exercises: [] });
  }

  const headers: Record<string, string> = {
    "Accept": "application/json"
  };

  if (apiKey) {
    headers["Authorization"] = `Token ${apiKey}`;
  }

  const now = Date.now();
  let usingCache = true;

  if (!cachedWgerExercises || (now - lastCacheFetchTime > CACHE_TTL_MS)) {
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

  if (cachedWgerExercises && cachedWgerExercises.length > 0) {
    const formatted = searchAndRankExercises(cachedWgerExercises, query);
    res.status(200).json({
      exercises: formatted.slice(0, 15),
      isDemoKey,
      usingFallback: false,
      usingCache
    });
  } else {
    console.warn("Wger live cache empty. Performing local offline fallback...");
    const fallbackPool = getLocalWgerCatalogPool();
    const formatted = searchAndRankExercises(fallbackPool, query);
    res.status(200).json({
      exercises: formatted.slice(0, 15),
      isDemoKey,
      usingFallback: true,
      warning: "⚠ Wger live search unavailable. Showing rich local catalog."
    });
  }
}
