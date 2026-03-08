import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

import GoalCard from "@/components/goals/GoalCard";
import GoalForm from "@/components/goals/GoalForm";

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState("all");

  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => base44.entities.Goal.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueryData(["goals"]);
      queryClient.setQueryData(["goals"], (old = []) => [
        { ...newGoal, id: `temp-${Date.now()}` },
        ...old,
      ]);
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(["goals"], ctx.previous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueryData(["goals"]);
      queryClient.setQueryData(["goals"], (old = []) =>
        old.map((g) => (g.id === id ? { ...g, ...data } : g))
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(["goals"], ctx.previous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setShowForm(false);
      setEditingGoal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueryData(["goals"]);
      queryClient.setQueryData(["goals"], (old = []) => old.filter((g) => g.id !== id));
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(["goals"], ctx.previous),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const handleSubmit = async (data) => {
    if (editingGoal) {
      await updateMutation.mutateAsync({ id: editingGoal.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const filteredGoals = goals.filter((g) => {
    if (filter === "all") return true;
    if (filter === "active") return g.status === "in_corso";
    if (filter === "completed") return g.status === "completato";
    if (filter === "paused") return g.status === "in_pausa";
    return true;
  });

  const totalTarget = goals.reduce((s, g) => s + (g.target_amount || 0), 0);
  const totalCurrent = goals.reduce((s, g) => s + (g.current_amount || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

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
          <h1 className="text-2xl font-bold text-white">Obiettivi</h1>
          <p className="text-sm text-slate-500 mt-1">Raggiungi i tuoi traguardi finanziari</p>
        </div>
        <Button
          onClick={() => { setEditingGoal(null); setShowForm(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" /> Nuovo Obiettivo
        </Button>
      </div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-white/5 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <Target className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Progresso Complessivo</p>
              <p className="text-2xl font-bold text-white">{overallProgress}%</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-500">Risparmiato</p>
              <p className="text-lg font-semibold text-emerald-400">
                €{totalCurrent.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Obiettivo Totale</p>
              <p className="text-lg font-semibold text-white">
                €{totalTarget.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="h-3 bg-white/5 rounded-full mt-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
          />
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "Tutti" },
          { value: "active", label: "In Corso" },
          { value: "completed", label: "Completati" },
          { value: "paused", label: "In Pausa" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === f.value
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <GoalForm
              goal={editingGoal}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingGoal(null); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals grid */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-16">
          <Target className="h-12 w-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">Nessun obiettivo trovato</p>
          <p className="text-xs text-slate-600 mt-1">Crea il tuo primo obiettivo per iniziare</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={(g) => deleteMutation.mutate(g.id)}
              delay={i * 0.05}
            />
          ))}
        </div>
      )}
    </div>
  );
}