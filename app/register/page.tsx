"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { PrimalClass } from "../../types/user";
import { validateEmail, validatePassword } from "../../lib/validation";
import Button from "../../components/ui/Button";
import { PlusCircle, Key, Mail, ShieldAlert, AlertCircle, ArrowLeft, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [primalClass, setPrimalClass] = useState<PrimalClass>("Hunter");
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, loading } = useAuth();
  const router = useRouter();

  const handlePrimalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!displayName.trim()) {
      setLocalError("A survivor moniker nickname is required.");
      return;
    }

    if (!validateEmail(email)) {
      setLocalError("Your email handle is formatted incorrectly.");
      return;
    }

    const checkPass = validatePassword(password);
    if (!checkPass.isValid) {
      setLocalError(checkPass.message);
      return;
    }

    try {
      const res = await register(email, password, primalClass, displayName);
      if (res.success) {
        if (router) {
          router.push("/dashboard");
        } else {
          window.location.hash = "/dashboard";
        }
      } else {
        setLocalError(res.error || "Profile coordinates registration rejected.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Connection timed out.");
    }
  };

  const handleRouteLogin = () => {
    if (router) {
      router.push("/login");
    } else {
      window.location.hash = "/login";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 blur-3xl rounded-full"></div>

      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black font-mono tracking-widest text-amber-500 uppercase">
            FORM NEW RECRUIT PROFILE
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">
            Register your sirtuin-coordinates inside the defense records.
          </p>
        </div>

        {localError && (
          <div className="bg-red-950/20 border border-red-900/40 text-red-100 p-3 rounded-xl text-[10px] font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handlePrimalRegister} className="space-y-4">
          
          {/* Input: Nickname */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold font-mono tracking-wider block uppercase">
              SURVIVOR MONIKER / NICKNAME
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. ApexPredator99..."
              className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none placeholder-slate-700 transition"
            />
          </div>

          {/* Input: Email */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold font-mono tracking-wider block uppercase">
              RECRUITMENT EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-650" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hunter@wilderness.com"
                className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none placeholder-slate-700 transition"
              />
            </div>
          </div>

          {/* Input: Password */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold font-mono tracking-wider block uppercase">
              SACRED PASSWORD PASSKEY
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-650" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none placeholder-slate-700 transition"
              />
            </div>
          </div>

          {/* Select: Primal Class */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold font-mono tracking-wider block uppercase">
              RECRUIT PRIMAL CLASS PATH
            </label>
            <select
              value={primalClass}
              onChange={(e) => setPrimalClass(e.target.value as PrimalClass)}
              className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none transition uppercase font-mono"
            >
              <option value="Hunter">STEALTH HUNTER (Macronutrient specialist)</option>
              <option value="Chieftain">CHIEFTAIN CLANSMAN (Metabolic routine lead)</option>
              <option value="gatherer">PRIMAL GATHERER (Autophagy conservator)</option>
              <option value="Berserker">RAGED BERSERKER (Lifting adaptations powerhouse)</option>
              <option value="Shaman">AUTOPHAGY SHAMAN (Cellular timing wizard)</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="amber"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "PROFILING BIO COORDINATES..." : "SEAL PRIMAL REGISTRY"}</span>
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
          <span>Already have a secure bio coordinates card? </span>
          <button 
            onClick={handleRouteLogin}
            className="text-amber-500 underline font-bold hover:text-amber-400 cursor-pointer"
          >
            Authenticate Portal
          </button>
        </div>
      </div>
    </div>
  );
}
export { RegisterPage };
