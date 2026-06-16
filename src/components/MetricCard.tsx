import { ReactNode } from "react";
import { motion } from "motion/react";

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  unit: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    text: string;
  };
  colorClass?: string;
}

export default function MetricCard({
  id,
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  colorClass = "border-[#edf2ed] bg-white text-[#1a1c1e] dark:bg-zinc-900 dark:border-zinc-800/80 dark:text-zinc-100",
}: MetricCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-[20px] border p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between h-full transition-all ${colorClass}`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold tracking-[0.1em] text-zinc-400 dark:text-zinc-500 uppercase">
            {title}
          </span>
          {icon && <div className="text-emerald-600/70 dark:text-emerald-400/70">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-4xl md:text-5xl font-light text-emerald-950 dark:text-emerald-200 tracking-tight leading-none">
            {value}
          </span>
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 lowercase">
            {unit}
          </span>
        </div>
      </div>

      {subtitle || trend ? (
        <div className="mt-5 pt-4 border-t border-[#f4f7f4] dark:border-zinc-800/40 flex items-center justify-between text-xs text-zinc-500">
          <span className="truncate max-w-[180px] font-medium text-zinc-450 dark:text-zinc-450">{subtitle}</span>
          {trend && (
            <span
              className={`font-semibold inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wide ${
                trend.direction === "down"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : trend.direction === "up"
                  ? "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400"
                  : "bg-zinc-100 text-zinc-650 dark:bg-zinc-850 dark:text-zinc-400"
              }`}
            >
              {trend.text}
            </span>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
