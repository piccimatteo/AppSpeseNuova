import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const CATEGORY_LABELS = {
  conto_risparmio: "Conto Risparmio",
  tantum: "Tantum",
  rata: "Rate",
  spesa_ricorrente: "Spese Ricorrenti",
  spesa_condivisa: "Spese Condivise",
  bolletta: "Bollette",
  abbonamento: "Abbonamenti",
  altro: "Altro",
};

const COLORS = ["#10b981", "#60a5fa", "#a78bfa", "#fbbf24", "#f87171", "#fb923c", "#2dd4bf", "#94a3b8"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d27] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400">{payload[0].name}</p>
      <p className="text-sm font-bold text-white">€{payload[0].value?.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
    </div>
  );
};

export default function CategoryBreakdown({ expenses }) {
  const categoryData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + (exp.amount || 0);
      return acc;
    }, {})
  ).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] || key,
    value,
  })).sort((a, b) => b.value - a.value);

  const total = categoryData.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-[#1a1d27] border border-white/5 p-6"
    >
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Ripartizione per Categoria</h3>
      {categoryData.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">Nessuna spesa registrata</p>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-48 w-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2 w-full">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-slate-400 flex-1 truncate">{item.name}</span>
                <span className="text-xs font-medium text-slate-300">€{item.value.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
                <span className="text-xs text-slate-500 w-10 text-right">{total > 0 ? Math.round((item.value / total) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}