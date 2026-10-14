import React from 'react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'green' | 'amber' | 'red' | 'blue';
  icon: React.ReactNode;
  delay?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  badgeColor = 'blue',
  icon,
  delay = 0
}) => {
  const badgeClasses = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  }[badgeColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="glass-panel card-hover p-5 relative overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        
        <div className="mt-2 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate mr-2">
              {subtitle}
            </span>
          )}
          {badge && (
            <span className={`px-2 py-0.5 rounded-full font-medium border text-[11px] shrink-0 ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
