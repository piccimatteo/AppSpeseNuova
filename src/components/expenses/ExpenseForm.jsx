import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

const CATEGORIES = [
  { value: "conto_risparmio", label: "Conto Risparmio" },
  { value: "tantum", label: "Tantum" },
  { value: "rata", label: "Rata" },
  { value: "spesa_ricorrente", label: "Spesa Ricorrente" },
  { value: "spesa_condivisa", label: "Spesa Condivisa" },
  { value: "bolletta", label: "Bolletta" },
  { value: "abbonamento", label: "Abbonamento" },
  { value: "altro", label: "Altro" },
];

export default function ExpenseForm({ expense, onSubmit, onCancel }) {
  const [form, setForm] = useState(expense || {
    description: "",
    amount: "",
    category: "altro",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    is_recurring: false,
    shared_with: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const base = { ...form, amount: parseFloat(form.amount) || 0 };

    // Se ricorrente con data fine, genera una spesa per ogni mese
    if (base.is_recurring && base.recurring_until && base.date && !expense) {
      const startDate = new Date(base.date);
      const [untilYear, untilMonth] = base.recurring_until.split("-").map(Number);
      const entries = [];
      let cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      while (
        cur.getFullYear() < untilYear ||
        (cur.getFullYear() === untilYear && cur.getMonth() + 1 <= untilMonth)
      ) {
        entries.push({
          ...base,
          date: cur.toISOString().split("T")[0],
        });
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, cur.getDate());
      }
      await onSubmit(entries);
    } else {
      await onSubmit(base);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-[#1a1d27] border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {expense ? "Modifica Uscita" : "Nuova Uscita"}
        </h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs">Descrizione *</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Es. Affitto, Netflix..."
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs">Importo (€) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs">Categoria *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d27] border-white/10">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-slate-300 focus:bg-white/5 focus:text-white">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs">Data *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Condivisa con</Label>
          <Input
            value={form.shared_with}
            onChange={(e) => setForm({ ...form, shared_with: e.target.value })}
            placeholder="Nome persona..."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Note</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Aggiungi note..."
            rows={2}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 resize-none"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch
              checked={form.is_recurring}
              onCheckedChange={(v) => setForm({ ...form, is_recurring: v, recurring_until: v ? form.recurring_until : "" })}
            />
            <Label className="text-sm text-slate-400">Spesa ricorrente</Label>
          </div>
          {form.is_recurring && (
            <div className="space-y-2 pl-2 border-l-2 border-emerald-500/30">
              <Label className="text-slate-400 text-xs">Ripeti fino a</Label>
              <Input
                type="month"
                value={form.recurring_until || ""}
                onChange={(e) => setForm({ ...form, recurring_until: e.target.value })}
                min={form.date ? form.date.slice(0, 7) : undefined}
                className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50 w-48"
              />
              {form.recurring_until && form.date && (
                <p className="text-xs text-emerald-500/70">
                  Verrà creata 1 spesa per ogni mese fino a {form.recurring_until}
                </p>
              )}
            </div>
          )}
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
            {loading ? "Salvataggio..." : expense ? "Aggiorna" : "Aggiungi"}
          </Button>
        </div>
      </form>
    </div>
  );
}