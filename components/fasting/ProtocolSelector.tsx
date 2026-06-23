import React from "react";
import { EXCELLENT_PROTOCOLS, FastingProtocolInfo } from "../../lib/fasting";
import { Clock, Zap, Target } from "lucide-react";

interface ProtocolSelectorProps {
  selectedProtocol: string;
  onSelect: (protocol: FastingProtocolInfo) => void;
  disabled?: boolean;
}

export function ProtocolSelector({
  selectedProtocol,
  onSelect,
  disabled = false
}: ProtocolSelectorProps) {
  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 shadow-lg">
      <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2 flex items-center gap-1">
        <Target className="w-4 h-4 text-amber-500" />
        CHOOSE AUTOPHAGY PROTOCOL
      </h3>

      <div className="space-y-2">
        {EXCELLENT_PROTOCOLS.map((protocol) => {
          const isSelected = selectedProtocol === protocol.name;
          return (
            <button
              key={protocol.name}
              onClick={() => !disabled && onSelect(protocol)}
              disabled={disabled}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-amber-600/10 border-amber-500/40 text-slate-100 shadow-md shadow-amber-500/5"
                  : disabled
                    ? "opacity-50 cursor-not-allowed border-slate-900"
                    : "bg-slate-900/40 hover:bg-slate-900 border-slate-900/60 text-slate-400 hover:text-slate-200 cursor-pointer"
              }`}
            >
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black font-mono ${isSelected ? "text-amber-500" : "text-slate-300"}`}>
                    {protocol.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono italic">
                    {protocol.durationHours} Hours Scheduled
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed max-w-lg font-sans text-slate-400">
                  {protocol.description}
                </p>
              </div>

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isSelected 
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-500" 
                  : "bg-slate-955 border-slate-800 text-slate-600"
              }`}>
                <Clock className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProtocolSelector;
