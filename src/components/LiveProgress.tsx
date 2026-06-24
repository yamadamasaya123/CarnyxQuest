import React, { useState, useEffect } from "react";
import { db } from "../lib/db";
import { useLanguage } from "../lib/LanguageContext";
import { ProgressRecord, FastingSession } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  Scale,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Award,
  Zap,
  Activity,
  Plus,
} from "lucide-react";

interface LiveProgressProps {
  profileId: string;
}

export default function LiveProgress({ profileId }: LiveProgressProps) {
  const { t, language } = useLanguage();
  const [weights, setWeights] = useState<ProgressRecord[]>([]);
  const [weightInput, setWeightInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");

  const [fastHistory, setFastHistory] = useState<FastingSession[]>([]);
  const [streak, setStreak] = useState<any>(null);

  const loadData = async () => {
    const wt = await db.getWeightLogs(profileId);
    setWeights(wt);
    const fh = await db.getFastingHistory(profileId);
    setFastHistory(fh);
    const str = await db.getStreak(profileId);
    setStreak(str);
  };

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

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const wtNum = parseFloat(weightInput);
    if (!wtNum || isNaN(wtNum)) return;

    await db.logWeight(profileId, wtNum, notesInput);
    window.dispatchEvent(new Event("weight_updated"));
    
    const wt = await db.getWeightLogs(profileId);
    setWeights(wt);
    setWeightInput("");
    setNotesInput("");
  };

  // Calculations for KPI Cards
  const sortedWeights = [...weights].sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : 0;
  const initialWeight = sortedWeights.length > 0 ? sortedWeights[0].weight : 0;
  const totalChange = sortedWeights.length >= 2 ? currentWeight - initialWeight : 0;

  const currentStreakVal = streak?.currentStreak || 0;
  const longestStreakVal = streak?.longestStreak || 0;

  // Filter weights from the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weightsThisWeek = sortedWeights.filter(w => new Date(w.recordDate).getTime() >= oneWeekAgo.getTime());
  const weightThisWeekVal = weightsThisWeek.length > 0 ? weightsThisWeek[weightsThisWeek.length - 1].weight : currentWeight;

  // Weekly Change: Current weight compared to weight logged 7 or more days ago (if exists), or earliest
  let weeklyChangeVal = 0;
  let hasWeeklyChange = false;
  if (sortedWeights.length >= 2) {
    const latest = sortedWeights[sortedWeights.length - 1];
    const earlier = sortedWeights.filter(w => new Date(w.recordDate).getTime() < oneWeekAgo.getTime());
    const compareTo = earlier.length > 0 ? earlier[earlier.length - 1] : sortedWeights[0];
    if (compareTo && compareTo.id !== latest.id) {
      weeklyChangeVal = latest.weight - compareTo.weight;
      hasWeeklyChange = true;
    }
  }
  
  const lastFastSession = fastHistory.find((f) => f.status === "completed" || f.completed);
  const lastFastDate = lastFastSession 
    ? `${new Date(lastFastSession.endTime!).toLocaleDateString()} (${Math.round((new Date(lastFastSession.endTime!).getTime() - new Date(lastFastSession.startTime).getTime()) / (1000 * 3600))}h)` 
    : (language === "id" ? "Belum ada puasa yang selesai" : "No completed fasts yet");

  // Formulate data for the Recharts weight line
  const chartWeightData = sortedWeights.map((w) => {
    const d = new Date(w.recordDate);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: w.weight,
    };
  });

  // Formulate data for Recharts fasting history (calculate hours elapsed)
  const chartFastData = [...fastHistory]
    .reverse()
    .slice(-7)
    .map((fh) => {
      if (!fh.endTime) return null;
      const hours = Math.round(
        (new Date(fh.endTime).getTime() - new Date(fh.startTime).getTime()) / (1000 * 60 * 60)
      );
      return {
        session: new Date(fh.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        hours,
        status: fh.status,
      };
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* KPI METRIC cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {/* STREAK Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/20 text-center space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-1 w-full bg-amber-500"></div>
          <Zap className="w-5 h-5 mx-auto text-amber-500" />
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
            {language === "id" ? "Catatan Beruntun" : "Streak Records"}
          </span>
          <span className="text-xl font-black font-mono text-slate-100 block">
            {currentStreakVal} / {longestStreakVal} {language === "id" ? "Hari" : "Days"}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">
            {language === "id" ? "Saat Ini / Terlama" : "Current / Longest"}
          </span>
        </div>

        {/* CURRENT WEIGHT Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/20 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-red-500"></div>
          <Scale className="w-5 h-5 mx-auto text-red-400" />
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
            {language === "id" ? "Berat Saat Ini" : "Current Weight"}
          </span>
          <span className="text-xl font-black font-mono text-slate-100 block">
            {currentWeight > 0 ? `${currentWeight} kg` : (language === "id" ? "Belum ada entri" : "No entries")}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">
            {language === "id"
              ? `Awal: ${initialWeight > 0 ? `${initialWeight} kg` : "Belum diatur"}`
              : `Initial: ${initialWeight > 0 ? `${initialWeight} kg` : "Unset"}`}
          </span>
        </div>

        {/* WEIGHT THIS WEEK Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/20 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-orange-500"></div>
          <Calendar className="w-5 h-5 mx-auto text-orange-400" />
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
            {language === "id" ? "Berat Minggu Ini" : "Weight this Week"}
          </span>
          <span className="text-xl font-black font-mono text-slate-100 block">
            {weightThisWeekVal > 0 ? `${weightThisWeekVal} kg` : (language === "id" ? "Belum ada entri" : "No entries")}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">
            {language === "id"
              ? `${weightsThisWeek.length} entri dalam 7 hari`
              : `${weightsThisWeek.length} entries in 7 days`}
          </span>
        </div>

        {/* WEEKLY CHANGE Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/20 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500"></div>
          {weeklyChangeVal < 0 ? (
            <TrendingDown className="w-5 h-5 mx-auto text-emerald-400" />
          ) : (
            <TrendingUp className="w-5 h-5 mx-auto text-red-400" />
          )}
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
            {language === "id" ? "Perubahan Mingguan" : "Weekly Change"}
          </span>
          <span className="text-xl font-black font-mono text-slate-100 block">
            {hasWeeklyChange ? (
              `${weeklyChangeVal <= 0 ? "" : "+"}${weeklyChangeVal.toFixed(1)} kg`
            ) : (
              language === "id" ? "Tidak ada perbandingan" : "No comparison"
            )}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">
            {language === "id" ? "Lintasan dinamis" : "Dynamic trajectory"}
          </span>
        </div>

        {/* LATEST COMPLETED FAST */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/20 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-rose-500"></div>
          <Award className="w-5 h-5 mx-auto text-rose-500 animate-pulse" />
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
            {language === "id" ? "Puasa Selesai Terakhir" : "Last Completed Fast"}
          </span>
          <span className="text-[10px] font-bold font-mono text-rose-300 block truncate mt-1">
            {lastFastDate}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">
            {language === "id" ? "Keberhasilan anatomi" : "Anatomical success"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHRONICLE FORM WEIGHT ENTRY */}
        <div className="lg:col-span-4 bg-slate-950 text-slate-100 rounded-2xl p-5 border border-amber-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full pointer-events-none"></div>

          <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-400 mb-4 flex items-center gap-1.5 border-b border-slate-900 pb-2">
            <Scale className="w-4 h-4 text-amber-500" />
            {language === "id" ? "Simpan Catatan Berat Badan" : "Lock In Weight Entry"}
          </h4>

          <form onSubmit={handleLogWeight} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-slate-400 font-mono">
                {language === "id" ? "Massa Saat Ini (kg)" : "Current Mass (kg)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="30"
                max="300"
                required
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="e.g. 83.5"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-slate-400 font-mono">
                {language === "id" ? "Catatan Manifestasi Fisik" : "Physical Manifest Notes"}
              </label>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder={language === "id" ? "Merasa sangat ramping, vaskularitas terlihat di otot perut bawah, pembakaran lemak optimal." : "Feeling incredibly streamlined, vascularity showing in lower obliques, fat-burning is optimal."}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold font-mono uppercase tracking-wider text-xs py-3 h-10 cursor-pointer rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{language === "id" ? "Catat Entri Berat Badan" : "Record weight entry"}</span>
            </button>
          </form>

          {/* HISTORIES LIST */}
          <div className="mt-6 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono block">
              {language === "id" ? "Riwayat Log Berat Badan Terakhir" : "Recent Weight Log history"}
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
              {sortedWeights.slice().reverse().map((w) => (
                <div key={w.id} className="p-2 bg-slate-900 border border-slate-850 rounded-lg flex justify-between justify-items-center">
                  <div>
                    <span className="font-bold text-slate-200">{w.weight} kg</span>
                    <span className="text-[9px] text-slate-500 font-mono block">{w.recordDate}</span>
                  </div>
                  {w.bodyMeasurement && (
                    <span className="text-[9.5px] italic text-slate-400 block truncate max-w-[150px]">
                      "{w.bodyMeasurement}"
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VISUAL CHARTS: Right columns */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-6">
          {/* CHART 1: Weight Chart */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" />
              {language === "id" ? "Perkembangan Berat Badan dari Waktu ke Waktu (kg)" : "Weight progress over time (kg)"}
            </h4>
            <div className="h-48 w-full mt-2">
              {chartWeightData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-600">
                  {language === "id" ? "Catat setidaknya 2 entri berat badan di atas untuk melihat grafik." : "Log at least 2 weights above to see lines."}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartWeightData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#db2777" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#db2777" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "9px", fontFamily: "monospace" }} />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#64748b" style={{ fontSize: "9px", fontFamily: "monospace" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #334155" }} labelStyle={{ fontWeight: "bold", fontSize: "11px", color: "#f8fafc" }} itemStyle={{ fontSize: "11px", color: "#fb7185" }} />
                    <Area type="monotone" dataKey="weight" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#weightGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* CHART 2: Fasting durations */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-500" />
              {language === "id" ? "Durasi Riwayat Puasa (Jam Berturut-turut)" : "Fasting History Duration (consecutive Hours)"}
            </h4>
            <div className="h-44 w-full mt-2">
              {chartFastData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-600">
                  {language === "id" ? "Selesaikan protokol puasa di simulator jam untuk melihat diagram batang." : "Complete fasting protocols in the clock simulator to plot bars."}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartFastData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="session" stroke="#64748b" style={{ fontSize: "9px", fontFamily: "monospace" }} />
                    <YAxis stroke="#64748b" style={{ fontSize: "9px", fontFamily: "monospace" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #334155" }} labelStyle={{ fontWeight: "bold", color: "#f8fafc" }} />
                    <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
