import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "amber" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-mono font-bold tracking-wider rounded-xl uppercase transition-all duration-300 active:scale-[0.98] outline-none select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 shadow-lg shadow-black/40",
    secondary: "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60",
    danger: "bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30",
    amber: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-600/10",
    ghost: "text-slate-400 hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-5 py-2.5 text-xs",
    lg: "px-7 py-3 text-sm"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export default Button;
