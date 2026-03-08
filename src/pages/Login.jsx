import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Wallet, Mail, Lock, LogIn, UserPlus, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/Dashboard");
    } catch (err) {
      const msgs = {
        "auth/user-not-found": "Utente non trovato.",
        "auth/wrong-password": "Password errata.",
        "auth/invalid-credential": "Email o password non validi.",
        "auth/email-already-in-use": "Email già registrata.",
        "auth/weak-password": "La password deve avere almeno 6 caratteri.",
        "auth/invalid-email": "Indirizzo email non valido.",
      };
      setError(msgs[err.code] || "Errore di autenticazione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/Dashboard");
    } catch (_err) {
      setError("Accesso con Google non riuscito. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <style>{`
        :root { --bg-primary: #0f1117; }
        body { background: var(--bg-primary); }
      `}</style>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">MPfinTraker</h1>
          <p className="text-sm text-slate-500 mt-1">Gestione Finanze Personali</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#1a1d27] border border-white/5 p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "login"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => { setTab("login"); setError(""); }}
            >
              <LogIn className="h-4 w-4" />
              Accedi
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "register"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => { setTab("register"); setError(""); }}
            >
              <UserPlus className="h-4 w-4" />
              Registrati
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="tua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder={tab === "register" ? "Min. 6 caratteri" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : tab === "login" ? (
                "Accedi"
              ) : (
                "Crea account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-600">oppure</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-slate-300 font-medium"
          >
            <Chrome className="h-4 w-4" />
            Continua con Google
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          I tuoi dati sono sicuri e sincronizzati nel cloud.
        </p>
      </div>
    </div>
  );
}
