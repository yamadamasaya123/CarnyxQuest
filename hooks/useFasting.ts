import { useState, useEffect, useCallback } from "react";
import { FastingSession } from "../types/fasting";
import { fetchCurrentActiveSession, startFastingSession, stopFastingSession, fetchFastingHistory, WATER_MILESTONES, MilestoneInfo } from "../lib/fasting";

export function useFasting(profileId: string | undefined) {
  const [activeSession, setActiveSession] = useState<FastingSession | null>(null);
  const [history, setHistory] = useState<FastingSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [reachedMilestones, setReachedMilestones] = useState<MilestoneInfo[]>([]);

  const loadFastingData = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const active = await fetchCurrentActiveSession(profileId);
      setActiveSession(active);
      const past = await fetchFastingHistory(profileId);
      setHistory(past);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadFastingData();
  }, [loadFastingData]);

  // Handle timer tick
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      setReachedMilestones([]);
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(activeSession.startedAt).getTime();
      const now = Date.now();
      const elapsedSecs = Math.max(0, Math.floor((now - start) / 1000));
      setElapsedSeconds(elapsedSecs);

      // Check milestones
      const elapsedHrs = elapsedSecs / 3600;
      const unlocked = WATER_MILESTONES.filter(m => elapsedHrs >= m.hoursReached);
      setReachedMilestones(unlocked);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const startFast = async (protocolName: string, targetHours: number) => {
    if (!profileId) return null;
    const res = await startFastingSession(profileId, protocolName, targetHours);
    if (res) {
      setActiveSession(res);
    }
    return res;
  };

  const endFast = async (save: boolean = true) => {
    if (!activeSession) return null;
    const res = await stopFastingSession(activeSession.id, save);
    setActiveSession(null);
    await loadFastingData();
    return res;
  };

  return {
    activeSession,
    history,
    loading,
    elapsedSeconds,
    reachedMilestones,
    startFast,
    endFast,
    refreshFasting: loadFastingData
  };
}
