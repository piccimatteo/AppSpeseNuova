import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Check, Clock, Target, CheckCircle2 } from "lucide-react";
import { format as formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isSameMonth } from "date-fns";
import { it } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";

import ExpenseForm from "@/components/expenses/ExpenseForm";
import MonthSelector from "@/components/shared/MonthSelector";
import ExportButton from "@/components/shared/ExportButton";
import { calcMonthlyQuota } from "@/components/goals/GoalCard";

const CATEGORY_LABELS = {
  conto_risparmio: "Conto Risparmio",
  tantum: "Tantum",
  rata: "Rata",
  spesa_ricorrente: "Spesa Ricorrente",
  spesa_condivisa: "Spesa Condivisa",
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

export default function Expenses() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => base44.entities.Expense.list("-date"),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: () => base44.entities.Goal.list(),
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  // Chiave del mese selezionato es. "2026-03"
  const selectedMonthKey = formatDate(selectedDate, "yyyy-MM");

  const isGoalPaidThisMonth = (goal) =>
    (goal.paid_months || []).includes(selectedMonthKey);

  const toggleGoalPaid = (goal) => {
    const paid = goal.paid_months || [];
    const quota = calcMonthlyQuota(goal);
    const alreadyPaid = paid.includes(selectedMonthKey);
    const newPaid = alreadyPaid
      ? paid.filter((m) => m !== selectedMonthKey)
      : [...paid, selectedMonthKey];
    const newCurrentAmount = Math.max(0, (goal.current_amount || 0) + (alreadyPaid ? -quota : quota));
    updateGoalMutation.mutate({ id: goal.id, data: { paid_months: newPaid, current_amount: newCurrentAmount } });
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onMutate: async (newExp) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previous = queryClient.getQueryData(["expenses"]);
      queryClient.setQueryData(["expenses"], (old = []) => [
        { ...newExp, id: `temp-${Date.now()}` },
        ...old,
      ]);
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(["expenses"], ctx.previous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previous = queryClient.getQueryData(["expenses"]);
      queryClient.setQueryData(["expenses"], (old = []) =>
        old.map((e) => (e.id === id ? { ...e, ...data } : e))
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(["expenses"], ctx.previous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setShowForm(false);
      setEditingExpense(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previous = queryClient.getQueryData(["expenses"]);
      queryClient.setQueryData(["expenses"], (old = []) => old.filter((e) => e.id !== id));
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(["expenses"], ctx.previous),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  // Toggle paid
  const togglePaid = (exp) => {
    updateMutation.mutate({ id: exp.id, data: { is_paid: !exp.is_paid } });
  };

  // Filter expenses by month + search + category
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const monthMatch = e.date && isSameMonth(new Date(e.date), selectedDate);
      const searchMatch = !search || e.description?.toLowerCase().includes(search.toLowerCase());
      const catMatch = categoryFilter === "all" || e.category === categoryFilter;
      return monthMatch && searchMatch && catMatch;
    });
  }, [expenses, selectedDate, search, categoryFilter]);

  // Active goals quota for this month
  const activeGoals = useMemo(() =>
    goals.filter((g) => g.status === "in_corso"),
    [goals]
  );

  const goalsMonthlyTotal = useMemo(() =>
    activeGoals.reduce((s, g) => s + calcMonthlyQuota(g), 0),
    [activeGoals]
  );

  const goalsPaidTotal = useMemo(() =>
    activeGoals
      .filter((g) => (g.paid_months || []).includes(selectedMonthKey))
      .reduce((s, g) => s + calcMonthlyQuota(g), 0),
    [activeGoals, selectedMonthKey]
  );

  const goalsUnpaidTotal = goalsMonthlyTotal - goalsPaidTotal;

  // Summary values
  const totalAll = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalPaid = filteredExpenses.filter((e) => e.is_paid).reduce((s, e) => s + (e.amount || 0), 0) + goalsPaidTotal;
  const totalUnpaidExpenses = filteredExpenses.filter((e) => !e.is_paid).reduce((s, e) => s + (e.amount || 0), 0);
  // Da pagare = spese non pagate + quote obiettivi non pagate
  const totalUnpaid = totalUnpaidExpenses + goalsUnpaidTotal;
  // Da pagare senza obiettivi = solo spese non pagate
  const totalUnpaidNoGoals = totalUnpaidExpenses;

  const handleSubmit = async (data) => {
    if (editingExpense) {
      await updateMutation.mutateAsync({ id: editingExpense.id, data });
    } else if (Array.isArray(data)) {
      await base44.entities.Expense.bulkCreate(data);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setShowForm(false);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Uscite</h1>
          <p className="text-sm text-slate-500 mt-1">Gestisci tutte le tue spese</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector currentDate={selectedDate} onChange={setSelectedDate} />
          <Button
            onClick={() => { setEditingExpense(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" /> Aggiungi
          </Button>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <ExpenseForm
              expense={editingExpense}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingExpense(null); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Totale */}
        <div className="rounded-2xl bg-[#1a1d27] border border-white/5 p-4">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Totale Mese</p>
          <p className="text-xl font-bold text-white">€{totalAll.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-1">{filteredExpenses.length} uscite</p>
        </div>
        {/* Pagato */}
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
          <p className="text-[10px] font-medium text-emerald-500/70 uppercase tracking-wider mb-1">✓ Pagato</p>
          <p className="text-xl font-bold text-emerald-400">€{totalPaid.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-emerald-600 mt-1">
            {filteredExpenses.filter((e) => e.is_paid).length} pagate
          </p>
        </div>
        {/* Da pagare (spese + obiettivi non pagati) */}
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-[10px] font-medium text-red-400/70 uppercase tracking-wider mb-1">⏳ Da Pagare</p>
          <p className="text-xl font-bold text-red-400">€{totalUnpaid.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-red-600 mt-1">
            spese + obiettivi ({goalsPaidTotal > 0 ? `€${goalsPaidTotal.toLocaleString("it-IT", { minimumFractionDigits: 2 })} già pagati` : "nessuna quota pagata"})
          </p>
        </div>
        {/* Da pagare senza obiettivi */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-amber-400/70 uppercase tracking-wider mb-1">Da Pagare</p>
              <p className="text-[9px] text-amber-600/80 -mt-0.5 mb-1">solo spese (no obiettivi)</p>
              <p className="text-xl font-bold text-amber-400">€{totalUnpaidNoGoals.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
            </div>
            <Target className="h-4 w-4 text-amber-500/50 mt-0.5" />
          </div>
          <p className="text-xs text-amber-600 mt-1">
            Quote obiettivi: €{goalsMonthlyTotal.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Goals monthly breakdown (collapsible) */}
      {activeGoals.length > 0 && (
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-amber-400" />
            <p className="text-sm font-medium text-slate-300">Quote Mensili Obiettivi</p>
            <span className="ml-auto text-xs font-semibold text-amber-400">
              Tot: €{goalsMonthlyTotal.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {activeGoals.map((g) => {
              const quota = calcMonthlyQuota(g);
              const paid = isGoalPaidThisMonth(g);
              return (
                <div key={g.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${paid ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/[0.02] border border-white/5"}`}>
                  <button
                    onClick={() => toggleGoalPaid(g)}
                    title={paid ? "Segna come da pagare" : "Segna come pagato"}
                    className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      paid
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-600 hover:border-emerald-500 text-transparent hover:text-emerald-500"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color || "#10b981" }} />
                  <span className={`text-xs flex-1 truncate ${paid ? "text-slate-400 line-through" : "text-slate-400"}`}>{g.title}</span>
                  <span className={`text-xs font-semibold ${paid ? "text-emerald-400" : "text-slate-200"}`}>
                    €{quota.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca uscite..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1d27] border-white/10">
            <SelectItem value="all" className="text-slate-300 focus:bg-white/5 focus:text-white">Tutte le categorie</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k} className="text-slate-300 focus:bg-white/5 focus:text-white">{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ExportButton expenses={filteredExpenses} />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500">Nessuna uscita trovata per questo periodo</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((exp) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all group ${
                exp.is_paid
                  ? "bg-emerald-500/5 border-emerald-500/15"
                  : "bg-[#1a1d27] border-white/5 hover:border-white/10"
              }`}
            >
              {/* Paid toggle button */}
              <button
                onClick={() => togglePaid(exp)}
                title={exp.is_paid ? "Segna come da pagare" : "Segna come pagato"}
                className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  exp.is_paid
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-600 hover:border-emerald-500 text-transparent hover:text-emerald-500"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </button>

              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-medium flex-shrink-0 ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.altro}`}>
                {CATEGORY_LABELS[exp.category] || exp.category}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${exp.is_paid ? "text-slate-400 line-through" : "text-slate-200"}`}>
                  {exp.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-500">
                    {exp.date ? format(new Date(exp.date), "d MMM yyyy", { locale: it }) : ""}
                  </p>
                  {exp.is_recurring && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">Ricorrente</span>
                  )}
                  {exp.shared_with && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      Con {exp.shared_with}
                    </span>
                  )}
                  {exp.is_paid && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Pagato</span>
                  )}
                </div>
              </div>

              <p className={`text-sm font-semibold flex-shrink-0 ${exp.is_paid ? "text-slate-500" : "text-red-400"}`}>
                -€{exp.amount?.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </p>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingExpense(exp); setShowForm(true); }}
                  className="p-1.5 rounded-lg hover:bg-white/5"
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(exp.id)}
                  className="p-1.5 rounded-lg hover:bg-white/5"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}