"use client";

import React, { useState, useEffect } from "react";
import LayoutWrapper from "../../components/ui/LayoutWrapper";
import FastingTimer from "../../components/fasting/FastingTimer";
import ProtocolSelector from "../../components/fasting/ProtocolSelector";
import MilestoneTracker from "../../components/fasting/MilestoneTracker";
import { FastingProtocolInfo } from "../../lib/fasting";
import { useAuth } from "../../hooks/useAuth";
import { useFasting } from "../../hooks/useFasting";
import { useProfile } from "../../hooks/useProfile";
import { formatDate } from "../../utils/formatters";
import { Sparkles, Calendar, Award, ShieldAlert, Cpu } from "lucide-react";

export default function FastingPage() {
  const { user } = useAuth();
  const { refreshProfile } = useProfile(user?.id);
  const {
    activeSession,
    history,
    loading,
    elapsedSeconds,
    reachedMilestones,
    startFast,
    endFast,
    refreshFasting
  } = useFasting(user?.id);

  const [selectedProtocol, setSelectedProtocol] = useState<string>("OMAD");
  const [selectedHours, setSelectedHours] = useState<number>(24);
  const [notification, setNotification] = useState<string | null>(null);

  // Trigger setup default selection based on active session if found
  useEffect(() => {
    if (activeSession) {
      setSelectedProtocol(activeSession.protocolName);
      setSelectedHours(activeSession.targetDurationHours);
    }
  }, [activeSession]);

  const handleProtocolSelect = (p: FastingProtocolInfo) => {
    setSelectedProtocol(p.name);
    setSelectedHours(p.durationHours);
  };

  const handleCommence = async () => {
    const res = await startFast(selectedProtocol, selectedHours);
    if (res) {
      triggerToast(`${selectedProtocol} metabolic window sequence initiated successfully.`);
    }
  };

  const handleComplete = async (save: boolean) => {
    const res = await endFast(save);
    if (save && res) {
      triggerToast(`Fasting records sealed in ledger. Awarded +${res.xpEarned} raw XP coordinates!`);
      // Update profile status in background
      refreshProfile();
    } else {
      triggerToast("Fasting countdown reset. Records discarded.");
    }
  };

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-amber-500 uppercase tracking-widest animate-pulse">
          Opening Autophagy Chambers...
        </span>
      </div>
    );
  }

  return (
    <LayoutWrapper activeNav="fasting">
      
      {/* TOAST ALERT */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-amber-500/40 text-amber-100 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slideIn max-w-sm">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="text-xs font-mono font-medium leading-relaxed">{notification}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* TIMER HEAD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FastingTimer
              elapsedSeconds={elapsedSeconds}
              isActive={!!activeSession}
              targetHours={selectedHours}
              protocolName={selectedProtocol}
              onStart={handleCommence}
              onEnd={handleComplete}
            />
          </div>
          <div className="lg:col-span-1">
            <MilestoneTracker elapsedSeconds={elapsedSeconds} />
          </div>
        </div>

        {/* SELECTOR WINDOW */}
        <ProtocolSelector
          selectedProtocol={selectedProtocol}
          onSelect={handleProtocolSelect}
          disabled={!!activeSession}
        />

        {/* LOG HISTORY BLOCK */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-4 font-mono text-xs">
          <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            HISTORICAL AUTOPHAGY LEDGER
          </h3>

          <div className="space-y-2">
            {history.length > 0 ? (
              history.map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-900 rounded-xl hover:bg-slate-900/80 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-extrabold">{session.protocolName} Complete</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        session.isCompleted 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/10"
                      }`}>
                        {session.isCompleted ? "TARGET REACHED" : "INTERRUPTED"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Initiated {formatDate(session.startedAt)}
                    </span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] text-slate-500">{session.targetDurationHours}hr goal</span>
                    <span className="text-amber-500 font-bold block">+{session.xpEarned} XP</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-slate-500">No preceding metabolic sessions recorded in the Cloud database ledger.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </LayoutWrapper>
  );
}
