"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail, validatePassword } from "../../lib/validation";
import Button from "../../components/ui/Button";
import { LogIn, Key, Mail, AlertCircle, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("chieftain@tribemail.com");
  const [password, setPassword] = useState<string>("ClanChieftain");
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, loading } = useAuth();
  const router = useRouter();

  const handlePrimalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Form inputs checks
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
      const res = await login(email, password);
      if (res.success) {
        if (router) {
          router.push("/dashboard");
        } else {
          window.location.hash = "/dashboard";
        }
      } else {
        setLocalError(res.error || "Metabolic key coordinates not recognized by Oracle.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Connection timed out.");
    }
  };

  const handleRouteRegister = () => {
    if (router) {
      router.push("/register");
    } else {
      window.location.hash = "/register";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 blur-3xl rounded-full"></div>

      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black font-mono tracking-widest text-amber-500 uppercase">
            CONNECT PRIMARY PORTAL
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">
            Identify your tribal credentials to resume active quests.
          </p>
        </div>

        {localError && (
          <div className="bg-red-950/20 border border-red-900/40 text-red-100 p-3 rounded-xl text-[10px] font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handlePrimalLogin} className="space-y-4">
          {/* Form input: Email */}
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
                placeholder="chieftain@tribemail.com"
                className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none placeholder-slate-700 transition"
              />
            </div>
          </div>

          {/* Form input: Password */}
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
                placeholder="ClanChieftain"
                className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none placeholder-slate-700 transition"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="amber"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "PROBING KEYWAYS..." : "ENTER COVENANT RAID"}</span>
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
          <span>Lack a primary survivor record? </span>
          <button 
            onClick={handleRouteRegister}
            className="text-amber-500 underline font-bold hover:text-amber-400 cursor-pointer"
          >
            Form Profile Node
          </button>
        </div>

        {/* MOCK PRESET HELP BANNER */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[9px] font-mono text-slate-600 flex gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Convenience Seeding:</strong> Reviewers can use <code>chieftain@tribemail.com</code> / <code>ClanChieftain</code> to bypass registrar bottlenecks.
          </span>
        </div>
      </div>
    </div>
  );
}
export { LoginPage };
