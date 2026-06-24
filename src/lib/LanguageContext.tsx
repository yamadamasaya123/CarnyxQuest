import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "./db";
import { UserProfile } from "../types";

export type Language = "en" | "id";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language, profileId?: string) => Promise<void>;
  t: (key: keyof typeof translations.en, replacements?: Record<string, string | number>) => string;
}

export const translations = {
  en: {
    // App Header & Nav
    appName: "CarnyxQuest",
    tagline: "Track your progress, complete challenges, and stay consistent on your carnivore journey.",
    navDashboard: "Command Board",
    navMeals: "Prey Meal Logs",
    navFasting: "Autophagy Clock",
    navProgress: "Physical Metrics",
    navWorkouts: "Metabolic Workouts",
    navChallenges: "Quests & Trophies",
    navLogout: "Log Out",
    levelUpTitle: "SACRED LEVEL UP!",
    levelUpDesc: "Your metabolic channels are fortified. Your cells hum with increased autophagy velocity.",
    levelUpSub: "You upgraded your class status, unlocking +25 Golden Points.",
    acknowledgeCovenant: "ACKNOWLEDGE COVENANT",
    levelUpToast: "SACRED ASCENT! You leveled up and earned additional Golden Points!",
    xpCoordinatesToast: "Gain +{xp} XP",
    notesOptional: "Notes are optional.",
    unknownHunter: "Unknown Hunter",

    // Dashboard
    establishingProfile: "Prone position detected. Establishing profile connection...",
    vanguardText: "Vanguard of the meat-communion cohort. Tracking biomarkers live.",
    inventGold: "Invent Gold",
    shieldGp: "Shield (80 GP)",
    levelPathfinder: "Level {level} Pathfinder",
    sacredCheckinRitual: "Sacred Daily Check-In Ritual",
    checkedInToday: "COMMUNED TODAY",
    checkinNotesPlaceholder: "e.g. Broken OMAD with Ribeye, mental clarity incredibly high today.",
    commitRitual: "Commit Today's Ritual",
    submittingRitual: "Submitting Ritual...",
    streakStatus: "Streak Status",
    currentStreak: "Current Streak",
    longestStreak: "Longest Streak",
    activeShields: "Active Shields",
    days: "Days",
    recentMealLogs: "Recent Meal Logs",
    viewAllMeals: "View All Meals",
    noMealsLoggedYet: "No meals logged yet. The hunt awaits!",
    dailyCommunionLogs: "Daily Communion Logs",
    marrowShieldsDescription: "Marrow shields protect your streak from carb slippage and missed daily check-ins.",
    marrowShieldActions: "History of Marrow Shield Actions",
    gpInfoTitle: "GOLDEN POINTS (GP) ECONOMY",
    gpInfoDesc: "Gold Points (GP) represent your metabolic currency, earned through devotion and consistent tracking.",
    gpInfoHowTitle: "How to Earn GP:",
    gpInfoHowList1: "Daily Check-In Ritual: +10 GP per consecutive day",
    gpInfoHowList2: "Prey Meal Logs: +15 GP per logged zero-carb meal",
    gpInfoHowList3: "Autophagy Clock (Fasting): up to +40 GP per completed fast based on protocol length",
    gpInfoHowList4: "Metabolic Workouts: +20 GP per registered workout session",
    gpInfoHowList5: "Quests & Trophies: Major GP payouts upon successful quest completion",
    gpInfoShopTitle: "The Sacred Shop:",
    gpInfoShopDesc: "Exchange 80 GP for a Marrow Protector Shield. Shields automatically deploy to safeguard your active streak on days you fail to check in or log food.",
    gpInfoClose: "CLOSE DIALOG",
    zeroCarbBadge: "ZERO CARBS",
    carbSlippage: "Carb Slippage",
    checkinShieldText: "Daily check-in completed. Streak secured.",

    // Meals
    preyMealLogsTitle: "Prey Meal Logs",
    addPreyMeal: "Add Prey Meal Log",
    mealCutTypeLabel: "Cut Type / Animal Source Name",
    mealCutPlaceholder: "e.g. Ribeye Steak, Ground Beef, Lamb chops, Eggs",
    mealKetoRatioLabel: "Fat-to-Protein Ketogenic Ratio",
    lowRatio: "Low (High Protein, Lean Meat)",
    mediumRatio: "Medium (Balanced, e.g. Ribeye, Ground Beef 80/20)",
    highRatio: "High (High Fat, e.g. Tallow-basted, Pork Belly)",
    mealWeightLabel: "Weight in Grams",
    completelyZeroCarbLabel: "Completely Zero Carb (Carnivore Checklist)",
    usdaSearchTitle: "USDA Food Database Search (Optional Integration)",
    usdaSearchPlaceholder: "Search raw beef, bacon, lamb, marrow in USDA database...",
    usdaSearching: "Querying national nutritional vaults...",
    usdaNoResults: "No USDA records aligned with your query. Use custom manual entry below.",
    mealNotesLabel: "Somatic Notes / Feast Context",
    mealNotesPlaceholder: "e.g. Cooked in grass-fed butter, extreme satiation, deep sleep predicted.",
    logPreySuccess: "Log Prey Feast",
    loggingPrey: "Logging Prey...",
    allPreyFeasts: "All Registered Prey Feasts",
    noMealsLogged: "No meals logged yet. Complete a hunt and log your first meal!",

    // Fasting
    autophagyClockTitle: "Autophagy Clock",
    activeFastingSession: "Active Fasting Session",
    fastingProtocol: "Autophagy Protocol",
    hoursLeft: "hours left",
    hoursCompleted: "hours completed",
    fastingTarget: "Target: {target} Hours",
    elapsedTime: "Elapsed Time",
    autophagyProgress: "Autophagy Progress",
    milestonesTitle: "Cellular Milestones & Autophagy Events",
    concludeFastingSession: "Conclude Fasting Session",
    cancelFastingSession: "Cancel Fasting Session",
    startAutophagyFast: "Start Autophagy Fast",
    selectProtocolLabel: "Select Fasting Protocol",
    congratulationsFastCompleted: "Autophagy complete! Cell renewal maximized.",
    fastingHistory: "Fasting Session History",
    noFastingHistory: "No fasting sessions registered yet. Prime your biology!",

    // Progress Metrics
    physicalMetricsTitle: "Physical Metrics",
    registerProgressMetrics: "Register Progress Metrics",
    bodyWeightLabel: "Body Weight (kg)",
    measurementLabel: "Body Measurement Notes (Optional)",
    measurementPlaceholder: "e.g. Waist 82cm, Chest 110cm, feeling extremely lean",
    recordDateLabel: "Record Date",
    logMetricsButton: "Log Physical Metrics",
    loggingMetricsButton: "Logging Metrics...",
    progressChartsTitle: "Biometric Progression Charts",
    noMetricsLoggedYet: "No progress metrics registered yet.",
    loggedProgressRecords: "Logged Progress Records",

    // Workouts
    metabolicWorkoutsTitle: "Metabolic Workouts",
    registerMetabolicWorkout: "Register Metabolic Workout",
    exerciseNameLabel: "Exercise Name",
    exerciseNamePlaceholder: "Selected or manual input name...",
    setsLabel: "Sets",
    repsLabel: "Reps",
    weightKgLabel: "Weight (kg)",
    durationMinutesLabel: "Duration (minutes)",
    workoutNotesLabel: "Somatic Training Notes (Optional)",
    workoutNotesPlaceholder: "e.g. High intensity, explosive power, short rest periods.",
    logWorkoutButton: "Register Metabolic Workout",
    loggingWorkoutButton: "Logging Workout...",
    wgerSearchTitle: "Wger Database Search (Optional Integration)",
    wgerSearchPlaceholder: "Search squat, deadlift, pull-up, bench press in Wger...",
    wgerSearching: "Querying exercise catalogue...",
    wgerNoResults: "No Wger exercises matched. Enter custom exercise name above.",
    registeredWorkoutsHistory: "Registered Metabolic Workouts",
    noWorkoutsRegistered: "No workouts registered. Build your muscle armor!",

    // Challenges
    questsTrophiesTitle: "Quests & Trophies",
    availableQuests: "Available Quests",
    enrolledQuests: "Your Active Quests",
    completedQuests: "Completed Quests",
    unlockLevel: "Unlocks at Level {level}",
    rewardXpLabel: "Reward: {xp} XP",
    enrollInQuest: "Enroll in Quest",
    questCompletedStatus: "Completed",
    questEnrolledSuccess: "Quest enrollment successful! Go forth, Hunter!",
    noAvailableQuests: "No available quests for your current level.",
    noActiveQuests: "No active quests enrolled. Join a quest below!",
    unlockedBadges: "Unlocked Badges & Achievements",
    noBadgesUnlocked: "No badges unlocked yet. Complete objectives to unlock badges!"
  },
  id: {
    // App Header & Nav
    appName: "CarnyxQuest",
    tagline: "Pantau kemajuan Anda, selesaikan tantangan, dan tetap konsisten dalam perjalanan karnivora Anda.",
    navDashboard: "Papan Komando",
    navMeals: "Log Makanan Mangsa",
    navFasting: "Jam Autofagi",
    navProgress: "Metrik Fisik",
    navWorkouts: "Latihan Metabolik",
    navChallenges: "Misi & Trofi",
    navLogout: "Keluar",
    levelUpTitle: "PENINGKATAN LEVEL SUCI!",
    levelUpDesc: "Saluran metabolisme Anda diperkuat. Sel-sel Anda bergetar dengan peningkatan kecepatan autofagi.",
    levelUpSub: "Anda meningkatkan status kelas Anda, membuka +25 Poin Emas.",
    acknowledgeCovenant: "SETUJUI PERJANJIAN",
    levelUpToast: "KENAIKAN SUCI! Anda naik level dan mendapatkan tambahan Poin Emas!",
    xpCoordinatesToast: "Mendapatkan +{xp} XP",
    notesOptional: "Catatan bersifat opsional.",
    unknownHunter: "Pemburu Misterius",

    // Dashboard
    establishingProfile: "Posisi rawan terdeteksi. Membangun koneksi profil...",
    vanguardText: "Garda terdepan dari kohort persekutuan daging. Melacak biomarker secara langsung.",
    inventGold: "Emas Tersimpan",
    shieldGp: "Perisai (80 GP)",
    levelPathfinder: "Penjelajah Level {level}",
    sacredCheckinRitual: "Ritual Pemeriksaan Harian Suci",
    checkedInToday: "LOG SELESAI HARI INI",
    checkinNotesPlaceholder: "misalnya: Berbuka OMAD dengan Ribeye, kejernihan mental sangat tinggi hari ini.",
    commitRitual: "Lakukan Ritual Hari Ini",
    submittingRitual: "Mengirimkan Ritual...",
    streakStatus: "Status Beruntun",
    currentStreak: "Beruntun Saat Ini",
    longestStreak: "Beruntun Terlama",
    activeShields: "Perisai Aktif",
    days: "Hari",
    recentMealLogs: "Log Makanan Terakhir",
    viewAllMeals: "Lihat Semua Makanan",
    noMealsLoggedYet: "Belum ada makanan yang dicatat. Perburuan menanti!",
    dailyCommunionLogs: "Log Persekutuan Harian",
    marrowShieldsDescription: "Perisai sumsum melindungi rekor beruntun Anda dari selip karbohidrat dan absen pemeriksaan harian.",
    marrowShieldActions: "Riwayat Aksi Perisai Sumsum",
    gpInfoTitle: "EKONOMI POIN EMAS (GP)",
    gpInfoDesc: "Poin Emas (GP) mewakili mata uang metabolisme Anda, didapatkan melalui pengabdian dan pelacakan yang konsisten.",
    gpInfoHowTitle: "Cara Mendapatkan GP:",
    gpInfoHowList1: "Ritual Pemeriksaan Harian: +10 GP per hari berturut-turut",
    gpInfoHowList2: "Log Makanan Mangsa: +15 GP per makanan nol-karbohidrat yang dicatat",
    gpInfoHowList3: "Jam Autofagi (Puasa): hingga +40 GP per puasa yang selesai berdasarkan panjang protokol",
    gpInfoHowList4: "Latihan Metabolik: +20 GP per sesi latihan yang terdaftar",
    gpInfoHowList5: "Misi & Trofi: Pembayaran GP besar setelah berhasil menyelesaikan misi",
    gpInfoShopTitle: "Toko Suci:",
    gpInfoShopDesc: "Tukarkan 80 GP dengan Perisai Pelindung Sumsum. Perisai secara otomatis dikerahkan untuk menjaga rekor beruntun aktif Anda pada hari-hari Anda gagal melakukan pemeriksaan atau mencatat makanan.",
    gpInfoClose: "TUTUP DIALOG",
    zeroCarbBadge: "ZERO KARBOHIDRAT",
    carbSlippage: "Selip Karbohidrat",
    checkinShieldText: "Pemeriksaan harian selesai. Rekor aman.",

    // Meals
    preyMealLogsTitle: "Log Makanan Mangsa",
    addPreyMeal: "Tambah Log Makanan Mangsa",
    mealCutTypeLabel: "Jenis Potongan / Nama Sumber Hewan",
    mealCutPlaceholder: "misalnya: Steak Ribeye, Daging Sapi Cincang, Domba, Telur",
    mealKetoRatioLabel: "Rasio Ketogenik Lemak-ke-Protein",
    lowRatio: "Rendah (Tinggi Protein, Daging Tanpa Lemak)",
    mediumRatio: "Sedang (Seimbang, misal: Ribeye, Daging Sapi 80/20)",
    highRatio: "Tinggi (Tinggi Lemak, misal: Dilumuri Lemak Sapi, Samcan)",
    mealWeightLabel: "Berat dalam Gram",
    completelyZeroCarbLabel: "Sama Sekali Tanpa Karbohidrat (Checklist Karnivora)",
    usdaSearchTitle: "Pencarian Database Makanan USDA (Integrasi Opsional)",
    usdaSearchPlaceholder: "Cari daging sapi mentah, bacon, domba, sumsum di database USDA...",
    usdaSearching: "Menanyakan brankas nutrisi nasional...",
    usdaNoResults: "Tidak ada catatan USDA yang cocok dengan kueri Anda. Gunakan entri manual di bawah.",
    mealNotesLabel: "Catatan Somatis / Konteks Pesta",
    mealNotesPlaceholder: "misalnya: Dimasak dengan mentega sapi mentah, kenyang luar biasa, tidur nyenyak diprediksi.",
    logPreySuccess: "Catat Pesta Mangsa",
    loggingPrey: "Mencatat Mangsa...",
    allPreyFeasts: "Semua Pesta Mangsa yang Terdaftar",
    noMealsLogged: "Belum ada makanan yang dicatat. Selesaikan perburuan dan catat makanan pertama Anda!",

    // Fasting
    autophagyClockTitle: "Jam Autofagi",
    activeFastingSession: "Sesi Puasa Aktif",
    fastingProtocol: "Protokol Autofagi",
    hoursLeft: "jam tersisa",
    hoursCompleted: "jam selesai",
    fastingTarget: "Target: {target} Jam",
    elapsedTime: "Waktu Berlalu",
    autophagyProgress: "Kemajuan Autofagi",
    milestonesTitle: "Pencapaian Seluler & Peristiwa Autofagi",
    concludeFastingSession: "Selesaikan Sesi Puasa",
    cancelFastingSession: "Batalkan Sesi Puasa",
    startAutophagyFast: "Mulai Puasa Autofagi",
    selectProtocolLabel: "Pilih Protokol Puasa",
    congratulationsFastCompleted: "Autofagi selesai! Pembaruan sel maksimal.",
    fastingHistory: "Riwayat Sesi Puasa",
    noFastingHistory: "Belum ada sesi puasa yang terdaftar. Siapkan biologi Anda!",

    // Progress Metrics
    physicalMetricsTitle: "Metrik Fisik",
    registerProgressMetrics: "Daftarkan Metrik Kemajuan",
    bodyWeightLabel: "Berat Badan (kg)",
    measurementLabel: "Catatan Pengukuran Tubuh (Opsional)",
    measurementPlaceholder: "misalnya: Lingkar pinggang 82cm, dada 110cm, merasa sangat ramping",
    recordDateLabel: "Tanggal Catat",
    logMetricsButton: "Catat Metrik Fisik",
    loggingMetricsButton: "Mencatat Metrik...",
    progressChartsTitle: "Grafik Perkembangan Biometrik",
    noMetricsLoggedYet: "Belum ada metrik kemajuan yang terdaftar.",
    loggedProgressRecords: "Catatan Kemajuan yang Dicatat",

    // Workouts
    metabolicWorkoutsTitle: "Latihan Metabolik",
    registerMetabolicWorkout: "Daftarkan Latihan Metabolik",
    exerciseNameLabel: "Nama Latihan",
    exerciseNamePlaceholder: "Nama input manual atau pilihan...",
    setsLabel: "Set",
    repsLabel: "Repetisi",
    weightKgLabel: "Berat (kg)",
    durationMinutesLabel: "Durasi (menit)",
    workoutNotesLabel: "Catatan Latihan Somatis (Opsional)",
    workoutNotesPlaceholder: "misalnya: Intensitas tinggi, kekuatan eksplosif, istirahat singkat.",
    logWorkoutButton: "Daftarkan Latihan Metabolik",
    loggingWorkoutButton: "Mendaftarkan Latihan...",
    wgerSearchTitle: "Pencarian Database Wger (Integrasi Opsional)",
    wgerSearchPlaceholder: "Cari squat, deadlift, pull-up, bench press di Wger...",
    wgerSearching: "Menanyakan katalog latihan...",
    wgerNoResults: "Tidak ada latihan Wger yang cocok. Masukkan nama latihan kustom di atas.",
    registeredWorkoutsHistory: "Latihan Metabolik yang Terdaftar",
    noWorkoutsRegistered: "Belum ada latihan yang terdaftar. Bangun pelindung otot Anda!",

    // Challenges
    questsTrophiesTitle: "Misi & Trofi",
    availableQuests: "Misi yang Tersedia",
    enrolledQuests: "Misi Aktif Anda",
    completedQuests: "Misi Selesai",
    unlockLevel: "Terbuka di Level {level}",
    rewardXpLabel: "Hadiah: {xp} XP",
    enrollInQuest: "Daftar dalam Misi",
    questCompletedStatus: "Selesai",
    questEnrolledSuccess: "Pendaftaran misi berhasil! Majulah, Pemburu!",
    noAvailableQuests: "Tidak ada misi yang tersedia untuk level Anda saat ini.",
    noActiveQuests: "Tidak ada misi aktif yang diikuti. Ikuti misi di bawah ini!",
    unlockedBadges: "Lencana & Pencapaian yang Dibuka",
    noBadgesUnlocked: "Belum ada lencana yang terbuka. Selesaikan tujuan untuk membuka lencana!"
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language from Supabase if authenticated, otherwise use local storage or default
  useEffect(() => {
    const loadLang = async () => {
      const activeSession = await db.getActiveUserAndProfile();
      if (activeSession.profile && activeSession.profile.preferredLanguage) {
        setLanguageState(activeSession.profile.preferredLanguage);
      } else {
        const localLang = localStorage.getItem("carnyx_preferred_language");
        if (localLang === "en" || localLang === "id") {
          setLanguageState(localLang);
        }
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang: Language, profileId?: string) => {
    setLanguageState(lang);
    localStorage.setItem("carnyx_preferred_language", lang);

    let activeProfileId = profileId;
    if (!activeProfileId) {
      const activeSession = await db.getActiveUserAndProfile();
      if (activeSession.profile) {
        activeProfileId = activeSession.profile.id;
      }
    }

    if (activeProfileId) {
      try {
        await db.updatePreferredLanguage(activeProfileId, lang);
      } catch (e) {
        console.warn("Failed to persist preferred language to database:", e);
      }
    }
  };

  const t = (key: keyof typeof translations.en, replacements?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let val = dict[key] || translations.en[key] || String(key);
    
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v));
      });
    }
    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
