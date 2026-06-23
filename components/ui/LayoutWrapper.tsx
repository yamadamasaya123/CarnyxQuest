import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { 
  Flame, 
  User, 
  Clock, 
  Activity, 
  Trophy, 
  LogOut, 
  Home, 
  Menu, 
  GraduationCap, 
  Sparkles,
  BarChart2,
  CalendarCheck
} from "lucide-react";

interface LayoutWrapperProps {
  children: React.ReactNode;
  activeNav: "dashboard" | "meals" | "fasting" | "progress" | "challenges";
}

export function LayoutWrapper({ children, activeNav }: LayoutWrapperProps) {
  const { user, profile, logout, refreshSession } = useAuth();
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    async function verify() {
      await refreshSession();
      setSessionChecked(true);
    }
    verify();
  }, []);

  // Strict session protection
  useEffect(() => {
    if (sessionChecked && !user) {
      if (router) {
        router.push("/login");
      } else {
        window.location.hash = "/login";
      }
    }
  }, [user, sessionChecked, router]);

  const handleRoute = (path: string) => {
    if (router) {
      router.push(path);
    } else {
      window.location.hash = path;
    }
  };

  const handleDisconnect = async () => {
    await logout();
    if (router) {
      router.push("/");
    } else {
      window.location.hash = "/";
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-amber-500 uppercase tracking-widest animate-pulse">
          Validating Bio Coordinates...
        </span>
      </div>
    );
  }

  // Sidebar Desktop buttons configuration
  const menuItems = [
    { key: "dashboard", label: "Command Board", icon: <Flame className="w-4 h-4 shrink-0" />, path: "/dashboard" },
    { key: "meals", label: "Prey Meal Logs", icon: <User className="w-4 h-4 shrink-0" />, path: "/meals" },
    { key: "fasting", label: "Autophagy Clock", icon: <Clock className="w-4 h-4 shrink-0" />, path: "/fasting" },
    { key: "progress", label: "Physical Metrics", icon: <Activity className="w-4 h-4 shrink-0" />, path: "/progress" },
    { key: "challenges", label: "Quests & Trophies", icon: <Trophy className="w-4 h-4 shrink-0" />, path: "/challenges" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative pb-20 md:pb-0">
      
      {/* THESIS HEADER MASTHEAD BAND */}
      <header className="bg-slate-900 border-b border-slate-900 px-4 py-3 md:px-8 relative z-30">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer" onClick={() => handleRoute("/")}>
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-black tracking-tight font-sans text-white">
              Carnyx<span className="text-amber-500 font-light">Quest</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right text-[10px] font-mono pr-2 border-r border-slate-800">
              <span className="text-slate-300 font-bold">{profile.displayName}</span>
              <span className="text-slate-500">Tier {profile.level} {profile.primalClass}</span>
            </div>
            
            <button
              onClick={handleDisconnect}
              className="text-xs bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-red-400 hover:text-red-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DISCONNECT PORTAL</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE FRAME LAYOUT */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden md:block md:col-span-1 space-y-4">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 sticky top-6 shadow-xl space-y-4">
            
            {/* User Info details */}
            <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl text-center space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-xl rounded-full"></div>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 mx-auto border border-amber-500/20 flex items-center justify-center font-black text-xs font-mono shadow-inner">
                {profile.level}
              </div>
              <h4 className="font-extrabold text-xs tracking-wide truncate">{profile.displayName}</h4>
              <span className="text-[9px] bg-amber-500/10 text-amber-500 font-mono px-2 py-0.5 rounded uppercase font-bold border border-amber-500/10 block w-max mx-auto">
                {profile.primalClass}
              </span>
            </div>

            {/* Menu Buttons list */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeNav === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleRoute(item.path)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition ${
                      isActive
                        ? "bg-amber-600 text-white shadow-md shadow-amber-500/10"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 cursor-pointer"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* PAGE DYNAMIC BODY CONTENTPORT */}
        <main className="col-span-1 md:col-span-3 space-y-6">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION DOCK (Viewport Width < 768px ONLY) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-slate-900 border-t border-slate-800 z-40 flex items-center justify-around px-4 shadow-2xl backdrop-blur-md">
        {menuItems.slice(0, 4).map((item) => {
          const isActive = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleRoute(item.path)}
              className={`flex flex-col items-center justify-center gap-1.5 transition ${
                isActive ? "text-amber-500" : "text-slate-500"
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold font-mono tracking-wider uppercase block">{item.key}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

export default LayoutWrapper;
