import React, { useState } from "react";
import { PrimalClass } from "../types";
import { db } from "../lib/db";
import { useLanguage } from "../lib/LanguageContext";
import { Shield, Sparkles, Flame, User, Mail, Lock, CircleAlert } from "lucide-react";

interface LiveAuthProps {
  onAuthSuccess: () => void;
}

export default function LiveAuth({ onAuthSuccess }: LiveAuthProps) {
  const { language } = useLanguage();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const selectedClass = PrimalClass.Chieftain;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Pass email and password coordinates to real Supabase auth
        const res = await db.login(email, password);
        if (res.success) {
          onAuthSuccess();
        } else {
          setError(res.error || (language === "id" ? "Autentikasi gagal." : "Authentication failed."));
        }
      } else {
        if (!email || !displayName || !password) {
          setError(language === "id" ? "Semua koordinat ritual harus diisi." : "All ritual coordinates must be filled.");
          setLoading(false);
          return;
        }
        if (displayName.length < 3) {
          setError(language === "id" ? "Username harus minimal 3 karakter." : "Username must be at least 3 characters long.");
          setLoading(false);
          return;
        }
        const res = await db.register(email, displayName, selectedClass, password);
        if (res.success) {
          onAuthSuccess();
        } else {
          if (res.error === "ACCOUNT_EXISTS") {
            setError(
              language === "id"
                ? "Email anggota suku sudah terdaftar! Mengarahkan Anda ke login..."
                : "Tribe member email is already registered here! Redirecting you to login..."
            );
            setTimeout(() => {
              setIsLogin(true);
              setError(
                language === "id"
                  ? "Silakan masukkan password Anda untuk mengakses profil Anda."
                  : "Please enter your password to access your profile."
              );
            }, 2500);
          } else {
            setError(
              res.error || (language === "id" ? "Gagal membuat registrasi suku." : "Failed to establish tribe registration.")
            );
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || (language === "id" ? "Kegagalan komunikasi portal." : "Portal communication failure."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 md:p-8 border border-amber-900/40 shadow-2xl relative overflow-hidden max-w-xl mx-auto my-4">
      {/* Absolute background accent glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="text-center space-y-3 relative z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-950/40 border border-amber-500/20 text-amber-500 shadow-inner">
          <Flame className="w-8 h-8 animate-pulse text-amber-500" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 font-sans">
          {isLogin
            ? (language === "id" ? "AKSES PRIMAL ID" : "ACCESS PRIMAL ID")
            : (language === "id" ? "TEMPA JALUR SUKU" : "FORGE TRIBAL PATH")}
        </h2>
        <p className="text-xs text-amber-200/60 max-w-md mx-auto font-sans">
          {isLogin
            ? (language === "id"
                ? "Masuk kembali ke domain perjanjian daging suci dan pantau penyerangan metabolik Anda."
                : "Re-enter the sacred meat-covenant domains and monitor your metabolic raids.")
            : (language === "id"
                ? "Perjalanan Anda dimulai sebagai Chieftain. Hubungkan koordinat Anda dan nyalakan bara puasa Anda."
                : "Your journey begins as a Chieftain. Establish your coordinates and ignite your fasting embers.")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 relative z-10">
        {error && (
          <div className="bg-red-950/40 border border-red-500/20 text-red-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
            <CircleAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* USERNAME (Tribe Moniker) */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-amber-400/80 font-mono">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. BoneGnawer"
                className="w-full bg-slate-900/60 border border-amber-900/40 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-amber-400/80 font-mono">
              {language === "id" ? "Alamat Email" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hunter123@carnyx.com"
                className="w-full bg-slate-900/60 border border-amber-900/40 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-amber-400/80 font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900/60 border border-amber-900/40 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* REGISTRATION RPG CLASSES */}
          {!isLogin && (
            <div className="pt-2">
              <label className="block text-[11px] uppercase tracking-wider font-bold mb-3 text-amber-400/80 font-mono">
                {language === "id" ? "Jalur Spesialisasi Berburu Anda" : "Your Hunting Specialization Path"}
              </label>
              <div className="bg-slate-900/60 border border-amber-900/45 rounded-xl p-4 space-y-3 relative overflow-hidden text-left">
                <div className="absolute right-3 top-3 opacity-10">
                  <Shield className="w-16 h-16 text-amber-500" />
                </div>
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-amber-500" />
                  <span className="font-extrabold text-sm text-amber-200">
                    {language === "id" ? "Chieftain (Kelas Awal)" : "Chieftain (Starter Class)"}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                  {language === "id" ? (
                    <>
                      Setiap pemburu baru dimulai sebagai <span className="text-amber-400 font-semibold">Chieftain</span>—Pemimpin Perapian. Jalur metabolisme Anda akan berevolusi secara otomatis saat level Anda meningkat:
                    </>
                  ) : (
                    <>
                      Every new hunter begins as a <span className="text-amber-400 font-semibold">Chieftain</span>—the Leader of the Hearth. Your metabolic path will automatically evolve as you level up:
                    </>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1.5 font-mono text-[10px]">
                  <div className="bg-slate-950/60 border border-slate-900/60 p-2.5 rounded-lg flex flex-col justify-center">
                    <span className="text-orange-400 font-extrabold flex items-center gap-1">⚔️ REAVER</span>
                    <span className="text-slate-500 text-[9px] mt-0.5">
                      {language === "id" ? "Terbuka di Level 20" : "Unlocks at Level 20"}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-900/60 p-2.5 rounded-lg flex flex-col justify-center">
                    <span className="text-red-450 font-extrabold flex items-center gap-1">🧭 SLAYER</span>
                    <span className="text-slate-500 text-[9px] mt-0.5">
                      {language === "id" ? "Terbuka di Level 40" : "Unlocks at Level 40"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer h-12 flex items-center justify-center shadow-lg transition-all border border-amber-500/30 active:scale-[0.99]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>
                {isLogin
                  ? (language === "id" ? "Akses Profil" : "Access Profile")
                  : (language === "id" ? "Nyalakan Jantung Primal" : "Ignite Primal Heart")}
              </span>
            </span>
          )}
        </button>

        {/* TOGGLE OPTIONS */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsLogin(!isLogin);
            }}
            className="text-amber-400 hover:text-amber-300 text-xs font-mono underline cursor-pointer"
          >
            {isLogin
              ? (language === "id" ? "Belum punya garis keturunan suku? Mulai perjanjian di sini" : "No tribal lineage yet? Initiate covenant here")
              : (language === "id" ? "Kembali ke Gerbang Id Primal" : "Return to Primal Id Gateway")}
          </button>
        </div>
      </form>
    </div>
  );
}
