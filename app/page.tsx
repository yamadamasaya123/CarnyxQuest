"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchActiveSession } from "../lib/auth";
import { Sparkles, Trophy, Flame, GraduationCap, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { user } = await fetchActiveSession();
      if (user) {
        setHasUser(true);
        if (router) {
          router.push("/dashboard");
        }
      } else {
        setLoading(false);
      }
    }
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-amber-500 uppercase tracking-widest animate-pulse">Syncing Primal Portal...</span>
      </div>
    );
  }

  const handleRoute = (path: string) => {
    if (router) {
      router.push(path);
    } else {
      // client-side SPA routing fallback
      window.location.hash = path;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* LANDING MASTHEAD BANNER */}
      <div className="bg-slate-900/60 border-b border-amber-900/10 px-4 py-2.5 text-[10px] md:text-xs text-slate-400 font-mono flex justify-between items-center w-full">
        <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/15">
          Academic Thesis Prototype
        </span>
        <span className="text-slate-500">June 18, 2026 Defence Portal</span>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] md:text-xs text-amber-400 font-mono uppercase tracking-widest">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>METABOLIC STRATEGIST STUDY APPARATUS</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-none">
            Carnyx<span className="text-amber-500 font-light">Quest</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Gamified physical survivor dashboards. Track zero-carb prey meals, calculate autophagy cleansing cycles, build metabolic fire streaks, and earn ancestral class honors.
          </p>
        </div>

        {/* Action button gateways */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs sm:max-w-md mx-auto">
          <Button 
            variant="amber" 
            size="lg" 
            onClick={() => handleRoute("/login")}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <span>JOIN THE RAID (LOGIN)</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button 
            variant="secondary" 
            size="lg" 
            onClick={() => handleRoute("/register")}
            className="flex-1"
          >
            RECRUIT NEW SURVIVOR
          </Button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left max-w-3xl mx-auto">
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-1.5">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="text-xs font-bold text-slate-200 font-mono tracking-wide uppercase">METABOLIC FIRE</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Form consistent daily covenants. Scale streak records and unlock Golden Points.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-1.5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-200 font-mono tracking-wide uppercase">ANCESTRAL BADGES</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Acquire legendary achievements through hard discipline and pristine fasting completion.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-1.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 font-mono tracking-wide uppercase">AUTOPHAGY TIMER</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Toggle five structured fasting protocols. Monitor molecular milestones and adapt cells.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-900 text-center text-[10px] text-slate-550">
        CarnyxQuest © 2026. Prepared for Computer Science Thesis evaluation.
      </footer>
    </div>
  );
}
