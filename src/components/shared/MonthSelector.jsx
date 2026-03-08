import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { it } from "date-fns/locale";

export default function MonthSelector({ currentDate, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(subMonths(currentDate, 1))}
        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 text-slate-400" />
      </button>
      <span className="text-sm font-medium text-white min-w-[140px] text-center capitalize">
        {format(currentDate, "MMMM yyyy", { locale: it })}
      </span>
      <button
        onClick={() => onChange(addMonths(currentDate, 1))}
        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </button>
    </div>
  );
}