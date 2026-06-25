import React, { useState, useEffect, useRef } from "react";
import { db, DEFAULT_PROTOCOLS, DEFAULT_MILESTONES, addXpToProfile, BADGE_ID_MAP } from "../lib/db";
import { useLanguage } from "../lib/LanguageContext";
import { supabase } from "../lib/supabase";
import { FastingSession } from "../types";
import {
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Flame,
  BatteryCharging,
  Compass,
} from "lucide-react";

interface LiveFastingProps {
  profileId: string;
  onFastingComplete: (xpEarned: number, leveledUp: boolean) => void;
}

export default function LiveFasting({ profileId, onFastingComplete }: LiveFastingProps) {
  const [protocols] = useState(DEFAULT_PROTOCOLS);
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>(DEFAULT_PROTOCOLS[0].id);
  const { t, language } = useLanguage();

  const translateProtocolName = (name: string) => {
    return name;
  };

  const translateProtocolDescription = (desc: string) => {
    if (language !== "id") return desc;
    switch (desc) {
      case "Beginner fasting protocol with 16 hours fasting period and 8 hours eating window.":
        return "Protokol puasa bagi pemula dengan masa puasa 16 jam dan jendela makan 8 jam.";
      case "Advanced Window protocol, boosting cellular cleansing, ketosis activation, and fat burn.":
        return "Protokol tingkat lanjut, meningkatkan pembersihan seluler, aktivasi ketosis, dan pembakaran lemak.";
      case "One Meal A Day. Ultra high efficiency protocol for deep cognitive focus and metabolic flexibility.":
        return "Satu Kali Makan Sehari. Protokol efisiensi sangat tinggi untuk fokus kognitif mendalam dan fleksibilitas metabolisme.";
      case "Full daily gut reset on spring water or premium bone broth.":
        return "Penyetelan ulang sistem pencernaan harian secara penuh dengan air mineral atau kaldu tulang premium.";
      case "Extended Hunter Fast for structural autophagy, cellular clean up, and immune cell regeneration.":
        return "Puasa Pemburu yang Diperpanjang untuk autofagi struktural, pembersihan seluler, dan regenerasi sel imun.";
      default:
        return desc;
    }
  };

  const translateMilestoneLabel = (label: string) => {
    if (language !== "id") return label;
    switch (label) {
      case "Fat Adaptation Started": return "Adaptasi Lemak Dimulai";
      case "Halfway Ascent": return "Pendakian Setengah Jalan";
      case "Deep Lipid Phase": return "Fase Lipid Mendalam";
      case "Fast Completed": return "Puasa Selesai";
      case "Blood Glucose Drop": return "Penurunan Glukosa Darah";
      case "Ketosis Active": return "Ketosis Aktif";
      case "Growth Hormone Peak": return "Puncak Hormon Pertumbuhan";
      case "Glycogen Depleted": return "Glikogen Habis";
      case "Deep Ketosis": return "Ketosis Mendalam";
      case "Autophagy Surge": return "Lonjakan Autofagi";
      case "Stem Cell Influx": return "Aliran Sel Punca";
      case "Liver Depletion": return "Penyusutan Cadangan Hati";
      case "Fat-Burn Mode": return "Mode Pembakaran Lemak";
      case "Autophagy Shock": return "Kejutan Autofagi";
      case "Intestinal Reset": return "Atur Ulang Usus";
      case "Full Depletion": return "Pengosongan Penuh";
      case "Autophagy Peak": return "Puncak Autofagi";
      case "Inflammation Cleanse": return "Pembersihan Inflamasi";
      default: return label;
    }
  };

  const [activeSession, setActiveSession] = useState<FastingSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fastHistory, setFastHistory] = useState<FastingSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Auto-dismiss info message
  useEffect(() => {
    if (infoMsg) {
      const timer = setTimeout(() => {
        setInfoMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [infoMsg]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const active = await db.getActiveFastingSession(profileId);
      setActiveSession(active);
      const hist = await db.getFastingHistory(profileId);
      setFastHistory(hist);

      if (active) {
        setSelectedProtocolId(active.protocolId);
      } else {
        setElapsedSeconds(0);
      }
    } catch (err: any) {
      console.error("Fasting loading dynamic metrics error:", err);
      setErrorMsg(err?.message || "Critical: Failed to load user's fasting logs from active database.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load state on mount or profile change
  useEffect(() => {
    loadData();

    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener("fasting_history_updated", handleRefresh);
    window.addEventListener("meals_updated", handleRefresh);
    window.addEventListener("checkins_updated", handleRefresh);
    window.addEventListener("weight_updated", handleRefresh);

    return () => {
      window.removeEventListener("fasting_history_updated", handleRefresh);
      window.removeEventListener("meals_updated", handleRefresh);
      window.removeEventListener("checkins_updated", handleRefresh);
      window.removeEventListener("weight_updated", handleRefresh);
    };
  }, [profileId]);

  // Hook up stable drift-free timer interval
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const updateTime = () => {
      const startMs = new Date(activeSession.startTime).getTime();
      const currentMs = Date.now();
      const totalElapsed = Math.max(0, Math.floor((currentMs - startMs) / 1000));
      setElapsedSeconds(totalElapsed);
    };

    updateTime();

    if (!isPaused) {
      intervalRef.current = setInterval(updateTime, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeSession, isPaused]);

  const activeProtocol = protocols.find((p) => p.id === selectedProtocolId) || protocols[0];
  const targetSeconds = activeProtocol.targetHours * 3600;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

  // Milestones of active protocol
  const milestonesForActive = DEFAULT_MILESTONES.filter((m) => m.protocolId === activeProtocol.id);

  // Format Elapsed to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startNewFast = async () => {
    if (isActionLoading) return;
    try {
      setIsActionLoading(true);
      setErrorMsg(null);
      setInfoMsg(null);
      const session = await db.startFast(profileId, selectedProtocolId);
      setActiveSession(session);
      setElapsedSeconds(0);
      setIsPaused(false);
      const hist = await db.getFastingHistory(profileId);
      setFastHistory(hist);
      window.dispatchEvent(new Event("fasting_history_updated"));
    } catch (err: any) {
      console.error("Fasting start exception:", err);
      setErrorMsg(err?.message || "Unexpected failure when starting fasting session.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const stopOrCompleteFast = async (action: "complete" | "stop", hoursOverride?: number) => {
    if (!activeSession || isActionLoading) return;
    try {
      setIsActionLoading(true);
      setErrorMsg(null);
      setInfoMsg(null);
      // For simulation/testing: if user completes fast very quickly, let's allow simulating a 100% completed fast!
      // We update elapsed seconds artificially or calculate based on real time
      const finalHours = typeof hoursOverride === "number" ? hoursOverride : (elapsedSeconds / 3600);
      const targetHours = activeProtocol.targetHours;
      const meetsTarget = finalHours >= targetHours;

      const res = await db.stopFast(profileId, activeSession.id, action, finalHours);
      
      if (action === "complete" && meetsTarget) {
        onFastingComplete(res.xpEarned, res.leveledUp);
      } else {
        setInfoMsg("Fasting session closed.");
      }

      setActiveSession(null);
      setElapsedSeconds(0);
      setIsPaused(false);
      const hist = await db.getFastingHistory(profileId);
      setFastHistory(hist);
      window.dispatchEvent(new Event("fasting_history_updated"));
      window.dispatchEvent(new Event("checkins_updated"));
      window.dispatchEvent(new Event("meals_updated"));
      window.dispatchEvent(new Event("weight_updated"));
    } catch (err: any) {
      console.error("Fasting stop exception:", err);
      setErrorMsg(err?.message || "Unexpected error while concluding the active fasting session.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTimeTravel = undefined; // removed for production cleanup

  if (isLoading) {
    return (
      <div className="col-span-12 bg-slate-950 border border-slate-900 rounded-2xl p-8 text-center text-slate-400 space-y-4 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
        <p className="font-mono text-xs tracking-widest text-amber-500 uppercase animate-pulse">
          {language === "id" ? "Menyingkronkan Telemetri Metabolik..." : "Syncing Metabolic Telemetry..."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: TIMER CONTROLLER */}
      <div className="lg:col-span-7 bg-slate-950 text-slate-100 rounded-2xl p-5 md:p-6 border border-amber-950/40 relative overflow-hidden flex flex-col justify-between space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-amber-400">
            {language === "id" ? "Autofagi Metabolik" : "Metabolic Autophagy"}
          </h3>
        </div>

        {errorMsg && (
          <div className="bg-red-950/40 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="font-bold">{language === "id" ? "⚠️ Gangguan Koneksi:" : "⚠️ Connection Glitch:"}</span>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded font-mono font-bold text-[10px]"
            >
              {language === "id" ? "Coba Lagi" : "Retry"}
            </button>
          </div>
        )}

        {infoMsg && (
          <div className="bg-slate-900/60 border border-amber-500/20 text-slate-300 p-4 rounded-xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400">⚡ Status:</span>
              <span>{infoMsg}</span>
            </div>
            <button
              onClick={() => setInfoMsg(null)}
              className="text-slate-400 hover:text-slate-200 text-[10px] font-bold font-mono"
            >
              {language === "id" ? "Tutup" : "Dismiss"}
            </button>
          </div>
        )}

        {/* PROTOCOL SELECTOR (Only editable if not fasting) */}
        {!activeSession ? (
          <div className="space-y-3">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 font-mono">
              {language === "id" ? "Pilih Ritual Protokol Puasa" : "Choose Fasting Protocol Ritual"}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {protocols.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProtocolId(p.id)}
                  className={`border py-2 px-1 text-center rounded-xl transition-all cursor-pointer ${
                    selectedProtocolId === p.id
                      ? "bg-amber-950/40 border-amber-500 text-amber-400 font-bold shadow-md shadow-amber-500/5"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">{p.targetHours}H</div>
                </button>
              ))}
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl text-xs text-slate-400">
              <span className="font-bold text-slate-300">{language === "id" ? "Spesifikasi Protokol: " : "Protocol Spec: "}</span>
              {translateProtocolDescription(activeProtocol.description)}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-3.5 rounded-xl border border-amber-500/10 text-xs text-slate-400">
            <span className="text-amber-400 font-mono font-bold block mb-1">
              {language === "id" ? `🔥 PROTOKOL DIJALANKAN: ${activeProtocol.name}` : `🔥 COMMITTED protocol: ${activeProtocol.name}`}
            </span>
            {language === "id"
              ? "Saluran metabolisme Anda terkunci. Selesaikan perburuan Anda saat ini sebelum mengubah jam."
              : "Your metabolic channels are locked in. Complete your current hunt before modifying the clock."}
          </div>
        )}

        {/* LARGE INTUITIVE CLOCK */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-slate-900 flex flex-col items-center justify-center p-4 shadow-2xl relative">
            {/* Circular active gradient glow ring based on progress */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 pointer-events-none opacity-20 [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_80%,transparent_100%)] bg-gradient-to-tr ${
                activeSession ? "from-amber-500 to-red-500" : "from-slate-700 to-slate-800"
              }`}
            ></div>

            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 font-mono">
              {language === "id" ? "Durasi Berjalan" : "Elapsed Duration"}
            </span>
            <span className="text-2xl md:text-3xl font-mono font-black text-slate-100 tracking-wider my-1.5 font-bold">
              {formatTime(elapsedSeconds)}
            </span>
            <span className="text-[9.5px] uppercase font-bold text-amber-500/70 font-mono">
              {language === "id" ? `Target: ${activeProtocol.targetHours} jam` : `Target: ${activeProtocol.targetHours} hours`}
            </span>

            {activeSession && (
              <div className="mt-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-2 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1">
                <BatteryCharging className="w-3 h-3 animate-pulse" />
                <span>{language === "id" ? "AKTIF" : "ACTIVE"} {progressPercent}%</span>
              </div>
            )}
          </div>
        </div>

        {/* PROGRESS BAR */}
        {activeSession && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>{language === "id" ? "Pendakian Metabolik" : "Metabolic Ascent"}</span>
              <span>{progressPercent}% {language === "id" ? "Selesai" : "Complete"}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 transition-all duration-300"
              ></div>
            </div>
          </div>
        )}

        {/* CONTROL OPERATIONS */}
        <div className="space-y-4 pt-2">


          <div className="flex gap-3">
            {!activeSession ? (
              <button
                onClick={startNewFast}
                disabled={isActionLoading}
                className={`flex-1 font-black font-mono tracking-widest uppercase text-xs h-11 rounded-xl flex items-center justify-center gap-1.5 border active:scale-[0.99] shadow-lg transition-all ${
                  isActionLoading
                    ? "bg-amber-600/40 border-amber-500/10 text-white/50 cursor-not-allowed pointer-events-none"
                    : "bg-amber-600 hover:bg-amber-500 border-amber-500/20 cursor-pointer text-white"
                }`}
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>
                  {isActionLoading
                    ? (language === "id" ? "MENYALAKAN PROTOKOL..." : "IGNITING PROTOCOL...")
                    : (language === "id" ? "MULAI TRANSISI METABOLIK" : "IGNITE METABOLIC SHIFT")}
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseToggle}
                  disabled={isActionLoading}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-300 px-4 h-11 border border-slate-800 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isPaused ? <Play className="w-4 h-4 text-amber-500" /> : <Pause className="w-4 h-4 text-slate-400" />}
                </button>

                <button
                  onClick={() => stopOrCompleteFast("complete")}
                  disabled={isActionLoading}
                  className={`flex-1 font-extrabold font-mono tracking-wider uppercase text-xs h-11 rounded-xl flex items-center justify-center gap-1.5 border active:scale-[0.99] shadow-md transition-all ${
                    isActionLoading
                      ? "bg-emerald-600/40 border-emerald-500/10 text-white/50 cursor-not-allowed pointer-events-none"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-500/20 cursor-pointer text-white shadow-emerald-950/20"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isActionLoading
                      ? (language === "id" ? "MENYIMPAN..." : "SAVING...")
                      : (language === "id" ? "SELESAIKAN PUASA & CATAT" : "COMPLETE FAST & LOG")}
                  </span>
                </button>

                <button
                  onClick={() => stopOrCompleteFast("stop")}
                  disabled={isActionLoading}
                  className="bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold px-3 text-xs rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Abort fast"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden md:inline">{language === "id" ? "BATAL" : "ABORT"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: BIOLOGICAL MILESTONES & REWARDS */}
      <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            {language === "id" ? "Hadiah Pencapaian Biologis" : "Biological Milestone Rewards"}
          </h4>
          <p className="text-[10.5px] text-slate-500 mb-2">
            {language === "id"
              ? "Dapatkan pengganda pengalaman tinggi dengan mencapai tonggak anatomi utama selama puasa ini:"
              : "Earn high-experience multipliers by reaching key anatomical milestones during this fast:"}
          </p>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {milestonesForActive.map((m) => {
              const attained = elapsedSeconds / 3600 >= m.milestoneHour;
              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    attained
                      ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                      : "bg-slate-900/40 border-slate-850 text-slate-500"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block">{translateMilestoneLabel(m.label)}</span>
                    <span className="text-[9.5px] font-mono">
                      {language === "id"
                        ? `Membutuhkan ${m.milestoneHour} jam berturut-turut`
                        : `Requires ${m.milestoneHour} consecutive hours`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                      +{m.rewardXp} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAST HISTORY SNAPSHOT */}
        <div className="pt-3 border-t border-slate-900 font-mono text-[10px]">
          <span className="text-slate-500 uppercase font-bold tracking-wider block mb-2">
            {language === "id" ? "PUASA EKSPEDISI TERAKHIR" : "LAST EXPEDITION FAST"}
          </span>
          {fastHistory.length === 0 ? (
            <span className="text-slate-600 italic block font-mono">
              {language === "id" ? "Tidak ada koordinat riwayat puasa selesai yang ditemukan." : "No completed historical fast coordinates found."}
            </span>
          ) : (
            <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-200 block font-bold">
                  {language === "id"
                    ? `Protokol: ${fastHistory[0].status === "completed" ? "Berhasil Diselesaikan" : "Terputus"}`
                    : `Protocol: ${fastHistory[0].status === "completed" ? "Successfully Completed" : "Interrupted"}`}
                </span>
                <span className="text-slate-500 block text-[9px]">
                  {language === "id" ? "Dicatat pada: " : "Logged at: "}{new Date(fastHistory[0].createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                fastHistory[0].status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
              }`}>
                {language === "id"
                  ? (fastHistory[0].status === "completed" ? "SELESAI" : "TERPUTUS")
                  : fastHistory[0].status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
