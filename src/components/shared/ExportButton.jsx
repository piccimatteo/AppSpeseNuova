import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function ExportButton({ expenses, label = "Esporta CSV" }) {
  const handleExport = () => {
    if (!expenses?.length) return;

    const headers = ["Data", "Descrizione", "Importo", "Categoria", "Ricorrente", "Condivisa con", "Note"];
    const rows = expenses.map((e) => [
      e.date,
      e.description,
      e.amount?.toFixed(2),
      CATEGORY_LABELS[e.category] || e.category,
      e.is_recurring ? "Sì" : "No",
      e.shared_with || "",
      e.notes || "",
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uscite_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!expenses?.length}
      className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white gap-2"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}