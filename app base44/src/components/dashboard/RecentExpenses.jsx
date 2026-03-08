import React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CATEGORY_LABELS = {
  conto_risparmio: "Risparmio",
  tantum: "Tantum",
  rata: "Rata",
  spesa_ricorrente: "Ricorrente",
  spesa_condivisa: "Condivisa",
  bolletta: "Bolletta",
  abbonamento: "Abbonamento",
  altro: "Altro",
};

const CATEGORY_COLORS = {
  conto_risparmio: "bg-emerald-500/20 text-emerald-400",
  tantum: "bg-blue-500/20 text-blue-400",
  rata: "bg-purple-500/20 text-purple-400",
  spesa_ricorrente: "bg-amber-500/20 text-amber-400",
  spesa_condivisa: "bg-red-500/20 text-red-400",
  bolletta: "bg-orange-500/20 text-orange-400",
  abbonamento: "bg-teal-500/20 text-teal-400",
  altro: "bg-slate-500/20 text-slate-400",
};

export default function RecentExpenses({ expenses }) {
  const recent = expenses.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-[#1a1d27] border border-white/5 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">Ultime Uscite</h3>
        <Link
          to={createPageUrl("Expenses")}
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          Vedi tutte <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">Nessuna uscita registrata</p>
      ) : (
        <div className="space-y-3">
          {recent.map((exp, i) => (
            <div
              key={exp.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <div className={`px-2 py-1 rounded-lg text-[10px] font-medium ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.altro}`}>
                {CATEGORY_LABELS[exp.category] || exp.category}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{exp.description}</p>
                <p className="text-xs text-slate-500">
                  {exp.date ? format(new Date(exp.date), "d MMM yyyy", { locale: it }) : ""}
                </p>
              </div>
              <p className="text-sm font-semibold text-red-400">
                -€{exp.amount?.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}