import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const COLORS = [
  { value: "#10b981", label: "Verde", class: "bg-emerald-500" },
  { value: "#60a5fa", label: "Blu", class: "bg-blue-400" },
  { value: "#a78bfa", label: "Viola", class: "bg-purple-400" },
  { value: "#fbbf24", label: "Giallo", class: "bg-amber-400" },
  { value: "#f87171", label: "Rosso", class: "bg-red-400" },
  { value: "#fb923c", label: "Arancione", class: "bg-orange-400" },
];

export default function GoalForm({ goal, onSubmit, onCancel }) {
  const [form, setForm] = useState(goal || {
    title: "",
    target_amount: "",
    current_amount: "",
    deadline: "",
    status: "in_corso",
    color: "#10b981",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      ...form,
      target_amount: parseFloat(form.target_amount) || 0,
      current_amount: parseFloat(form.current_amount) || 0,
    });
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-[#1a1d27] border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {goal ? "Modifica Obiettivo" : "Nuovo Obiettivo"}
        </h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Titolo *</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Es. Fondo emergenza, Vacanza..."
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs">Importo Obiettivo (€) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.target_amount}
              onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
              placeholder="0.00"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs">Importo Attuale (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.current_amount}
              onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
              placeholder="0.00"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs">Scadenza</Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs">Stato</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d27] border-white/10">
                <SelectItem value="in_corso" className="text-slate-300 focus:bg-white/5 focus:text-white">In Corso</SelectItem>
                <SelectItem value="completato" className="text-slate-300 focus:bg-white/5 focus:text-white">Completato</SelectItem>
                <SelectItem value="in_pausa" className="text-slate-300 focus:bg-white/5 focus:text-white">In Pausa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Colore</Label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm({ ...form, color: c.value })}
                className={`h-8 w-8 rounded-full transition-all ${c.class} ${
                  form.color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1d27] scale-110" : "opacity-60 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? "Salvataggio..." : goal ? "Aggiorna" : "Crea Obiettivo"}
          </Button>
        </div>
      </form>
    </div>
  );
}