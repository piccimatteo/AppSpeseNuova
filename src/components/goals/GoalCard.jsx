import React from "react";
import { motion } from "framer-motion";
import { Target, Pencil, Trash2, Check, CalendarDays } from "lucide-react";
import { format, differenceInCalendarMonths, startOfMonth } from "date-fns";
import { it } from "date-fns/locale";

// Calcola la quota mensile: (target - current) / mesi rimanenti dalla data odierna alla scadenza
export function calcMonthlyQuota(goal) {
  if (!goal.deadline || goal.status === "completato") return 0;
  const remaining = Math.max(0, (goal.target_amount || 0) - (goal.current_amount || 0));
  const now = startOfMonth(new Date());
  const deadline = startOfMonth(new Date(goal.deadline));
  const months = differenceInCalendarMonths(deadline, now);
  if (months <= 0) return remaining; // scaduto o scade questo mese
  return remaining / months;
}

export default function GoalCard({ goal, onEdit, onDelete, delay = 0 }) {
  const progress = goal.target_amount > 0
    ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100)
    : 0;

  const isCompleted = goal.status === "completato" || progress >= 100;
  const monthlyQuota = calcMonthlyQuota(goal);

  const now = startOfMonth(new Date());
  const deadline = goal.deadline ? startOfMonth(new Date(goal.deadline)) : null;
  const monthsLeft = deadline ? differenceInCalendarMonths(deadline, now) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl bg-[#1a1d27] border border-white/5 p-5 group hover:border-white/10 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${goal.color || "#10b981"}20` }}
          >
            {isCompleted ? (
              <Check className="h-5 w-5" style={{ color: goal.color || "#10b981" }} />
            ) : (
              <Target className="h-5 w-5" style={{ color: goal.color || "#10b981" }} />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{goal.title}</h4>
            {goal.deadline && (
              <p className="text-xs text-slate-500 mt-0.5">
                Scadenza: {format(new Date(goal.deadline), "MMM yyyy", { locale: it })}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(goal)} className="p-1.5 rounded-lg hover:bg-white/5">
            <Pencil className="h-3.5 w-3.5 text-slate-400" />
          </button>
          <button onClick={() => onDelete(goal)} className="p-1.5 rounded-lg hover:bg-white/5">
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400">
            €{(goal.current_amount || 0).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-slate-500">
            €{(goal.target_amount || 0).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: goal.color || "#10b981" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: goal.color || "#10b981" }}>
          {progress}%
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          isCompleted
            ? "bg-emerald-500/20 text-emerald-400"
            : goal.status === "in_pausa"
            ? "bg-amber-500/20 text-amber-400"
            : "bg-blue-500/20 text-blue-400"
        }`}>
          {isCompleted ? "Completato" : goal.status === "in_pausa" ? "In Pausa" : "In Corso"}
        </span>
      </div>

      {/* Monthly quota */}
      {!isCompleted && monthlyQuota > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <CalendarDays className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
          <span className="text-xs text-slate-400">
            Quota mensile:{" "}
            <span className="font-semibold" style={{ color: goal.color || "#10b981" }}>
              €{monthlyQuota.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
            </span>
          </span>
          {monthsLeft !== null && (
            <span className="text-[10px] text-slate-600 ml-auto">
              {monthsLeft <= 0 ? "scaduto" : `${monthsLeft} mes${monthsLeft === 1 ? "e" : "i"}`}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}