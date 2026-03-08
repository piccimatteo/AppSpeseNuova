import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Wallet, TrendingDown, CheckCircle2, Clock } from "lucide-react";
import { format, subMonths, isSameMonth } from "date-fns";
import { it } from "date-fns/locale";

import StatCard from "@/components/dashboard/StatCard";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import MonthSelector from "@/components/shared/MonthSelector";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => base44.entities.Expense.list("-date"),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: () => base44.entities.Goal.list(),
  });

  const currentMonthExpenses = useMemo(() =>
    expenses.filter((e) => e.date && isSameMonth(new Date(e.date), selectedDate)),
    [expenses, selectedDate]
  );

  const prevMonthExpenses = useMemo(() =>
    expenses.filter((e) => e.date && isSameMonth(new Date(e.date), subMonths(selectedDate, 1))),
    [expenses, selectedDate]
  );

  const activeGoals = goals.filter((g) => g.status === "in_corso");

  const totalCurrent = currentMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalPrev = prevMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const trend = totalPrev > 0 ? Math.round(((totalCurrent - totalPrev) / totalPrev) * 100) : 0;

  const totalPaid = currentMonthExpenses
    .filter((e) => e.is_paid)
    .reduce((s, e) => s + (e.amount || 0), 0);

  const totalUnpaidExpenses = currentMonthExpenses
    .filter((e) => !e.is_paid)
    .reduce((s, e) => s + (e.amount || 0), 0);

  const calcMonthlyQuota = (goal) => {
    if (!goal.deadline) return 0;
    const remaining = Math.max(0, (goal.target_amount || 0) - (goal.current_amount || 0));
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const months = Math.max(1, (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth()));
    return remaining / months;
  };

  const selectedMonthKey = format(selectedDate, "yyyy-MM");

  const goalsMonthlyTotal = activeGoals.reduce((s, g) => s + calcMonthlyQuota(g), 0);
  const goalsPaidTotal = activeGoals
    .filter((g) => (g.paid_months || []).includes(selectedMonthKey))
    .reduce((s, g) => s + calcMonthlyQuota(g), 0);
  const totalUnpaid = totalUnpaidExpenses + (goalsMonthlyTotal - goalsPaidTotal);

  // Chart data: last 6 months
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(selectedDate, i);
      const monthExpenses = expenses.filter((e) => e.date && isSameMonth(new Date(e.date), d));
      months.push({
        month: format(d, "MMM", { locale: it }),
        amount: monthExpenses.reduce((s, e) => s + (e.amount || 0), 0),
      });
    }
    return months;
  }, [expenses, selectedDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Panoramica delle tue finanze</p>
        </div>
        <MonthSelector currentDate={selectedDate} onChange={setSelectedDate} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Totale Mese"
          value={`€${totalCurrent.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`}
          icon={Wallet}
          color="coral"
          trend={trend}
          trendLabel="vs mese prec."
          delay={0}
        />
        <StatCard
          title="Uscite"
          value={currentMonthExpenses.length}
          icon={TrendingDown}
          color="blue"
          delay={0.05}
        />
        <StatCard
          title="Pagato"
          value={`€${totalPaid.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`}
          icon={CheckCircle2}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          title="Da Pagare"
          value={`€${totalUnpaid.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`}
          icon={Clock}
          color="coral"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart data={chartData} />
        <CategoryBreakdown expenses={currentMonthExpenses} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentExpenses expenses={currentMonthExpenses} />
        
        {/* Active Goals Summary */}
        <div className="rounded-2xl bg-[#1a1d27] border border-white/5 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Obiettivi Attivi</h3>
          {activeGoals.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nessun obiettivo attivo</p>
          ) : (
            <div className="space-y-4">
              {activeGoals.slice(0, 4).map((goal) => {
                const progress = goal.target_amount > 0
                  ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100)
                  : 0;
                return (
                  <div key={goal.id} className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${goal.color || "#10b981"}20` }}
                    >
                      <span className="text-xs font-bold" style={{ color: goal.color || "#10b981" }}>
                        {progress}%
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{goal.title}</p>
                      <div className="h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, backgroundColor: goal.color || "#10b981" }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      €{(goal.current_amount || 0).toLocaleString("it-IT")} / €{(goal.target_amount || 0).toLocaleString("it-IT")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}