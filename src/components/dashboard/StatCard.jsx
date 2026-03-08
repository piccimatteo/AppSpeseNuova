import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = "emerald", delay = 0 }) {
  const colorMap = {
    emerald: { bg: "from-emerald-500/10 to-emerald-600/5", icon: "bg-emerald-500/20 text-emerald-400", trend: "text-emerald-400" },
    coral: { bg: "from-red-500/10 to-red-600/5", icon: "bg-red-500/20 text-red-400", trend: "text-red-400" },
    blue: { bg: "from-blue-500/10 to-blue-600/5", icon: "bg-blue-500/20 text-blue-400", trend: "text-blue-400" },
    purple: { bg: "from-purple-500/10 to-purple-600/5", icon: "bg-purple-500/20 text-purple-400", trend: "text-purple-400" },
    amber: { bg: "from-amber-500/10 to-amber-600/5", icon: "bg-amber-500/20 text-amber-400", trend: "text-amber-400" },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border border-white/5 p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-xs font-medium ${c.trend}`}>{trend > 0 ? `+${trend}%` : `${trend}%`}</span>
              {trendLabel && <span className="text-xs text-slate-500">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${c.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}