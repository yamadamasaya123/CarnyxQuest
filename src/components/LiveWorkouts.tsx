import React, { useState, useEffect } from "react";
import { db, getWorkoutXp } from "../lib/db";
import { useLanguage } from "../lib/LanguageContext";
import { WorkoutLog } from "../types";
import {
  Dumbbell,
  Search,
  Plus,
  Calendar,
  Clock,
  MessageCircle,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Trash2,
  Loader2
} from "lucide-react";

interface LiveWorkoutsProps {
  profileId: string;
  onWorkoutLogged?: (xpEarned: number, leveledUp: boolean) => void;
}

export default function LiveWorkouts({ profileId, onWorkoutLogged }: LiveWorkoutsProps) {
  const { t, language } = useLanguage();
  // State variables for form logging
  const [exerciseName, setExerciseName] = useState<string>("");
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weightKg, setWeightKg] = useState<number>(60);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [notes, setNotes] = useState<string>("");
  const [workoutDate, setWorkoutDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedWgerId, setSelectedWgerId] = useState<number | undefined>(undefined);

  // Searching exercises using local proxy
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [wgerSearchWarning, setWgerSearchWarning] = useState<string | null>(null);

  // Exercises history logs
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    success: boolean;
    msg: string;
    xpEarned?: number;
  } | null>(null);

  useEffect(() => {
    fetchHistory();

    const handleUpdate = () => {
      fetchHistory();
    };

    window.addEventListener("workouts_updated", handleUpdate);
    return () => {
      window.removeEventListener("workouts_updated", handleUpdate);
    };
  }, [profileId]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await db.getWorkoutLogs(profileId);
      setWorkoutHistory(history);
      const prof = await db.getProfile(profileId);
      setProfile(prof);
    } catch (err) {
      console.error("Failed to load workout history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Live search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setWgerSearchWarning(null);
      return;
    }

    setWgerSearchWarning(null);
    const delayDebounce = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const res = await fetch(`/api/wger-proxy?query=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.exercises || []);
          if (data.usingFallback) {
            setWgerSearchWarning(data.warning || (language === "id" ? "⚠ Wger tidak tersedia. Menampilkan katalog latihan lokal." : "⚠ Wger unavailable. Showing local exercise catalog."));
          } else {
            setWgerSearchWarning(null);
          }
        } else {
          setSuggestions([]);
          setWgerSearchWarning(language === "id" ? "⚠ Wger tidak tersedia. Menampilkan katalog latihan lokal." : "⚠ Wger unavailable. Showing local exercise catalog.");
        }
      } catch (err) {
        console.error("Failed searching exercises:", err);
        setSuggestions([]);
        setWgerSearchWarning(language === "id" ? "⚠ Wger tidak tersedia. Menampilkan katalog latihan lokal." : "⚠ Wger unavailable. Showing local exercise catalog.");
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, language]);

  const handleSelectExercise = (ex: any) => {
    setExerciseName(ex.name);
    setSelectedWgerId(ex.id);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) {
      setSubmitFeedback({ success: false, msg: language === "id" ? "Nama latihan harus diisi." : "Exercise name is required." });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitFeedback(null);

      const result = await db.saveWorkoutLog(profileId, {
        exerciseName,
        sets: Number(sets),
        reps: Number(reps),
        weightKg: Number(weightKg),
        durationMinutes: Number(durationMinutes),
        notes: notes.trim(),
        wgerExerciseId: selectedWgerId,
        workoutDate,
      });

      if (result.success) {
        setSubmitFeedback({
          success: true,
          msg: language === "id" ? `Kekuatan metabolik terdaftar! Latihan tercatat: ${exerciseName}` : `Metabolic force registered! Recorded workout: ${exerciseName}`,
          xpEarned: result.xpEarned,
        });

        // Trigger parent callback to float notifications
        if (onWorkoutLogged) {
          onWorkoutLogged(result.xpEarned, result.leveledUp);
        }

        // Reset form variables optionally
        setExerciseName("");
        setSelectedWgerId(undefined);
        setNotes("");
        fetchHistory();

        // Clear feedback after some seconds
        setTimeout(() => setSubmitFeedback(null), 5000);
      }
    } catch (err: any) {
      setSubmitFeedback({
        success: false,
        msg: err.message || (language === "id" ? "Gagal mencatat sesi latihan." : "Failed to record workout session."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (catId?: number): string => {
    if (language === "id") {
      switch (catId) {
        case 10: return "Dada / Dorong";
        case 8: return "Lengan / Hipertrofi Lengan";
        case 9: return "Kaki / Kuadrisep";
        case 12: return "Punggung / Tarik Vertikal";
        case 11: return "Bahu";
        case 14: return "Betis";
        default: return "Seluruh Tubuh / Kompon";
      }
    }
    switch (catId) {
      case 10: return "Chest / Pushing";
      case 8: return "Arms / Arms Hypertrophy";
      case 9: return "Legs / Quadriceps";
      case 12: return "Back / Vertical Pulling";
      case 11: return "Shoulders";
      case 14: return "Calves";
      default: return "Full-Body / Compound";
    }
  };

  return (
    <div id="workouts-section-container" className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600/10 via-slate-900 to-slate-950 border border-amber-900/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Dumbbell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10 tracking-widest font-mono uppercase">
              {language === "id" ? "SISTEM KEKUATAN METABOLIK" : "METABOLIC STRENGTH SYSTEM"}
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">{t("metabolicWorkoutsTitle")}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LOG WORKOUT FORM PANEL */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold font-mono tracking-wider text-amber-400 uppercase border-b border-slate-900 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" />
            <span>{language === "id" ? "MULAI PENCATATAN LATIHAN" : "COMMENCE WORKOUT LOGGING"}</span>
          </h3>

          {/* SUGGESTIVE LIBRARIES SEARCH */}
          <div className="space-y-2 relative">
            <label className="block text-[11px] font-mono uppercase text-slate-400">
              {t("wgerSearchTitle")}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t("wgerSearchPlaceholder")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-10 py-3 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              {loadingSearch && (
                <Loader2 className="w-4 h-4 text-amber-500 absolute right-3.5 top-3.5 animate-spin" />
              )}
            </div>

            {loadingSearch && (
              <div className="text-[11px] text-amber-500 font-mono flex items-center gap-2 mt-1 animate-pulse" id="wger-searching-indicator">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t("wgerSearching")}</span>
              </div>
            )}

            {wgerSearchWarning && (
              <div className="bg-red-950/40 border border-red-500/20 text-red-400 text-[11px] font-mono p-3 rounded-xl flex items-start gap-2 mt-1 sm:items-center" id="wger-warning-indicator">
                <div className="text-amber-500 shrink-0 font-bold">{language === "id" ? "⚠️ Pemberitahuan:" : "⚠️ Notice:"}</div>
                <div className="leading-tight">{wgerSearchWarning}</div>
              </div>
            )}

            {/* SUGGESTIONS MENU */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[72px] inset-x-0 bg-slate-900 border border-slate-800 rounded-xl max-h-56 overflow-y-auto shadow-2xl z-20">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectExercise(item)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-850/60 border-b border-slate-950/40 text-xs flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {language === "id" ? "Kategori: " : "Category: "}{getCategoryLabel(item.category)}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 shrink-0">
                      {language === "id" ? "Pilih" : "Select"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && searchQuery.trim() && !loadingSearch && suggestions.length === 0 && (
              <div className="absolute top-[72px] inset-x-0 bg-slate-900 border border-slate-800 rounded-xl p-4 text-center shadow-2xl z-20 text-xs text-slate-400 font-mono" id="wger-no-results-indicator">
                {t("wgerNoResults")}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase text-slate-400">
                  {t("exerciseNameLabel")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("exerciseNamePlaceholder")}
                  value={exerciseName}
                  onChange={(e) => {
                    setExerciseName(e.target.value);
                    setSelectedWgerId(undefined);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-sans font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase text-slate-400">
                  {language === "id" ? "Tanggal Target" : "Target Date"}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono"
                  />
                  <Calendar className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] sm:text-[11px] font-mono uppercase text-slate-400 whitespace-nowrap">
                  {t("setsLabel")}
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={sets}
                  onChange={(e) => setSets(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono text-center"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] sm:text-[11px] font-mono uppercase text-slate-400 whitespace-nowrap">
                  {t("repsLabel")}
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={reps}
                  onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono text-center"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] sm:text-[11px] font-mono uppercase text-slate-400 whitespace-nowrap">
                  {t("weightKgLabel")}
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono text-center"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] sm:text-[11px] font-mono uppercase text-slate-400 whitespace-nowrap">
                  {t("durationMinutesLabel")}
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase text-slate-400">
                {t("workoutNotesLabel")}
              </label>
              <span className="text-[10px] text-amber-500/80 font-bold block mb-1.5 font-mono">
                {t("notesOptional")}
              </span>
              <textarea
                placeholder={t("workoutNotesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 outline-none font-sans resize-none"
              />
            </div>

            {submitFeedback && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
                  submitFeedback.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                }`}
              >
                {submitFeedback.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Dumbbell className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
                )}
                <div>
                  <div className="font-semibold">{submitFeedback.msg}</div>
                  {submitFeedback.xpEarned && (
                    <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold uppercase">
                      🏅 +{submitFeedback.xpEarned} XP Earned!
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-slate-800 disabled:to-slate-850 text-white font-mono font-black py-3 rounded-xl text-xs cursor-pointer tracking-wider transition-all uppercase flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{t("loggingWorkoutButton")}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white fill-current" />
                  <span>{t("logWorkoutButton")} (+{getWorkoutXp(profile)} XP)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* WORKOUT JOURNAL / RECENT HISTORY */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold font-mono tracking-wider text-amber-400 uppercase border-b border-slate-900 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{t("registeredWorkoutsHistory")}</span>
              </span>
              <span className="text-[10px] font-normal text-slate-500 font-mono normal-case">
                {workoutHistory.length} {language === "id" ? "entri" : "entries"}
              </span>
            </h3>

            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="text-xs text-slate-500 font-mono">{language === "id" ? "MEMUAT DATA..." : "LOADING SACRED SCROLLS..."}</span>
              </div>
            ) : workoutHistory.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-900/10 border-2 border-dashed border-slate-900 rounded-xl space-y-3">
                <Dumbbell className="w-10 h-10 text-slate-700 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                    {language === "id" ? "BELUM ADA JURNAL LATIHAN" : "NO WORKOUT JOURNAL ENTRIES"}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    {t("noWorkoutsRegistered")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {workoutHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-amber-600/20 rounded-xl transition-all space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-100 text-xs font-sans leading-snug">
                          {item.exerciseName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                          <span className="text-amber-500 font-bold bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/15">
                            {item.sets} {language === "id" ? "Set" : "Sets"} × {item.reps} {language === "id" ? "Repetisi" : "Reps"}
                          </span>
                          <span className="text-slate-500">{language === "id" ? "pada" : "at"}</span>
                          <span className="text-slate-200 font-bold">{item.weightKg} KG</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap shrink-0">
                        {item.workoutDate}
                      </span>
                    </div>

                    {item.notes && (
                      <div className="text-[11px] text-slate-400 italic bg-black/20 p-2 rounded-lg border border-slate-900 font-sans leading-relaxed flex gap-1 items-start">
                        <MessageCircle className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                        <span>{item.notes}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900/50">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span>{item.durationMinutes} {language === "id" ? "menit durasi" : "minutes duration"}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold uppercase text-[9px]">
                        <Zap className="w-3 h-3 fill-current" />
                        <span>+{getWorkoutXp(profile)} XP LOG</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
