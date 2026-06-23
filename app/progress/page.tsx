"use client";

import React, { useState, useEffect } from "react";
import LayoutWrapper from "../../components/ui/LayoutWrapper";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useFasting } from "../../hooks/useFasting";
import { calculateWeightDifferential } from "../../utils/calculations";
import { formatDate } from "../../utils/formatters";
import Button from "../../components/ui/Button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Scale, Heart, Sparkles, TrendingDown, Clock, ShieldCheck, Activity } from "lucide-react";

export default function ProgressPage() {
  const { user } = useAuth();
  const { streak, refreshProfile } = useProfile(user?.id);
  const { history } = useFasting(user?.id);

  const [weightRecords, setWeightRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Weights form values
  const [weightKg, setWeightKg] = useState<string>("82.5");
  const [ketones, setKetones] = useState<string>("1.2");
  const [notes, setNotes] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadWeightProgress = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/progress?profileId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setWeightRecords(data.records);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
       loadWeightProgress();
    }
  }, [user?.id]);

  const handlePrimalTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setAdding(true);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: user.id,
          weightKg,
          ketonesMmol: ketones,
          notes
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("Body weight coordinate sealed in ledger.");
        setNotes("");
        await loadWeightProgress();
        await refreshProfile();
      }
    } catch {
      triggerToast("Failed to seal weight coordinates.");
    } finally {
      setAdding(false);
    }
  };

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Compute weight statistics
  const currentWeight = weightRecords.length > 0 ? parseFloat(weightRecords[0].weight_kg || weightRecords[0].weightKg) : 85.0;
  const baselineWeight = weightRecords.length > 1 ? parseFloat(weightRecords[weightRecords.length - 1].weight_kg || weightRecords[weightRecords.length - 1].weightKg) : currentWeight;
  const deltaStats = calculateWeightDifferential(currentWeight, baselineWeight);

  // Parse chart coordinates data (reversed list chronological order)
  const chartData = weightRecords.slice().reverse().map(item => ({
    name: formatDate(item.created_at || item.createdAt).split(",")[0],
    weight: parseFloat(item.weight_kg || item.weightKg),
    ketones: item.ketones_mmol ? parseFloat(item.ketones_mmol) : 0
  }));

  const lastFastEvent = history.length > 0 ? history[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-indigo-500 uppercase tracking-widest animate-pulse">
          Translating Telemetry Indices...
        </span>
      </div>
    );
  }

  return (
    <LayoutWrapper activeNav="progress">
      
      {/* TOAST PANEL */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-amber-500/40 text-amber-100 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slideIn max-w-sm">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="text-xs font-mono font-medium leading-relaxed">{notification}</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* ROW 1: WEIGHT CHECKS SUMMARY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current weight */}
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-slate-500 font-bold font-mono uppercase block">CURRENT WEIGHT</span>
            <div className="text-lg font-black font-mono text-slate-100">{currentWeight.toFixed(1)} kg</div>
            <span className="text-[8px] text-slate-650 font-mono italic block">Active skeletal mass</span>
          </div>

          {/* Weight delta */}
          <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-slate-500 font-bold font-mono uppercase block">PROGRESS TREND</span>
            <div className={`text-lg font-black font-mono flex items-center justify-center gap-1.5 ${
              deltaStats.status === "loss" ? "text-emerald-450" : deltaStats.status === "gain" ? "text-red-400" : "text-slate-400"
            }`}>
              <TrendingDown className="w-4 h-4" />
              <span>{deltaStats.diff}</span>
            </div>
            <span className="text-[8px] text-slate-650 font-mono italic block">Since recording kickoff</span>
          </div>

          {/* Current fire streak */}
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-slate-500 font-bold font-mono uppercase block">CONSISTENCY STREAK</span>
            <div className="text-lg font-black font-mono text-orange-500">{streak?.current || 1} Days</div>
            <span className="text-[8px] text-slate-650 font-mono block">Max record {streak?.longest || 1} Days</span>
          </div>

          {/* Last complete fast */}
          <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-xl text-center space-y-0.5">
            <span className="text-[9px] text-slate-500 font-bold font-mono uppercase block">LAST CYCLE</span>
            <div className="text-xs font-bold font-mono text-indigo-400 pt-1">
              {lastFastEvent ? `${lastFastEvent.protocolName} Complete` : "CLOCK IDLE"}
            </div>
            <span className="text-[8px] text-slate-650 font-mono block">
              {lastFastEvent ? `Earned +${lastFastEvent.xpEarned} XP` : "No ongoing fast trials"}
            </span>
          </div>
        </div>

        {/* RECHARTS CHRONOLOGICAL TREND VISUAL */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            TELEMETRY MASS CHRONOLOGICAL TREND
          </h3>

          <div className="h-60 w-full text-xs font-mono">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#161b24" />
                  <XAxis dataKey="name" stroke="#525d6e" />
                  <YAxis domain={['auto', 'auto']} stroke="#525d6e" />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600">
                <p>Register weight coordinates in the panel below to activate trend lines.</p>
              </div>
            )}
          </div>
        </div>

        {/* INPUT TELEMETRY DATA FORM CARD */}
        <form onSubmit={handlePrimalTelemetry} className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2">
            LOG RAW TELEMETRY CHECKPOINT
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Input weight */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[9px] text-slate-500 font-bold block uppercase">
                Body weight (kg)
              </label>
              <input
                type="text"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="78.5"
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none"
              />
            </div>

            {/* Input ketones */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[9px] text-slate-500 font-bold block uppercase">
                Blood ketones (mmol/L)
              </label>
              <input
                type="text"
                value={ketones}
                onChange={(e) => setKetones(e.target.value)}
                placeholder="1.2"
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none"
              />
            </div>

            {/* Input notes */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[9px] text-slate-500 font-bold block uppercase">
                Checkpoint diary notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Woke with stellar ketone ratios..."
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="amber"
              disabled={adding}
              className="flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>{adding ? "DETERMINING DENSITIES..." : "SEAL TELEMETRY COORDINATES"}</span>
            </Button>
          </div>
        </form>
      </div>

    </LayoutWrapper>
  );
}
export { ProgressPage };
