import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primal" | "highlight";
  children: React.ReactNode;
  className?: string;
}

export function Card({
  variant = "default",
  children,
  className = "",
  ...props
}: CardProps) {
  
  const baseStyles = "rounded-2xl border transition-all duration-300 relative overflow-hidden";
  
  const variants = {
    default: "bg-slate-950 border-slate-900/80 shadow-xl shadow-black/30",
    primal: "bg-slate-900/60 border-slate-900 shadow-xl backdrop-blur-sm",
    highlight: "bg-slate-900 border-amber-500/30 shadow-2xl shadow-amber-500/5"
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {variant === "highlight" && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
      )}
      {children}
    </div>
  );
}

export default Card;
