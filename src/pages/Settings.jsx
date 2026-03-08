import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Trash2, LogOut, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user, logout } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await base44.auth.deleteAccount();
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">Impostazioni</h1>
        <p className="text-sm text-slate-500 mt-1">Gestisci il tuo account</p>
      </div>

      {/* Account section */}
      <div className="rounded-2xl bg-[#1a1d27] border border-white/5 p-5 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <User className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name || user?.email || "Utente"}</p>
            <p className="text-xs text-slate-500">{user?.email || "Account Firebase"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all select-none"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-300">Esci dall&apos;account</span>
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <p className="text-sm font-medium text-red-400">Zona Pericolosa</p>
        </div>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all select-none"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-400">Cancella tutti i dati</span>
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-300">
              Sei sicuro? Questa azione è irreversibile e cancellerà tutte le spese e gli obiettivi salvati.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmDelete(false)}
                variant="outline"
                size="sm"
                className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
              >
                Annulla
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleting}
                size="sm"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Eliminando..." : "Conferma Elimina"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
