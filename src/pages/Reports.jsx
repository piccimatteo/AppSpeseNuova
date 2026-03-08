import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, isSameMonth, startOfYear, isAfter, isBefore, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

import MonthSelector from "@/components/shared/MonthSelector";
import ExportButton from "@/components/shared/ExportButton";

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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d27] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: p.color }}>
          {p.name}: €{p.value?.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("trend");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => base44.entities.Expense.list("-date"),
  });

  // Trend data: last 12 months
  const trendData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(selectedDate, i);
      const monthExps = expenses.filter((e) => e.date && isSameMonth(new Date(e.date), d));
      const filtered = categoryFilter === "all" ? monthExps : monthExps.filter((e) => e.category === categoryFilter);
      months.push({
        month: format(d, "MMM yy", { locale: it }),
        amount: filtered.reduce((s, e) => s + (e.amount || 0), 0),
      });
    }
    return months;
  }, [expenses, selectedDate, categoryFilter]);

  // Category comparison: current vs previous month
  const comparisonData = useMemo(() => {
    const currentMonth = expenses.filter((e) => e.date && isSameMonth(new Date(e.date), selectedDate));
    const prevMonth = expenses.filter((e) => e.date && isSameMonth(new Date(e.date), subMonths(selectedDate, 1)));

    const categories = [...new Set([...currentMonth, ...prevMonth].map((e) => e.category))];

    return categories.map((cat) => ({
      category: CATEGORY_LABELS[cat] || cat,
      corrente: currentMonth.filter((e) => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0),
      precedente: prevMonth.filter((e) => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0),
    })).sort((a, b) => b.corrente - a.corrente);
  }, [expenses, selectedDate]);

  // Stacked area by category
  const stackedData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(selectedDate, i);
      const monthExps = expenses.filter((e) => e.date && isSameMonth(new Date(e.date), d));
      const entry = { month: format(d, "MMM yy", { locale: it }) };
      Object.keys(CATEGORY_LABELS).forEach((cat) => {
        entry[CATEGORY_LABELS[cat]] = monthExps
          .filter((e) => e.category === cat)
          .reduce((s, e) => s + (e.amount || 0), 0);
      });
      months.push(entry);
    }
    return months;
  }, [expenses, selectedDate]);

  // Monthly stats
  const currentMonthExps = expenses.filter((e) => e.date && isSameMonth(new Date(e.date), selectedDate));
  const total = currentMonthExps.reduce((s, e) => s + (e.amount || 0), 0);
  const avg = currentMonthExps.length > 0 ? total / currentMonthExps.length : 0;
  const maxExp = currentMonthExps.reduce((max, e) => (e.amount > (max?.amount || 0) ? e : max), null);

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
          <h1 className="text-2xl font-bold text-white">Report</h1>
          <p className="text-sm text-slate-500 mt-1">Analisi dettagliata delle tue uscite</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <MonthSelector currentDate={selectedDate} onChange={setSelectedDate} />
          <ExportButton expenses={currentMonthExps} label="Esporta Mese" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#1a1d27] border border-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Totale Mese</p>
          <p className="text-xl font-bold text-red-400 mt-1">€{total.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl bg-[#1a1d27] border border-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Media per Uscita</p>
          <p className="text-xl font-bold text-blue-400 mt-1">€{avg.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl bg-[#1a1d27] border border-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Uscita Maggiore</p>
          <p className="text-xl font-bold text-amber-400 mt-1">
            {maxExp ? `€${maxExp.amount?.toLocaleString("it-IT", { minimumFractionDigits: 2 })}` : "—"}
          </p>
          {maxExp && <p className="text-xs text-slate-500 mt-0.5 truncate">{maxExp.description}</p>}
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex gap-3 flex-wrap">
        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1d27] border-white/10">
            <SelectItem value="trend" className="text-slate-300 focus:bg-white/5 focus:text-white">Andamento</SelectItem>
            <SelectItem value="comparison" className="text-slate-300 focus:bg-white/5 focus:text-white">Confronto Mensile</SelectItem>
            <SelectItem value="stacked" className="text-slate-300 focus:bg-white/5 focus:text-white">Per Categoria</SelectItem>
          </SelectContent>
        </Select>
        {view === "trend" && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1d27] border-white/10">
              <SelectItem value="all" className="text-slate-300 focus:bg-white/5 focus:text-white">Tutte</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-slate-300 focus:bg-white/5 focus:text-white">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Charts */}
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[#1a1d27] border border-white/5 p-6"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {view === "trend" ? (
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" name="Totale" stroke="#10b981" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            ) : view === "comparison" ? (
              <BarChart data={comparisonData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" vertical={false} />
                <XAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="corrente" name="Mese Corrente" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precedente" name="Mese Precedente" fill="#60a5fa" radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            ) : (
              <AreaChart data={stackedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                <Tooltip content={<CustomTooltip />} />
                {Object.values(CATEGORY_LABELS).map((cat, i) => (
                  <Area
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    stackId="1"
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.4}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}