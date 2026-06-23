import React from "react";
import { Clock, Play, Square, PlaySquare, AlertCircle } from "lucide-react";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";
import { formatDuration } from "../../utils/formatters";

interface FastingTimerProps {
  elapsedSeconds: number;
  isActive: boolean;
  targetHours: number;
  protocolName: string;
  onStart: () => void;
  onEnd: (save: boolean) => void;
}

export function FastingTimer({
  elapsedSeconds,
  isActive,
  targetHours,
  protocolName,
  onStart,
  onEnd
}: FastingTimerProps) {
  
  const elapsedHours = elapsedSeconds / 3600;
  const percentComplete = Math.min(100, (elapsedHours / targetHours) * 100);

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 text-center space-y-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full"></div>

      <div className="space-y-1">
        <span className="text-[10px] text-amber-500 font-bold font-mono tracking-widest uppercase">
          {isActive ? `METABOLIC AUTOPHAGY FLUX ACTIVE: ${protocolName}` : "CLOCK IDLE"}
        </span>
        <h3 className="text-sm font-black font-mono text-slate-400 uppercase tracking-widest">
          {isActive ? "SENSENSING CELL RECYCLING PROGRESS" : "No ongoing cell cleanse cycle"}
        </h3>
      </div>

      {/* CLOCK FACE DISPLAY */}
      <div className="py-6 flex flex-col items-center justify-center">
        <div className={`w-44 h-44 rounded-full border-2 flex flex-col items-center justify-center relative shadow-inner ${
          isActive 
            ? "border-amber-500/40 bg-amber-950/5 text-amber-500 animate-pulse shadow-amber-500/5" 
            : "border-slate-800 bg-slate-900/60 text-slate-500"
        }`}>
          <Clock className={`w-8 h-8 mb-2 ${isActive ? "text-amber-500" : "text-slate-600"}`} />
          <span className="text-2xl font-black font-mono tracking-wider">
            {isActive ? formatDuration(elapsedSeconds) : "00:00:00"}
          </span>
          <span className="text-[9px] font-mono tracking-widest text-slate-500">
            ELAPSED TIMESPAN
          </span>

          {isActive && (
            <div className="absolute -bottom-2 bg-gradient-to-r from-amber-600 to-orange-500 text-slate-950 px-2 py-0.5 rounded text-[8px] font-black font-mono">
              {percentComplete.toFixed(1)}% COMPLETE
            </div>
          )}
        </div>
      </div>

      {isActive ? (
        <div className="space-y-4">
          <ProgressBar percentage={percentComplete} />
          
          <div className="flex gap-2 justify-center">
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => onEnd(true)}
              className="flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Complete & Reap +XP Bonus</span>
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onEnd(false)}
              className="flex items-center gap-1.5"
            >
              <span>Discard Session</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 items-center text-[10px] text-slate-500 font-mono bg-slate-900/40 p-3 rounded-lg border border-slate-900 justify-center">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Select a protocol in the panel below and click start to activate cellular cleanup.</span>
          </div>
          
          <Button 
            variant="amber" 
            size="md"
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>COMMENCE METABOLIC PURGE</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export default FastingTimer;
