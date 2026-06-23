import React from "react";

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: string;
  className?: string;
}

export function ProgressBar({
  percentage,
  color = "from-amber-600 to-orange-500",
  height = "h-2",
  className = ""
}: ProgressBarProps) {
  
  // Bound progress
  const boundedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className={`w-full bg-slate-900 rounded-full overflow-hidden border border-slate-950 p-[1px] ${className}`}>
      <div 
        className={`rounded-full bg-gradient-to-r ${color} ${height} transition-all duration-700 ease-out`}
        style={{ width: `${boundedPercentage}%` }}
      />
    </div>
  );
}

export default ProgressBar;
